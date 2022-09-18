import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TextField, MenuItem, Alert } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';

import { LanguageOptions, LANGUAGE_ENUM } from '@model/accountSetting.model';
import { LANGUAGE_OPTIONS } from '@utils/constant';
import useTrans from '@hooks/useTrans';
import { Auth } from '@utils/auth';
import { parseJwt } from '@utils/common';
import { GET_USER_DETAILS, UPDATE_USER } from '@graphql/user-query';

import AvatarUploader from '@components/AvatarUploader';
import LoadingWrapper from '@components/wrapper/LoadingWrapper';

const auth = new Auth();

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 30px;
  .title {
    font-size: 30px;
    font-weight: 700;
    padding: 0px 7px;
    width: 100%;
    border-bottom: 1px solid #3455d1;
  }
  .section {
    padding-top: 48px;
    .section-title {
      font-size: 24px;
      font-weight: 500;
      line-height: 28px;
    }
    .sub-title {
      margin: 16px 0px;
      font-size: 18px;
      font-weight: 400;
    }
    .control-group {
      margin-top: 16px;
      display: flex;
      flex-direction: row;
      .small {
        width: 150px;
        height: 150px;
        margin-right: 40px;
      }
      .big {
        width: 100%;
        display: flex;
        flex-direction: column;
        .no-padding {
          padding: 0;
        }
      }
      .default {
        width: 100%;
      }
      .form-control {
        padding-top: 20px;
      }
      .control {
        width: 100%;
        border-color: #3455d1;
        .Mui-focused,
        .MuiFormLabel-colorPrimary {
          color: #3455d1;
        }
        fieldset {
          border: 2px solid #3455d1;
        }
      }
      .error-msg {
        color: red;
        padding-top: 5px;
      }
    }
    .submit-btn {
      border-radius: 93px;
      padding: 16px;
      background-color: #3455d1;
      color: #ffffff;
    }
  }
