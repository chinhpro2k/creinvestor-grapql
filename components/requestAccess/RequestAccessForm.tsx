import * as React from 'react';
import styles from './requestAccess.module.css';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Link,
  Button,
  TextField,
  Fade,
} from '@mui/material';
import { red } from '@mui/material/colors';
import useTrans from '@hooks/useTrans';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { get } from 'lodash';
import { useRouter } from 'next/router';

const CustomTextField = (props) => (
  <>
    <Box my={1}>
      <TextField
        fullWidth
        variant="filled"
        style={{
          borderRadius: '6px',
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}
        inputProps={{
          style: {
            paddingTop: '20px',
            paddingBottom: '6px',
            fontSize: '14px',
            color: '#2A2A2A',
          },
        }}
        {...props}
      />
    </Box>
    {props?.error && <p className={styles.errorText}>{props.error}</p>}
  </>
);

type Props = {
  showRequestAccessForm: () => void;
};

const RequestAccessSchema = Yup.object().shape({
  name: Yup.string().trim().required('Required field'),
  email: Yup.string().trim().email('Invalid email').required('Required field'),
  company: Yup.string().trim().required('Required field'),
  phone: Yup.string().trim().required('Required field'),
});

export const RequestAccessForm = ({ showRequestAccessForm }: Props) => {
  const trans = useTrans();
  const { locale } = useRouter();
  const [signupSent, setSignupSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const firstInput = React.useRef();
  const formik = useFormik({
    initialValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
    },
    validationSchema: RequestAccessSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + '/auth/signup',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': locale,
            },
            body: JSON.stringify(values),
          }
        );
        const data = await res.json();
        if (res.status === 201) {
          formik.resetForm();
          setErrors([]);
          setSignupSent(true);
        } else {
          setErrors(get(data, 'message', []));
        }
        setSubmitting(false);
      } catch (error) {
        setSubmitting(false);
        const message: string = (error as Error).message;
        setErrors([message]);
      }
    },
  });

  React.useEffect(() => {
    if (firstInput.current) firstInput.current.focus();
  }, []);

  return (
    <>
      <Grid>
        <Box color="#fff" textAlign={{ xs: 'center', sm: 'initial' }}>
          <Typography variant="h2" color="inherit" className={styles.pageTitle}>
            {trans.common['investmentPlatformAccess']}
          </Typography>
          {!signupSent && (
            <Typography
              variant={'subtitle1'}
              color="inherit"
              className={styles.pageSubTitle}
              mt={1}
            >
              {trans.common['weWillContactYouOnceYourRequestIsApproved']}
            </Typography>
          )}
        </Box>
        <Box mt={2} />
        {signupSent && (
          <>
            <Box>
              <div className={styles.accessRequestedBox}>
                <Typography
                  variant="body1"
                  align="center"
                  className={styles.accessRequested}
                >
                  {trans.common['accessRequested']}
                </Typography>
              </div>
            </Box>
            <Box my={2}>
              <Typography
                variant={'body1'}
                color="white"
                paragraph
                className={styles.thankYou}
                mb={1}
              >
                {trans.common['weWillContactYouOnceYourRequestIsApproved']}
              </Typography>
              <Typography
                variant="body2"
                color="white"
                className={styles.thankYou}
              >
                {trans.common['thankYouForYourPatience']}{' '}
              </Typography>
            </Box>
          </>
        )}
        {!signupSent && (
          <>
            <Paper
              component={Box}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'none',
              }}
            >
              <Box maxWidth={260}>
                <form onSubmit={formik.handleSubmit}>
                  <CustomTextField
                    required
                    inputRef={firstInput}
                    label="Name"
                    autoComplete="name"
                    onChange={formik.handleChange}
                    id="name"
                    defaultValue={formik.values.name}
                    error={formik.errors.name ? true : false}
                  />
                  <CustomTextField
                    required
                    label="Company"
                    autoComplete="organization"
                    onChange={formik.handleChange}
                    id="company"
                    defaultValue={formik.values.company}
                    error={formik.errors.company ? true : false}
                  />

                  <CustomTextField
                    required
                    type="email"
                    label="Email"
                    autoComplete="email"
                    onChange={formik.handleChange}
                    id="email"
                    defaultValue={formik.values.email}
                    error={formik.errors.email ? true : false}
                  />

                  <CustomTextField
                    required
                    type="tel"
                    label="Phone"
                    autoComplete="tel"
                    onChange={formik.handleChange}
                    id="phone"
                    defaultValue={formik.values.phone}
                    error={formik.errors.phone ? true : false}
                  />

                  {errors.length > 0 && (
                    <Fade in mountOnEnter>
                      <Box
                        color={red[200]}
                        mt={2}
                        textAlign={{ xs: 'center', sm: 'initial' }}
                      >
                        {errors.map((error) => (
                          <Typography variant="body1" key={error}>
                            {error}
                          </Typography>
                        ))}
                      </Box>
                    </Fade>
                  )}

                  <Box mt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      className={styles.requestBut}
                    >
                      {trans.common['requestAccess']}
                    </Button>
                  </Box>
                </form>
              </Box>
            </Paper>
            <Box
              color="#fff"
              mt={1}
              textAlign={{ xs: 'center', sm: 'initial' }}
            >
              <Typography variant="body2" className={styles.alreadyMember}>
                {trans.common['alreadyMember']}{' '}
                <Link
                  onClick={showRequestAccessForm}
                  underline="always"
                  color="inherit"
                  style={{ cursor: 'pointer' }}
                >
                  {trans.common['logIn']}
                </Link>
              </Typography>
            </Box>
          </>
        )}
      </Grid>
    </>
  );
};
