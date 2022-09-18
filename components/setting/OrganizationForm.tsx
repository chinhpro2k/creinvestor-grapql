import {useLazyQuery, useMutation, useQuery} from '@apollo/client';
import {GENERATE_SIGNED_URL} from '@graphql/deal-details';
import {
  GET_ORGANIZATION_DETAILS,
  INSERT_IMAGE_ORGANIZATION,
  UPDATE_ORGANIZATION,
} from '@graphql/setting-organization';
import {DELETE_USER, INVITE_USERS} from '@graphql/user';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Modal,
  TextField,
  Typography
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {Auth} from '@utils/auth';
import {parseJwt} from '@utils/common';
import {
  getCountryCode,
  getCountryName,
  getOrgUserFullName,
  checkShowLimitSendInviteEmails,
} from '@utils/settings';
import countries from 'country-list/data.json';
import {useFormik} from 'formik';
import {get, isArray, isString, omit} from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {Organisation} from 'types/organization';
import {RawOrgUser} from 'types/setting';
import * as Yup from 'yup';
import {CloseIcon} from './CloseIcon';
import useTrans from '@hooks/useTrans';
import {useRouter} from 'next/router';

const activatedInputLabel = {
  color: '#3455D1',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '16px',
  letterSpacing: '0.4px',
  // fontFamily: 'Roboto',
  '-webkitTransform': 'translate(14px, -9px) scale(1)',
  '-mozTransform': 'translate(14px, -9px) scale(1)',
  '-msTransform': 'translate(14px, -9px) scale(1)',
  transform: 'translate(14px, -9px) scale(1)',
};
const useStyles = makeStyles(() => ({
  root: {
    // '& .MuiFormLabel-root': {
    //   color: 'rgba(0, 0, 0, 0.6)',
    // },
    '& .MuiFormLabel-root[data-shrink="true"]': activatedInputLabel,
    '& .MuiFormLabel-root.Mui-focused': activatedInputLabel,
    //'& .MuiOutlinedInput-input:focus': activatedInput,
    // '& .MuiOutlinedInput-root': {
    //   '&.Mui-focused fieldset': activatedInput,
    // },
  },
}));

const CustomTextField = (props: any) => {
  const classes = useStyles();
  const {errorStr, ...reProps} = props;
  return (
    <>
      <Box>
        <TextField
          fullWidth
          id="outlined-required"
          className={`${classes.root}`}
          {...reProps}
        />
      </Box>
      {errorStr && <p className="errorText">{errorStr}</p>}
    </>
  );
};

const auth = new Auth();
const limitEmails = 6;