`;

const Account: React.FC = () => {
  const trans = useTrans();
  const [userImage, setUserImage] = useState<string>('');
  const [isUploadError, setIsUploadError] = useState<boolean>(false);
  const [isSaveAccountError, setIsSaveAccountError] = useState<boolean>(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState<boolean>(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);
  const user = auth.getUser();
  const decodedUserInfo = parseJwt(user.token);
  const userInfoQuery = useQuery(GET_USER_DETAILS, {
    variables: {
      id: decodedUserInfo.sub,
    },
  });
  const [insert] = useMutation(UPDATE_USER);

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (userInfoQuery?.data) {
      const userInfo = userInfoQuery.data?.users[0];
      if (userInfo) {
        setValue('firtName', userInfo.first_name);
        setValue('lastName', userInfo.last_name);
        setValue('jobTitle', userInfo.job_title);
        setValue('email', userInfo.email);
        setValue('officePhone', userInfo.office_phone);
        setValue('mobilePhone', userInfo.mobile_phone);
        setValue('language', userInfo.language || LANGUAGE_ENUM.ENGLISH + '');
        setUserImage(userInfo.image);
      }
    }
  }, [userInfoQuery]);

  const onSubmit = (data: any) => {
    setIsSaveAccountError(false);
    setIsSaveSuccess(false);
    insert({
      variables: {
        id: decodedUserInfo.sub,
        usersSetInput: {
          first_name: data.firtName,
          last_name: data.lastName,
          language: data.language,
          job_title: data.jobTitle,
          email: data.email,
          office_phone: data.officePhone,
          mobile_phone: data.mobilePhone,
        },
      },
      onCompleted: () => {
        setIsSaveSuccess(true);
      },
      onError: () => {
        setIsSaveAccountError(true);
      },
    });
  };

  return (
    <>
      <LoadingWrapper queryStatus={userInfoQuery}>
        <ContentWrapper>
          {isUploadError && (
            <Alert severity="error">
              {trans.common['errorWhenSaveAccountPhoto']}
            </Alert>
          )}

          {isUploadSuccess && (
            <Alert severity="success" style={{ marginTop: '5px' }}>
              {trans.common['uploadImageSuccess']}
            </Alert>
          )}

          <form onSubmit={handleSubmit((data: any) => onSubmit(data))}>
            <div className="title">{`${trans.common['accountSetting']}`}</div>
            <div className="section">
              <div className="section-title">
                {`${trans.common['basicInfomation']}`}
              </div>
              <div className="control-group">
                <div className="small">
                  <AvatarUploader
                    userImage={userImage}
                    userId={decodedUserInfo.sub}
                    setIsUploadError={setIsUploadError}
                    setIsUploadSuccess={setIsUploadSuccess}
                  />
                </div>
                <div className="big">
                  <div className="form-control no-padding">
                    <Controller
                      render={({ field: { _ref, ...field } }: any) => (
                        <TextField
                          label={`${trans.common['firstName']}*`}
                          type={'text'}
                          className="control"
                          {...field}
                          autoFocus
                          inputProps={{ maxLength: 50 }}
                        />
                      )}
                      name="firtName"
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message: `${trans.common['pleaseFilloutThisField']}`,
                        },
                        validate: (value) => {
                          return !!value.trim();
                        },
                      }}
                      defaultValue=""
                    />
                    {errors.firtName && (
                      <p className="error-msg">{errors.firtName.message}</p>
                    )}
                    {errors.firtName && errors.firtName.type === 'validate' && (
                      <div className="error-msg">
                        {`${trans.common['pleaseFilloutThisField']}`}
                      </div>
                    )}
                  </div>
                  <div className="form-control">
                    <Controller
                      render={({ field: { _ref, ...field } }: any) => (
                        <TextField
                          label={`${trans.common['lastName']}*`}
                          type={'text'}
                          className="control"
                          {...field}
                          inputProps={{ maxLength: 50 }}
                        />
                      )}
                      name="lastName"
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message: `${trans.common['pleaseFilloutThisField']}`,
                        },
                        validate: (value) => {
                          return !!value.trim();
                        },
                      }}
                      defaultValue=""
                    />
                    {errors.lastName && (
                      <p className="error-msg">{errors.lastName.message}</p>
                    )}
                    {errors.lastName && errors.lastName.type === 'validate' && (
                      <div className="error-msg">
                        {`${trans.common['pleaseFilloutThisField']}`}
                      </div>
                    )}
                  </div>
                  <div className="form-control">
                    <Controller
                      render={({ field: { _ref, ...field } }: any) => (
                        <TextField
                          label={`${trans.common['jobTitle']}*`}
                          type={'text'}
                          className="control"
                          {...field}
                          inputProps={{ maxLength: 50 }}
                        />
                      )}
                      name="jobTitle"
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message: `${trans.common['pleaseFilloutThisField']}`,
                        },
                        validate: (value) => {
                          return !!value.trim();
                        },
                      }}
                      defaultValue=""
                    />
                    {errors.jobTitle && (
                      <p className="error-msg">{errors.jobTitle.message}</p>
                    )}
                    {errors.jobTitle && errors.jobTitle.type === 'validate' && (
                      <div className="error-msg">
                        {`${trans.common['pleaseFilloutThisField']}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="section">
              <div className="section-title">Contact informations</div>
              <div className="control-group ">
                <div className="big">
                  <div className="form-control no-padding">
                    <Controller
                      render={({ field: { _ref, ...field } }: any) => (
                        <TextField
                          label={`${trans.common['email']}*`}
                          type={'text'}
                          className="control"
                          {...field}
                        />
                      )}
                      name="email"
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message: `${trans.common['pleaseFilloutThisField']}`,
                        },
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      defaultValue=""
                    />
                    {errors.email && (
                      <p className="error-msg">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="sub-title">
                    {`${trans.common['pleaseFillAtLeastOnePhoneNumber']}`}
                  </div>
                  <div className="">
                    <Controller
                      render={({ field: { _ref, ...field } }: any) => (
                        <TextField
                          label={`${trans.common['officePhone']}*`}
                          type={'number'}
                          className="control"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                        />
                      )}
                      name="officePhone"
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message: `${trans.common['pleaseFilloutThisField']}`,
                        },
                      }}
                      defaultValue=""
                    />
                    {errors.officePhone && (
                      <p className="error-msg">{errors.officePhone.message}</p>
                    )}
                  </div>
                  <div className="form-control">
                    <Controller
                      render={({ field: { _ref, ...field } }: any) => (
                        <TextField
                          label={`${trans.common['mobilePhone']}`}
                          type={'number'}
                          className="control"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                        />
                      )}
                      name="mobilePhone"
                      control={control}
                      defaultValue=""
                    />
                  </div>
                  <div className="form-control">
                    <Controller
                      render={({ field: { _ref, ...field } }: any) => (
                        <TextField
                          select
                          label={`${trans.common['language']}`}
                          className="control"
                          {...field}
                        >
                          {LANGUAGE_OPTIONS.map(
                            (language: LanguageOptions, index: number) => (
                              <MenuItem key={index} value={language.value}>
                                {language.label}
                              </MenuItem>
                            )
                          )}
                        </TextField>
                      )}
                      name="language"
                      control={control}
                      defaultValue={LANGUAGE_ENUM.ENGLISH}
                    />
                  </div>
                </div>
                <div className="small"></div>
              </div>
            </div>
            <div className="section">
              <LoadingButton
                type="submit"
                variant="outlined"
                className="submit-btn"
              >
                {trans.common['saveMyInfomartion']}
              </LoadingButton>
            </div>
          </form>
          {isSaveAccountError && (
            <Alert severity="error" style={{ marginTop: '10px' }}>
              {trans.common['errorWhenSaveAccountData']}
            </Alert>
          )}
          {isSaveSuccess && (
            <Alert severity="success" style={{ marginTop: '10px' }}>
              {trans.common['updateAccountSuccess']}
            </Alert>
          )}
        </ContentWrapper>
      </LoadingWrapper>
    </>
  );
};

export default Account;
