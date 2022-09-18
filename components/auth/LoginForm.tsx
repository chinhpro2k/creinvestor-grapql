import * as React from 'react';
import styled from '@emotion/styled';
import {
  Typography,
  Box,
  Fade,
  Slide,
  Paper,
  InputBase,
  Grid,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import { green } from '@mui/material/colors';
import useTrans from '@hooks/useTrans';

const BoxItem = styled(Box)`
  position: absolute;
  height: 100%;
  padding: 16px;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`;

const reducer = (prevState: any, updatedProperty: any) => ({
  ...prevState,
  // $FlowFixMe
  ...updatedProperty,
});

type Props = {
  _onSignin: () => void;
};

export const LoginForm = ({ _onSignin }: Props) => {
  const trans = useTrans();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasAuthError = false;
  const [state, setState] = React.useReducer(reducer, {
    email: '',
    errors: hasAuthError
      ? [trans.common['errorUnauthenticated']]
      : [],
    submitting: false,
    submitted: false,
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();
  };

  return (
    <>
      <Grid>
        <Box color="#fff" textAlign={{ xs: 'center', sm: 'initial' }}>
          <Typography variant={isMobile ? 'h6' : 'h4'} color="inherit">
            {trans.common['investmentPlatformLogin']}
          </Typography>
          <Typography
            variant={isMobile ? 'subtitle2' : 'subtitle1'}
            color="inherit"
            paragraph
          >
            {trans.common['requestMagicLink']}
          </Typography>
        </Box>
        <Paper
          component={Box}
          css={`
            position: relative;
            overflow: hidden;
          `}
        >
          <Fade enter={false} in={!state.submitted}>
            <form onSubmit={handleSubmit}>
              <Grid
                container
                css={`
                  min-height: 54px;
                `}
              >
                <Grid container item xs={12} sm={8}>
                  <InputBase
                    id="email"
                    type="email"
                    placeholder={trans.common['yourEmailAddress']}
                    value={state.email}
                    onChange={(event) =>
                      setState({ email: event.target.value, errors: [] })
                    }
                    autoFocus={!isMobile}
                    required={true}
                    variant="outlined"
                    readOnly={state.submitting}
                    fullWidth={true}
                    // error={state.errors[0] != null}
                    // helperText={state.errors[0] ?? ''}
                    css={`
                      padding: 12px 20px;
                    `}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  sm={4}
                  css={`
                    > div {
                      margin-right: -1px;
                    }
                  `}
                >
                  <Button variant="contained">Contained</Button>
                </Grid>
              </Grid>
            </form>
          </Fade>
          <Slide direction="left" in={state.submitted}>
            <BoxItem
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              css={`
                color: white;
                background-color: ${green.A700};
              `}
            >
              <Typography variant="subtitle1">
                {trans.common['authenticationLinkSent']}
              </Typography>
            </BoxItem>
          </Slide>
        </Paper>
        {/* {state.errors.length > 0 && (
          <Fade in mountOnEnter>
            <Box
              color={red[200]}
              mt={1}
              textAlign={{ xs: 'center', sm: 'initial' }}
            >
              {state.errors.map(error => (
                <Typography variant="body1" key={error}>
                  {error}
                </Typography>
              ))}
            </Box>
          </Fade>
        )}
        {state.submitted && (
          <Fade in mountOnEnter>
            <Box color="#fff" mt={1} textAlign={{ xs: 'center', sm: 'initial' }}>
              <Typography variant="body1">
                {trans.common['openYourEmailAndClickLogin']}{' '}
                {isGmail && (
                  <Link
                    color="inherit"
                    underline="always"
                    size="small"
                    target="_blank"
                    href="https://mail.google.com/mail/u/0/"
                  >
                    {trans.common['openGmail']}
                  </Link>
                )}
              </Typography>
              <Box mt={1} />
              <Typography variant="body2">
                {trans.common['didNotReceiveEmail'])}{' '}
                <Link
                  color="inherit"
                  underline="always"
                  size="small"
                  css={`
                    cursor: pointer;
                  `}
                  onClick={() => {
                    setState({
                      email: '',
                      errors: [],
                      submitting: false,
                      submitted: false,
                    });
                  }}
                >
                  {trans.common['tryAgain']}
                </Link>
              </Typography>
            </Box>
          </Fade>
        )}
        <Box color="#fff" mt={1} textAlign={{ xs: 'center', sm: 'initial' }}>
          <Typography variant="body2">
            {trans.common['notMemberYet']}{' '}
            <Link
              onClick={_onSignin}
              underline="always"
              color="inherit"
              css={`
                cursor: pointer;
              `}
            >
              {trans.common['requestAccess']}
            </Link>
          </Typography>
        </Box> */}
      </Grid>
    </>
  );
};
