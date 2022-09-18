import * as React from "react";
import styled from "@emotion/styled";
import styles from "./login.module.css";
import {
  Typography,
  Box,
  Fade,
  Slide,
  Paper,
  InputBase,
  Grid,
  Link,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import { red } from "@mui/material/colors";
import useTrans from "@hooks/useTrans";
import { useRouter } from "next/router";

const reducer = (prevState: any, updatedProperty: any) => ({
  ...prevState,
  // $FlowFixMe
  ...updatedProperty,
});

type Props = {
  showRequestAccessForm: () => void;
};

export const LoginForm = ({ showRequestAccessForm }: Props) => {
  const trans = useTrans();
  const theme = useTheme();
  const { locale } = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const hasAuthError = false;
  const [state, setState] = React.useReducer(reducer, {
    email: "",
    errors: hasAuthError
      ? [trans.common["errorUnauthenticated"]]
      : [],
    submitting: false,
    submitted: false,
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      setState({
        submitting: true,
        errors: [],
      });
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          email: state.email,
        }),
      });
      const data = await res.json();
      if (res.status === 400) {
        setState({
          submitting: false,
          errors: data?.message ? [data.message] : [],
        });
      } else {
        setState({ submitted: true });
      }
    } catch (error) {
      setState({
        submitting: false,
        errors: [trans.common["authenticationFailed"]],
      });
    }
  };

  return (
    <>
      <Grid>
        <Box color="#fff" textAlign={{ xs: "center", sm: "initial" }}>
          <Typography
            variant="h2"
            color="inherit"
            className={styles.loginTitle}
          >
            {trans.common["investmentPlatformLogin"]}
          </Typography>
          {!state.submitted && state.errors.length === 0 && (
            <Typography
              variant="subtitle1"
              color="inherit"
              paragraph
              className={styles.requestMagicLink}
            >
              {trans.common["requestMagicLink"]}
            </Typography>
          )}
        </Box>
        <Paper
          component={Box}
          style={{
            position: "relative",
            overflow: "hidden",
            background: "none",
            boxShadow: "initial",
          }}
        >
          {!state.submitted && state.errors.length === 0 && (
            <Fade enter={false} in={!state.submitted}>
              <form onSubmit={handleSubmit}>
                <Grid container className={styles.loginWrapperGrid}>
                  <Grid
                    container
                    item
                    xs={12}
                    sm={8}
                    className={styles.loginWrapperGridLeft}
                  >
                    <InputBase
                      id="email"
                      type="email"
                      placeholder={trans.common["yourEmailAddress"]}
                      value={state.email}
                      onChange={(event) =>
                        setState({ email: event.target.value, errors: [] })
                      }
                      autoFocus={!isMobile}
                      required={true}
                      readOnly={state.submitting}
                      fullWidth={true}
                      style={{
                        padding: "12px 20px",
                        height: "52px",
                        lineHeight: "52px",
                      }}
                      // error={state.errors[0] != null}
                      // helperText={state.errors[0] ?? ''}
                    />
                  </Grid>
                  <Grid container item xs={12} sm={4}>
                    <Button
                      disabled={state.submitting}
                      variant="contained"
                      style={{ width: "100%" }}
                      className={styles.loginBut}
                      type="submit"
                    >
                      {trans.common["logIn"]}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Fade>
          )}
          {state.submitted && (
            <Slide
              direction="left"
              in={state.submitted}
              style={{ marginTop: "10px" }}
            >
              <div className={styles.authenticationLinkSentBox}>
                <Typography
                  variant="subtitle1"
                  className={styles.authenticationLinkSent}
                >
                  {trans.common["authenticationLinkSent"]}
                </Typography>
              </div>
            </Slide>
          )}
        </Paper>
        {state.errors.length > 0 && (
          <Fade in mountOnEnter>
            <Box color={red[200]} textAlign={{ xs: "center", sm: "initial" }}>
              <div className={styles.errorFromServer}>
                {state.errors.map((error: any) => (
                  <Typography
                    variant="body1"
                    key={error}
                    className={styles.authenticationLinkSent}
                    style={{ lineHeight: "61px", color: "#DD3944" }}
                  >
                    {error}
                  </Typography>
                ))}
              </div>
            </Box>
          </Fade>
        )}
        {state.submitted && (
          <Fade in mountOnEnter>
            <Box
              color="#fff"
              mt={1}
              textAlign={{ xs: "center", sm: "initial" }}
            >
              <Typography
                variant="body1"
                className={styles.openYourEmailAndClickLogin}
              >
                {trans.common["openYourEmailAndClickLogin"]}
              </Typography>
              <Box mt={1} />
              <Typography variant="body2" className={styles.requestAccessLink}>
                {trans.common["didNotReceiveEmail"]}{" "}
                <Link
                  color="inherit"
                  underline="always"
                  size="small"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setState({
                      email: "",
                      errors: [],
                      submitting: false,
                      submitted: false,
                    });
                  }}
                >
                  {trans.common["tryAgain"]}.
                </Link>
              </Typography>
            </Box>
          </Fade>
        )}
        {(state.errors.length > 0 || !state.submitted) && (
          <Box color="#fff" mt={1} textAlign={{ xs: "center", sm: "initial" }}>
            {state.errors.length > 0 && (
              <Typography variant="body2" className={styles.requestAccessLink}>
                {trans.common["onlyApprovedMembersCanLogInToAccess"]}
              </Typography>
            )}
            <Typography variant="body2" className={styles.requestAccessLink}>
              {trans.common["notMemberYet"]}{" "}
              <Link
                onClick={() => {
                  setState({
                    email: "",
                    errors: [],
                    submitting: false,
                    submitted: false,
                  });
                  showRequestAccessForm();
                }}
                underline="always"
                color="inherit"
                style={{ cursor: "pointer" }}
              >
                {trans.common["requestAccess"]}.
              </Link>
            </Typography>
          </Box>
        )}
      </Grid>
    </>
  );
};