export const OrganizationForm = () => {
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [inviteErrors, setInviteErrors] = React.useState<string[]>([]);
  const [inviteSuccessMessage, setSuccessMessage] = useState<string>('');
  const [inviteEmails, setInviteEmails] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');
  const [organisationId, setOrganisationId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const {locale = 'en'} = useRouter();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const inputFile = useRef(null);
  const [avatarId, setAvatarId] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [deletedUserId, setDeletedUserId] = useState<string>('');
  const [uploading, setUploading] = React.useState(false);
  const trans = useTrans();
  const requiredText = trans.common['pleaseFilloutThisField'];
  const FormSchema = Yup.object().shape({
    name: Yup.string().trim().required(requiredText),
    website: Yup.string()
      .trim()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        trans.common['pleaseFillOutValidUrl']
      ),
    street: Yup.string().trim().required(requiredText),
    streetNr: Yup.string().required(requiredText),
    city: Yup.string().trim().required(requiredText),
    postcode: Yup.string().required(requiredText),
    countryName: Yup.string().required(requiredText),
  });

  useEffect(() => {
    const tmpUSer = auth.getUser();
    if (tmpUSer && get(tmpUSer, 'token')) {
      const tokenData = parseJwt(tmpUSer.token);
      setIsAdmin(get(tokenData, 'is_admin', false));
      setOrganisationId(
        tokenData['https://hasura.io/jwt/claims']['x-hasura-organisation-id']
      );
      setUserId(tokenData['https://hasura.io/jwt/claims']['x-hasura-user-id']);
    }
  }, []);
  const [generateSignedUrl] = useMutation(GENERATE_SIGNED_URL);
  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION);
  const [insertImageOrganization] = useMutation(INSERT_IMAGE_ORGANIZATION);
  const [deleteUser] = useMutation(DELETE_USER);
  const [inviteUsers] = useMutation(INVITE_USERS);
  const [getOrganization, {loading, error, data, refetch}] = useLazyQuery(GET_ORGANIZATION_DETAILS, {
    variables: {
      organisation_id: organisationId,
    },
  });
  useEffect(() => {
    console.log("vao organization")
    getOrganization().then()
  }, [organisationId])
  const organization = get(data ? data : [], 'organisations[0]', {});
  const organisationTypes = get(data ? data : [], 'organisation_types', []);
  let initData: Organisation = {
    name: get(organization, 'name', ''),
    website: get(organization, 'website_url')
      ? get(organization, 'website_url', '')
      : '',
    street: get(organization, 'street') ? get(organization, 'street', '') : '',
    streetNr: get(organization, 'street_nr')
      ? get(organization, 'street_nr', '')
      : '',
    city: get(organization, 'city') ? get(organization, 'city', '') : '',
    postcode: get(organization, 'postcode')
      ? get(organization, 'postcode', '')
      : '',
    countryName: getCountryName(countries, get(organization, 'country')) || '',
    organisationTypeId: get(organization, 'organisation_type_id', 0),
    organisationType: get(organization, 'organisation_type')
  };
  const hideErrors = (afterMiliSeconds: number) => {
    const handleTimeout = setTimeout(() => {
      setErrors([]);
      clearTimeout(handleTimeout);
    }, afterMiliSeconds);
  };

  const hideInviteErrors = (afterMiliSeconds: number) => {
    const handleTimeout = setTimeout(() => {
      setInviteErrors([]);
      clearTimeout(handleTimeout);
    }, afterMiliSeconds);
  };
  const hideInviteSuccessMessage = (afterMiliSeconds: number) => {
    const handleTimeout = setTimeout(() => {
      setSuccessMessage('');
      clearTimeout(handleTimeout);
    }, afterMiliSeconds);
  };

  const hideSaveSuccessMessage = (afterMiliSeconds: number) => {
    const handleTimeout = setTimeout(() => {
      setSaveSuccessMessage('');
      clearTimeout(handleTimeout);
    }, afterMiliSeconds);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initData,
    validationSchema: FormSchema,
    onSubmit: async (values) => {
      const input = {
        ...omit(values, ['countryName', 'website', 'streetNr', 'organisationTypeId', 'organisationType']),
        website_url: get(values, 'website'),
        street_nr: get(values, 'streetNr'),
        primary_image_id: avatarId ? avatarId : get(organization, 'image.id'),
        country: getCountryCode(countries, get(values, 'countryName', '')),
        organisation_type_id: get(values, 'organisationTypeId'),
      };
      try {
        setSubmitting(true);
        updateOrganization({
          variables: {
            id: get(organization, 'id'),
            input,
          },
          onCompleted(res) {
            if (get(res, 'update_organisations.affected_rows', 0) === 1) {
              setSaveSuccessMessage(trans.common['updateOrganisationSuccess']);
              hideSaveSuccessMessage(10000);
              setErrors([]);
            } else {
              setErrors(get(data, 'message', []));
              hideErrors(10000);
            }
            setSubmitting(false);
          },
          onError: (_err) => {
            setErrors([trans.common['cannotUpdateOrganisation']]);
            hideErrors(10000);
            setSubmitting(false);
          },
        });
      } catch (_error) {
        setSubmitting(false);
        const message: string = (_error as Error).message;
        setErrors([message]);
        hideErrors(10000);
      }
    },
  });

  let list: RawOrgUser[] = get(organization, 'users', []);

  const handleDeleteUser = () => {
    try {
      setSubmitting(true);
      deleteUser({
        variables: {
          id: deletedUserId,
        },
        onCompleted(res) {
          if (get(res, 'delete_users.affected_rows', 0) === 1) {
            refetch();
            setErrors([]);
          } else {
            setErrors(get(data, 'message', []));
            hideErrors(10000);
          }
          setSubmitting(false);
        },
        onError: (_err) => {
          setErrors([trans.common['cannotDeleteUser']]);
          hideErrors(10000);
          setSubmitting(false);
        },
      });
    } catch (_error) {
      setSubmitting(false);
      const message: string = (_error as Error).message;
      setErrors([message]);
      hideErrors(10000);
    }
    setOpen(false);
  };

  const checkEmailsErrors = async (value: string, errorMessage: string) => {
    if (/\s/.test(value)) {
      return errorMessage;
    }
    const emails = value?.split(',');
    const validEmail = Yup.string().trim().email('Invalid email');
    for (const email of emails) {
      const isValid = await validEmail.isValid(email);
      if (!isValid) {
        return errorMessage;
      }
    }
    return '';
  };

  const handleSendInviteEmails = async () => {
    setInviteErrors([]);
    setSuccessMessage('');
    const errorStr = await checkEmailsErrors(
      inviteEmails,
      trans.common['pleaseFillOutValidEmail']
    );
    if (errorStr) {
      setInviteErrors([errorStr]);
      hideInviteErrors(10000);
      return;
    }
    const emails = inviteEmails;
    if (!emails) return false;
    if (
      emails &&
      (emails as string).split(',').length + list.length >= limitEmails
    ) {
      const tmpErrorStr = trans.common['inviteErrorWithExistedUsers'];
      setInviteErrors([
        tmpErrorStr.replace(
          '{numberOfPeople}',
          (limitEmails - list.length).toString()
        ),
      ]);
      hideInviteErrors(10000);
      return false;
    }
    try {
      setSubmitting(true);
      inviteUsers({
        variables: {
          email: emails?.split(','),
        },
        onCompleted() {
          setInviteEmails('');
          refetch();
          setInviteErrors([]);
          setSubmitting(false);
          setSuccessMessage(trans.common['inviteSuccessfully']);
          hideInviteSuccessMessage(10000);
        },
        onError: ({message}) => {
          setInviteErrors([message]);
          hideInviteErrors(10000);
          setSubmitting(false);
          setSuccessMessage('');
        },
      });
    } catch (_error) {
      setSubmitting(false);
      const message: string = (_error as Error).message;
      setInviteErrors([message]);
      hideInviteErrors(10000);
      setSuccessMessage('');
    }
  };

  const uploadMessageError = trans.common['uploadFileError'];
  const onChangeFile = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    if (file.type.indexOf('image/') === -1) {
      setErrors([trans.common['onlyCanUploadImages']]);
      hideErrors(10000);
      return;
    }
    setSubmitting(true);
    setUploading(true);
    await generateSignedUrl({
      variables: {
        name: file.name,
        type: file.type,
        bucket: 'images',
      },
      onCompleted(res) {
        const signedUrl = res?.generateSignedUrl?.url;
        fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        }).then(({status, url}) => {
          if (status !== 200) {
            setErrors([uploadMessageError]);
            hideErrors(10000);
            setSubmitting(false);
            setUploading(false);
            return false;
          }
          const urlFormat = url.split('?')[0];
          insertImageOrganization({
            variables: {
              url: urlFormat,
              organisation_id: get(organization, 'id'),
            },
            onCompleted(_res) {
              setAvatarId(get(_res, 'insert_images_one.id'));
              setAvatarUrl(get(_res, 'insert_images_one.url'));
              setSubmitting(false);
              setUploading(false);
            },
            onError: (_err) => {
              setErrors([trans.common['cannotSaveImageOrganisation']]);
              hideErrors(10000);
              setSubmitting(false);
              setUploading(false);
            },
          });
        });
      },
      onError: (_err) => {
        setErrors([uploadMessageError]);
        hideErrors(10000);
        setSubmitting(false);
        setUploading(false);
      },
    });
  };

  // @ts-ignore
  return (
    <div className="layout-right">
      <div className="title-header titleHeaderOrg">
        <h2>{trans.common['organizationSettings']}</h2>
      </div>
      {!loading && error && (
        <Alert severity="error">
          {trans.common['errorWhenGettingDataFromServer']}
        </Alert>
      )}

      {loading && (
        <Box
          sx={{position: 'relative'}}
          style={{left: '48%', top: '40%', position: 'absolute'}}
        >
          <CircularProgress/>
        </Box>
      )}
      {!loading && !error && (
        <div className="basicInfoOrg">
          {isArray(errors) && errors.length > 0 && (
            <Alert severity="error" style={{marginBottom: '30px'}}>
              {errors[0]}
            </Alert>
          )}

          {isString(errors) && errors && (
            <Alert severity="error" style={{marginBottom: '30px'}}>
              {errors}
            </Alert>
          )}
          <h3>{trans.common['basicInformations']}</h3>
          <form onSubmit={formik.handleSubmit}>
            <div className="basicInfoOrgRow">
              {get(organization, 'image.url') && !avatarUrl && (
                <div className="basicInfoAvatarOrgWrapper">
                  <div
                    className="basicInfoAvatarOrg"
                    style={{
                      backgroundImage: `url(${get(organization, 'image.url')})`,
                      border: 0,
                    }}
                    onClick={() => {
                      if (uploading) return;
                      inputFile.current.click();
                    }}
                  />
                  {uploading && (
                    <Box sx={{width: '100%', marginTop: '20px'}}>
                      <LinearProgress/>
                    </Box>
                  )}
                </div>
              )}
              {avatarUrl && (
                <div className="basicInfoAvatarOrgWrapper">
                  <div
                    className="basicInfoAvatarOrg"
                    style={{
                      backgroundImage: `url(${avatarUrl})`,
                      border: 0,
                    }}
                    onClick={() => {
                      if (uploading) return;
                      inputFile.current.click();
                    }}
                  />
                  {uploading && (
                    <Box sx={{width: '100%', marginTop: '20px'}}>
                      <LinearProgress/>
                    </Box>
                  )}
                </div>
              )}
              {!get(organization, 'image.url') && !avatarUrl && (
                <div className="basicInfoAvatarOrgWrapper">
                  <div
                    className="basicInfoAvatarOrg"
                    onClick={() => {
                      if (uploading) return;
                      inputFile.current.click();
                    }}
                  />
                  {uploading && (
                    <Box sx={{width: '100%', marginTop: '20px'}}>
                      <LinearProgress/>
                    </Box>
                  )}
                </div>
              )}
              <input
                id="avatar"
                accept="image/*"
                type="file"
                ref={inputFile}
                style={{display: 'none'}}
                onChange={onChangeFile}
              />

              <div className="inputMaxWidthWrapper">
                <CustomTextField
                  required
                  label={trans.common['name']}
                  name="name"
                  defaultValue={initData.name}
                  helperText=""
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldTouched('name', true);
                    formik.handleChange(e);
                  }}
                  className={`${
                    formik.values.name ? 'textInputWrapperHasData' : ''
                  }`}
                  errorStr={formik.touched.name ? formik.errors.name : ''}
                />
                <div style={{marginTop: '20px'}}>
                  <CustomTextField
                    id="outlined-required"
                    label={trans.common['website']}
                    defaultValue={initData.website}
                    name="website"
                    onChange={(e: any) => {
                      formik.setFieldTouched('website', true);
                      formik.handleChange(e);
                    }}
                    className={`${
                      formik.values.website ? 'textInputWrapperHasData' : ''
                    }`}
                    errorStr={
                      formik.touched.website ? formik.errors.website : ''
                    }
                  />
                </div>
                <Grid container spacing={2} className="mt11">
                  <Grid item xs={12} lg={12}>
                    <Autocomplete
                      freeSolo
                      disableClearable
                      options={organisationTypes.map((option: any) => ({
                        id: option.id,
                        label: option['label_' + locale] || option['label_en']
                      }))}
                      value={(initData.organisationType ? initData.organisationType['label_' + locale] : '') || initData.organisationType?.label_en}
                      onChange={(_e, values) => {
                        formik.setFieldTouched('organisationTypeId', true);
                        formik.setFieldValue('organisationTypeId', values?.id);
                      }}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          label={trans.common['organizationType']}
                          required
                          helperText=""
                          name="organisationType"
                          className={`${
                            formik.values.organisationTypeId
                              ? 'textInputWrapperHasData'
                              : ''
                          }`}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            formik.setFieldTouched('organisationTypeId', true);
                            formik.handleChange(e);
                          }}
                        />
                      )}
                    />
                    {formik.touched.organisationTypeId && formik.errors.organisationTypeId && (
                      <p className="errorText">{formik.errors.organisationTypeId}</p>
                    )}
                  </Grid>
                </Grid>
              </div>
            </div>

            <div>
              <h3 className="mt48">{trans.common['address']}</h3>
              <Grid container spacing={2} className="mt11">
                <Grid item xs={12} lg={9}>
                  <CustomTextField
                    required
                    label={trans.common['street']}
                    defaultValue={initData.street}
                    name="street"
                    helperText=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldTouched('street', true);
                      formik.handleChange(e);
                    }}
                    className={`${
                      formik.values.street ? 'textInputWrapperHasData' : ''
                    }`}
                    errorStr={formik.touched.street ? formik.errors.street : ''}
                  />
                </Grid>
                <Grid item xs={12} lg={3}>
                  <CustomTextField
                    required
                    label={trans.common['number']}
                    name="streetNr"
                    defaultValue={initData.streetNr}
                    helperText=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldTouched('streetNr', true);
                      formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                    className={`${
                      formik.values.streetNr ? 'textInputWrapperHasData' : ''
                    }`}
                    errorStr={
                      formik.touched.streetNr ? formik.errors.streetNr : ''
                    }
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} className="mt11">
                <Grid item xs={12} lg={9}>
                  <CustomTextField
                    required
                    // id="outlined-required"
                    label={trans.common['city']}
                    name="city"
                    defaultValue={initData.city}
                    helperText=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldTouched('city', true);
                      formik.handleChange(e);
                    }}
                    className={`${
                      formik.values.city ? 'textInputWrapperHasData' : ''
                    }`}
                    errorStr={formik.touched.city ? formik.errors.city : ''}
                  />
                </Grid>
                <Grid item xs={12} lg={3}>
                  <CustomTextField
                    required
                    id="outlined-required"
                    label={trans.common['postCode']}
                    name="postcode"
                    defaultValue={initData.postcode}
                    helperText=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldTouched('postcode', true);
                      formik.handleChange(e);
                    }}
                    className={`${
                      formik.values.postcode ? 'textInputWrapperHasData' : ''
                    }`}
                    errorStr={
                      formik.touched.postcode ? formik.errors.postcode : ''
                    }
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} className="mt11">
                <Grid item xs={12} lg={9}>
                  <Autocomplete
                    freeSolo
                    disableClearable
                    options={countries.map((option) => option.name)}
                    value={formik.values.countryName}
                    onChange={(_e, values) => {
                      formik.setFieldTouched('countryName', true);
                      formik.setFieldValue('countryName', values);
                    }}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        label={trans.common['country']}
                        required
                        helperText=""
                        name="countryName"
                        className={`${
                          formik.values.countryName
                            ? 'textInputWrapperHasData'
                            : ''
                        }`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          formik.setFieldTouched('countryName', true);
                          formik.handleChange(e);
                        }}
                      />
                    )}
                  />
                  {formik.touched.countryName && formik.errors.countryName && (
                    <p className="errorText">{formik.errors.countryName}</p>
                  )}
                </Grid>
              </Grid>
            </div>

            <div>
              <h3 className="mt48">{trans.common['userManagement']}</h3>
              <Grid
                container
                spacing={2}
                className={list.length < limitEmails && isAdmin ? 'mt16' : ''}
              >
                <Grid item xs={12} lg={9}>
                  {list.length < limitEmails && isAdmin && (
                    <CustomTextField
                      label={trans.common['inviteUpTo5PeopleWithTheirEmail']}
                      value={inviteEmails}
                      helperText=""
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInviteEmails(e.target.value)
                      }
                      disabled={list.length >= limitEmails || submitting}
                      className={`${
                        inviteEmails ? 'textInputWrapperHasData' : ''
                      }`}
                      name="invitingEmails"
                      errorStr={''}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendInviteEmails();
                          return false;
                        }
                      }}
                    />
                  )}
                  {checkShowLimitSendInviteEmails(
                    formik,
                    list,
                    limitEmails
                  ) && (
                    <p className="errorText">
                      {trans.common['youAlreadyInvited5People']}
                    </p>
                  )}
                  {isArray(inviteErrors) && inviteErrors.length > 0 && (
                    <p className="errorText">{inviteErrors[0]}</p>
                  )}
                  {inviteSuccessMessage && (
                    <Alert severity="success" style={{marginTop: '5px'}}>
                      {inviteSuccessMessage}
                    </Alert>
                  )}
                  <div className="regions orgListUsers">
                    <div className="list-suggest">
                      {list.map((value, i) => {
                        return (
                          <div className="item-suggest" key={i}>
                            <div className="name-item">
                              <p>
                                {getOrgUserFullName(value, userId, ' (you)')}
                              </p>
                              <span>{get(value, 'email')}</span>
                            </div>
                            {isAdmin && userId !== get(value, 'id') && (
                              <div
                                className="close"
                                onClick={() => {
                                  setDeletedUserId(value.id);
                                  handleOpen();
                                }}
                              >
                                <CloseIcon/>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Grid>
              </Grid>

              {isAdmin && (
                <button
                  className="btn-save btnSave"
                  type="submit"
                  disabled={submitting}
                  style={{marginBottom: '0'}}
                >
                  {trans.common['saveOrganizationInfo']}
                </button>
              )}
              {saveSuccessMessage && (
                <Alert severity="success" style={{marginTop: '10px'}}>
                  {saveSuccessMessage}
                </Alert>
              )}
            </div>
          </form>
          <Modal
            keepMounted
            open={open}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
          >
            <Box className="modalBoxContent">
              <div
                className="modalCloseBut"
                onClick={() => {
                  setOpen(false);
                }}
              />
              <Typography
                id="keep-mounted-modal-title"
                variant="h6"
                component="h2"
                className="modalTitle"
              >
                Delete User
                <Typography
                  id="keep-mounted-modal-description"
                  sx={{mt: 2}}
                  className="modalContent"
                >
                  {trans.common['areYouSureWantDeleteThisUser']}
                </Typography>
              </Typography>
              <div className="btnWrapper mt32">
                <Button
                  variant="contained"
                  className="btnYes"
                  onClick={() => handleClose()}
                >
                  {trans.common['no']}
                </Button>
                <Button
                  variant="contained"
                  className="btnYes"
                  onClick={() => handleDeleteUser()}
                >
                  {trans.common['yes']}
                </Button>
              </div>
            </Box>
          </Modal>
        </div>
      )}
    </div>
  );
};
