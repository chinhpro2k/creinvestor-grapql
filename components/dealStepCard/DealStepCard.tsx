import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import moment from 'moment';
import Card from '@mui/material/Card';
import styles from './DealStepCard.module.css';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector';
import StepLabel, { stepLabelClasses } from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { StepIconProps } from '@mui/material/StepIcon';
import { styled } from '@mui/material/styles';
import {
  GENERATE_SIGNED_URL,
  FILE_CREATE_MUTATION,
  SUBMIT_FILE_V_ONE,
} from '@graphql/deal-details';
import {
  getFileTypeStatus,
  getFileTypeStatusWhenDownload,
} from '../card/card-item.utils';
import { DropzoneArea } from 'material-ui-dropzone';
import completedIcon from '../../public/images/completed_icon.png';
import CircularProgress from '@mui/material/CircularProgress';
import { get, isEmpty, isArray, isObject, uniqBy, isNull } from 'lodash';
import {
  DEAL_STATUS_VALUE,
  FILE_TYPE,
} from '@constants/card-item.constants';
import Loading from '@components/loading/Loading';
import { downloadFile, downloadFilesAsZip } from '@utils/common';
import { REQUEST_NDA_SIGNED } from '@graphql/requestNDASigned';
import { useRouter } from 'next/router';
import Image from 'next/image';
import useTrans from '@hooks/useTrans';
import { LOCAL_STORAGE_KEYS } from '@utils/constant';
import { UserActionDealModel } from '@model/userActionDeal.model';

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#EDF5FE',
  zIndex: 1,
  width: 48,
  height: 48,
  display: 'flex',
  borderRadius: '50%',
  transform: ' translateX(-12px)',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: 'white',
    border: '2px solid#3455D1',
  }),
  ...(ownerState.completed && {
    backgroundColor: '#3455D1',
  }),
}));

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
    marginTop: '-8px',
    marginBottom: '-8px',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#3455D1',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#3455D1',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#EDF5FE',
    borderTopWidth: 3,
    borderRadius: 1,
    width: '20px',
    marginTop: '-18px',
    marginBottom: '-16px',
    borderLeftWidth: 2,
    minHeight: '71px',
  },
}));

const ColorlibStepLabel = styled(StepLabel)(() => ({
  [`& .${stepLabelClasses.label}`]: {
    [`&.${stepLabelClasses.completed}`]: {
      color: '#3455D1',
      padding: '0px 24px',
      gap: ' 10px',
      width: ' 364px',
      height: '48px',
      background: '#EDF5FE',
      borderRadius: ' 100px',
      display: ' flex',
      alignItems: 'center',
    },
  },
}));

function ColorlibStepIcon(props: StepIconProps, activeStepCard: number) {
  const { active, completed, className } = props;
  const arrayData = activeStepCard
    ? Array(activeStepCard).fill(
        <Image src={completedIcon.src} width={20.94} height={15.75} alt="" />
      )
    : [];
  const icons: { [index: string]: React.ReactElement } = arrayData.reduce(
    (previousValue, currentValue, currentIndex) => ({
      ...previousValue,
      [currentIndex + 1]: currentValue,
    }),
    {}
  );
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const getIsBindingOffer = (dealId: string) => {
  const content = window.localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ACTION_ON_DEAL);
  const userActionOnDeals: UserActionDealModel[] = content ? JSON.parse(content) : [];
  const userActionDeal = userActionOnDeals.find(ua => ua.dealId === dealId);
  return userActionDeal?.isInterestedOnBindingOffer
}

const getIsClosing = (dealId: string) => {
  const content = window.localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ACTION_ON_DEAL);
  const userActionOnDeals: UserActionDealModel[] = content ? JSON.parse(content) : [];
  const userActionDeal = userActionOnDeals.find(ua => ua.dealId === dealId);
  return userActionDeal?.isInterestedOnClosing
}

const saveUserActionInterested = (dealId: string, isInterestedOnBindingOffer: boolean, isInterestedOnClosing: boolean) => {
  const content = window.localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ACTION_ON_DEAL);
  const userActionOnDeals: UserActionDealModel[] = content ? JSON.parse(content) : [];
  const userActionDeal = userActionOnDeals.find(ua => ua.dealId === dealId);

  if (userActionDeal) {
    const index = userActionOnDeals.indexOf(userActionDeal);
    userActionOnDeals[index] = {
      ...userActionDeal,
      isInterestedOnBindingOffer,
      isInterestedOnClosing
    }
  } else {
    userActionOnDeals.push({
      dealId,
      isInterestedOnBindingOffer,
      isInterestedOnClosing
    })
  }
  window.localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ACTION_ON_DEAL, JSON.stringify(userActionOnDeals));
}


const DealStepCard: React.FC = ({
  deal,
  _renderRoundClosingDay,
  _renderDeadlineDateTime,
  activeStepCard,
  setActiveStepCard,
  updateLeadInterested,
  fileByDealId,
  refetch,
}: any) => {
  const trans = useTrans();
  const { id, closing_date } = deal;

  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [openModalCommon, setOpenModalCommon] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [isBindingOffer, setIsBindingOffer] = useState(getIsBindingOffer(id));

  const handleOnClickIsBindingOffer = () => {
    setIsBindingOffer(true);
    saveUserActionInterested(id, true, false);
  }

  const handleOnClickIsClosing = () => {
    setIsClosing(true);
    saveUserActionInterested(id, true, true);
  }


  const [isClosing, setIsClosing] = useState(getIsClosing(id));
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCloseModalCommon = () => setOpenModalCommon(false);
  const handleOpenModalCommon = () => setOpenModalCommon(true);

  const fileTypeStatus =
    activeStepCard > 0 ? getFileTypeStatus(activeStepCard) : '';

  const fileInfor = fileByDealId?.filter(
    (e: any) =>
      fileTypeStatus.includes(e.fileType?.type) &&
      (e.fileType?.group === 'ORGANISATION' || e.fileType?.group === 'DEAL')
  );

  const [isEditSubmission, setIsEditSubmission] = useState(!isEmpty(fileInfor));
  const calendlyUrl = get(deal, 'calendly_url', '');

  const initFileData = () => {
    if (!isEmpty(fileInfor)) {
      return fileInfor.map((e: any) => ({
        name: e?.filename,
        fileType: e?.fileType?.type,
      }));
    }
    return [];
  };

  const [fileNonBindingOffer, setFileNonBindingOffer] = useState(
    initFileData()
  );
  const [submitPayload, setSubmitPayload] = useState();

  const handleEditSubmission = () => {
    setIsEditSubmission(false);
  };

  const handleDownloadFile = (fileName: string) => {
    const _fileTypeStatus = getFileTypeStatusWhenDownload(activeStepCard);
    const fileInforFilterd = fileByDealId?.filter(
      (e: any) =>
        _fileTypeStatus.includes(e.fileType?.type) &&
        (e.fileType?.group === 'ORGANISATION' || e.fileType?.group === 'DEAL')
    );

    if (!isEmpty(fileInforFilterd) && fileInforFilterd.length === 1) {
      const { url, mimetype, filename } = fileInforFilterd[0];
      downloadFile(url, mimetype, filename);
    } else if (!isEmpty(fileInforFilterd) && fileInforFilterd.length > 1) {
      const filesInforFormat = uniqBy(fileInforFilterd, 'fileType.type').map(
        ({ url, mimetype, filename }) => ({
          fileName: filename,
          url,
          mimetype,
        })
      );
      downloadFilesAsZip(filesInforFormat, fileName);
    }
  };

  const hanldeNoLongerInterested = () => {
    updateLeadInterested({
      variables: {
        dealId: id,
        isInterested: false,
        refusalReasonText: '',
        refusalReasonIds: [],
      },
      onCompleted(_res: any) {
        setActiveStepCard(null);
        saveUserActionInterested(id, false, false)
        refetch();
      },
    });
  };

  const [generateSignedUrl] = useMutation(GENERATE_SIGNED_URL);

  const [fileCreateMutation] = useMutation(FILE_CREATE_MUTATION);
  const [submitFileVOne] = useMutation(SUBMIT_FILE_V_ONE);

  const handleOnChangeFile = (files: any) => {
    if (files && files.length) {
      setFileNonBindingOffer(files);
    }
  };

  const handleOnChangeClosingFile = (files: any, fileType: string) => {
    if (!isEmpty(files)) {
      const { name, size, type } = files[0];
      const fileFormat = { name, size, type, fileType };
      setFileNonBindingOffer([...fileNonBindingOffer, fileFormat]);
    }
  };

  const getClosingFileInfor = (type: string) => {
    if (!isEmpty(fileNonBindingOffer)) {
      return fileNonBindingOffer.filter((e: any) => e.fileType === type);
    }
    return null;
  };

  const removeClosingFile = (type: string) => {
    if (!isEmpty(fileNonBindingOffer)) {
      setFileNonBindingOffer(
        fileNonBindingOffer.filter((e: any) => e.fileType !== type)
      );
    }
  };

  const submitClosingFiles = async () => {
    const lfaieInfor = getClosingFileInfor(FILE_TYPE.LFAIE);
    getClosingFileInfor(FILE_TYPE.POWER_OF_ATTORNY);

    setLoadingState(true);
    getUrlFromGoogleStorage(lfaieInfor[0], FILE_TYPE.LFAIE);
  };

  const removeFile = () => {
    setFileNonBindingOffer([]);
  };

  const getUrlFromGoogleStorage = (fileData: any, fileType: string = '') => {
    generateSignedUrl({
      variables: {
        name: fileData?.name,
        type: fileData?.type,
        bucket: 'files',
      },
      onCompleted: async function (res) {
        const signedUrl = res?.generateSignedUrl?.url;
        fetch(signedUrl, {
          method: 'PUT',
          body: fileData,
          headers: {
            'Content-Type': fileData?.type,
          },
        }).then(({ status, url }) => {
          if (status !== 200) throw new Error('Upload file error');
          const { name, type, size } = fileData;
          const urlFormat = url.split('?')[0];
          const signedFormat = {
            url: urlFormat,
            filename: name,
            mimetype: type,
            size: size,
          };
          if (!isEmpty(fileType)) {
            const appendData = submitPayload ? submitPayload : [];
            setSubmitPayload([
              ...appendData,
              {
                ...signedFormat,
                type: fileType,
              },
            ]);
          } else {
            setSubmitPayload(signedFormat);
          }
        });
      },
    });
  };

  useEffect(() => {
    if (
      !isEmpty(submitPayload) &&
      isArray(submitPayload) &&
      submitPayload.length == 1
    ) {
      const powerOfAttorny = getClosingFileInfor(FILE_TYPE.POWER_OF_ATTORNY);
      setLoadingState(true);
      getUrlFromGoogleStorage(powerOfAttorny[0], FILE_TYPE.POWER_OF_ATTORNY);
    } else if (
      !isEmpty(submitPayload) &&
      isArray(submitPayload) &&
      submitPayload.length == 2
    ) {
      submitFileVOne({
        variables: {
          dealId: id,
          files: submitPayload,
        },
        onCompleted() {
          setIsEditSubmission(true);
          setLoadingState(false);
          refetch();
        },
      });
    } else if (!isEmpty(submitPayload) && isObject(submitPayload)) {
      fileCreateMutation({
        variables: {
          dealId: id,
          ...submitPayload,
        },
        onCompleted() {
          setIsEditSubmission(true);
          setLoadingState(false);
          refetch();
        },
      });
    }
  }, [submitPayload]);

  const submitNonBindingOffer = (fileData: any) => {
    setLoadingState(true);
    getUrlFromGoogleStorage(fileData);
  };

  const handleSendEmail = () => {
    const { userByOwnerId } = deal;
    window.open(`mailto:${userByOwnerId?.email}`);
  };

  //=========================REQUEST_NDA_SIGNED===============
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [insert] = useMutation(REQUEST_NDA_SIGNED, {
    onCompleted: (_data) => {
      setIsLoading(false);
      if (_data && _data.requestNDASigned) {
        const url = _data.requestNDASigned.redirectUrl;
        router.push(`${url}`);
      }
    },
    onError: (_err) => {
      setIsLoading(false);
    },
  });
  const nonDisclosureAgreement = () => {
    const appendDescription = (
      <span>
        Please download and sign the non-disclosure agreement to have full
        access.
      </span>
    );
    const handleSigninNDA = () => {
      setIsLoading(true);
      if (id) {
        insert({
          variables: {
            dealId: id,
          },
        });
      }
    };
    return (
      <div className={styles.dealCard}>
        <Card variant="outlined" style={{ border: 'none', width: '100%' }}>
          <h2>Non-Disclosure Agreement</h2>
          {_renderRoundClosingDay()}
          {_renderDeadlineDateTime(appendDescription)}
          <div className={styles.btnDownload}>
            <Button
              variant="contained"
              className={styles.btn_nonDiscloAgree}
              onClick={() => handleDownloadFile('NDA-Teaser')}
            >
              <span
                className="icon-download_icon"
                style={{ marginRight: '12px', fontSize: '20px' }}
              />
              Download NDA & Teaser
            </Button>
          </div>
          <div className={styles.btnSign}>
            {isLoading ? (
              <Button variant="outlined" className={styles.btn_downloadNDA}>
                <CircularProgress size={20} />
              </Button>
            ) : (
              <Button
                variant="outlined"
                className={styles.btn_downloadNDA}
                onClick={handleSigninNDA}
              >
                <span
                  className="icon-edit_icon"
                  style={{ marginRight: '12px', fontSize: '20px' }}
                />
                Sign the NDA with DocuSign
              </Button>
            )}
          </div>
          <div className={styles.textBottom} onClick={handleOpen}>
            Cannot use DocuSign?
          </div>
          <Modal
            keepMounted
            open={open}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
          >
            <Box className={styles.modalDiscloAgreeWrapper}>
              <div
                className={styles.closeUseSignModelIcon}
                onClick={() => {
                  setOpen(false);
                }}
              />
              <Typography
                id="keep-mounted-modal-title"
                variant="h6"
                component="h2"
              >
                Cannot use DocuSign
                <Typography id="keep-mounted-modal-description" sx={{ mt: 2 }}>
                  If you have trouble using DocuSign, you can directly send the
                  signed documents the broker by email.
                </Typography>
              </Typography>
              <div className={styles.btnDownload}>
                <Button
                  variant="contained"
                  className={styles.btn_nonDiscloAgree}
                  onClick={handleSendEmail}
                >
                  <span className={styles.nonDiscloAgreeEmailIcon} />
                  Send files to the broker by email
                </Button>
              </div>
            </Box>
          </Modal>
        </Card>
      </div>
    );
  };

  const thankyouText = (
    <div className={styles.noteText}>
      <span>
        Thank you for your interest, a broker will be reviewing your NBO
        shortly.
      </span>
    </div>
  );
  const nonBindingOffer = () => {
    const appendDescription = (
      <div className={styles.listFolder}>
        <span>Please download the following folder containing: </span>
        <ul>
          <li>SalesMemo</li>
          <li>Building plan</li>
          <li>Commercial Register</li>
          <li>Rental status</li>
        </ul>
      </div>
    );

    const createAt =
      fileInfor && fileInfor?.length ? fileInfor[0].created_at : '';

    return (
      <div className={styles.dealCard}>
        <Card variant="outlined" style={{ border: 'none', width: '100%' }}>
          <h2>Non-Binding Offer</h2>
          {_renderRoundClosingDay(null, true)}
          {!isEditSubmission && (
            <>
              {_renderDeadlineDateTime(appendDescription)}
              <div
                className={styles.btnDownload}
                style={{ marginBottom: '12px' }}
              >
                <Button
                  variant="contained"
                  className={styles.btn_nonDiscloAgree}
                  onClick={() => handleDownloadFile('NBO documents')}
                >
                  <span
                    className="icon-download_icon"
                    style={{ marginRight: '12px', fontSize: '20px' }}
                  ></span>
                  Download the documents
                </Button>
              </div>
              {isEmpty(fileNonBindingOffer) ? (
                <>
                  <div className={styles.uploadFile}>
                    <DropzoneArea
                      showAlerts={false}
                      showPreviews={false}
                      showFileNamesInPreview={false}
                      showPreviewsInDropzone={false}
                      useChipsForPreview={false}
                      showFileNames={false}
                      previewGridProps={{
                        container: { spacing: 1, direction: 'row' },
                      }}
                      dropzoneClass="dropZoneWrapper"
                      dropzoneParagraphClass={styles.dropZone}
                      previewText="Selected files"
                      dropzoneText="Upload your Non-Binding Offer here"
                      onChange={handleOnChangeFile}
                    />
                  </div>
                  <div
                    className={`${styles.textBottom} mt18`}
                    onClick={handleOpenModalCommon}
                  >
                    Cannot upload files?
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.appendedFile}>
                    {!isEmpty(fileNonBindingOffer) &&
                      get(fileNonBindingOffer[0], 'name')}
                    <span
                      className={styles.appendedFileRemoveIcon}
                      onClick={removeFile}
                    />
                  </div>
                  <button
                    onClick={() =>
                      submitNonBindingOffer(fileNonBindingOffer[0])
                    }
                    className={styles.submitFileBut}
                  >
                    Submit
                  </button>
                </>
              )}
            </>
          )}
          {isEditSubmission && (
            <>
              {_renderDeadlineDateTime(thankyouText)}
              <div className={styles.editSubmission}>
                <span className="icon-upload_icon"></span>
                <div
                  className={styles.editSubmissText}
                  onClick={handleEditSubmission}
                >
                  Edit submission
                </div>
                <div className={styles.noteText}>
                  Uploaded the{' '}
                  {createAt && moment(createAt).format('MM.DD.YY [at] h:mm a')}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  };

  const bindingOffer = () => {
    const createAt =
      fileInfor && fileInfor?.length ? fileInfor[0].created_at : '';
    return (
      <div className={styles.dealCard}>
        <Card variant="outlined" style={{ border: 'none', width: '100%' }}>
          <h2>Binding Offer</h2>
          {_renderRoundClosingDay(null, true)}
          {!isEditSubmission && (
            <>
              {_renderDeadlineDateTime()}
              {!isBindingOffer && isEmpty(fileInfor) && (
                <div>
                  <div className={styles.noteTextContainer}>
                    <span className={styles.noteText}>
                      Are you still interested by this property?
                    </span>
                  </div>
                  <div className={styles.btnDownload}>
                    <Button
                      variant="contained"
                      className={styles.btn_nonDiscloAgree}
                      onClick={handleOnClickIsBindingOffer}
                    >
                      Yes, I am still interested
                    </Button>
                  </div>
                  <div className={styles.btnSign}>
                    <Button
                      variant="outlined"
                      color="error"
                      className={styles.btn_nonDiscloAgreeNotPrimary}
                      onClick={hanldeNoLongerInterested}
                    >
                      No, I am no longer interested
                    </Button>
                  </div>
                </div>
              )}
              {isBindingOffer && !isEditSubmission && (
                <div className={styles.stillBindingOffer}>
                  <div className={styles.textBinding}>
                    Schedule a visit and do your Due Dilligence by visiting the
                    dataroom in the{' '}
                    <Link href="#documents">
                      <a
                        style={{
                          color: '#3455D1',
                          textDecoration: 'underline',
                        }}
                      >
                        documents tab.
                      </a>
                    </Link>
                  </div>
                  <div className={styles.textBinding}>
                    You can ask questions directly in the{' '}
                    <Link href="#qa">
                      <a
                        style={{
                          color: '#3455D1',
                          textDecoration: 'underline',
                        }}
                      >
                        QAs tab
                      </a>
                    </Link>
                  </div>
                  {calendlyUrl ? (
                    <div
                      className={styles.visit}
                      onClick={() => {
                        Calendly.showPopupWidget(calendlyUrl);
                      }}
                    >
                      <p>{trans.common['bookAVisit']}</p>
                      <span className="icon-icon-calendar-blue"></span>
                    </div>
                  ) : (
                    <div className={`${styles.visit} ${styles.emptyVisit}`} />
                  )}
                  {isEmpty(fileNonBindingOffer) ? (
                    <>
                      <div className={styles.uploadFile}>
                        <DropzoneArea
                          showAlerts={false}
                          showPreviews={false}
                          showFileNamesInPreview={false}
                          showPreviewsInDropzone={false}
                          useChipsForPreview={false}
                          showFileNames={false}
                          previewGridProps={{
                            container: { spacing: 1, direction: 'row' },
                          }}
                          dropzoneClass="dropZoneWrapper"
                          dropzoneParagraphClass={styles.dropZone}
                          previewText="Selected files"
                          dropzoneText="Upload your Binding Offer here"
                          onChange={handleOnChangeFile}
                        />
                      </div>
                      <div
                        className={`${styles.textBottom} mt18`}
                        onClick={handleOpenModalCommon}
                      >
                        Cannot upload files?
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.appendedFile}>
                        {!isEmpty(fileNonBindingOffer) &&
                          get(fileNonBindingOffer[0], 'name')}
                        <span
                          className={styles.appendedFileRemoveIcon}
                          onClick={removeFile}
                        />
                      </div>
                      <button
                        onClick={() =>
                          submitNonBindingOffer(fileNonBindingOffer[0])
                        }
                        className={styles.submitFileBut}
                      >
                        Submit
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
          {isEditSubmission && (
            <>
              {_renderDeadlineDateTime(thankyouText)}
              {calendlyUrl ? (
                <div
                  className={styles.visit}
                  onClick={() => {
                    Calendly.showPopupWidget(calendlyUrl);
                  }}
                >
                  <p>{trans.common['bookAVisit']}</p>
                  <span className="icon-icon-calendar-blue"></span>
                </div>
              ) : (
                <div className={`${styles.visit} ${styles.emptyVisit}`} />
              )}
              <div className={styles.editSubmission}>
                <span className="icon-upload_icon"></span>
                <div
                  className={styles.editSubmissText}
                  onClick={() => handleEditSubmission()}
                >
                  Edit submission
                </div>
                <div className={styles.noteText}>
                  Uploaded the{' '}
                  {createAt && moment(createAt).format('MM.DD.YY [at] h:mm a')}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  };

  const closing = () => {
    const closingDescription = (
      <div className={styles.listFolder}>
        <span>
          Please download the documents and complete the following actions:
        </span>
        <ul>
          <li>Upload your LFAIE</li>
          <li>Fill and upload the Power of Attorny</li>
          <li>Review the Selling Act</li>
        </ul>
      </div>
    );

    const lfaieInfor = getClosingFileInfor(FILE_TYPE.LFAIE);
    const powerOfAttorny = getClosingFileInfor(FILE_TYPE.POWER_OF_ATTORNY);

    const dateDeadline = new Date(closing_date);
    const closingCountDate =
      closing_date && new Date() < dateDeadline
        ? Math.ceil(
            (dateDeadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
          )
        : 0;

    const createAt =
      fileInfor && fileInfor?.length ? fileInfor[0].created_at : '';

    const thankyouText = (
      <>
        <div className={styles.signatureDate}>
          <span>
            Signature date:{' '}
            {createAt && moment(createAt).format('MM.DD.YY [at] h:mm a')}
          </span>
        </div>
        <div className={styles.noteText}>
          <span>
            Thank you for your interest, a broker will be reviewing your
            document shortly.
          </span>
        </div>
      </>
    );

    return (
      <div className={styles.dealCard}>
        <Card variant="outlined" style={{ border: 'none', width: '100%' }}>
          <h2>Closing</h2>

          {!isClosing && (
            <>
              <p
                className={styles.round_closing_days}
                style={{ background: 'none' }}
              >
                {closingCountDate} days of exclusivity left
              </p>
              <div className={styles.noteTextContainer}>
                <span className={styles.noteText}>
                  Please confirm your interest in buying this property
                </span>
              </div>
              <div className={styles.btnDownload}>
                <Button
                  variant="contained"
                  className={styles.btn_nonDiscloAgree}
                  onClick={handleOnClickIsClosing}
                >
                  Yes, I am still interested
                </Button>
              </div>
              <div className={styles.btnSign}>
                <Button
                  variant="outlined"
                  color="error"
                  className={styles.btn_nonDiscloAgreeNotPrimary}
                  onClick={hanldeNoLongerInterested}
                >
                  No, I am no longer interested
                </Button>
              </div>
            </>
          )}
          {isClosing && !isEditSubmission && (
            <>
              <p
                className={styles.round_closing_days}
                style={{ background: 'none' }}
              >
                {closingCountDate} days of exclusivity left
              </p>
              <div className={styles.textBlue}>Signature date: TBD</div>
              {_renderDeadlineDateTime(closingDescription)}
              <div className={styles.noteText} style={{ marginTop: '20px' }}>
                If you want discuss modifications, please{' '}
                <a
                  href="#"
                  style={{ color: '#3455D1', textDecoration: 'underline' }}
                >
                  contact the broker
                </a>
              </div>
              <div className={styles.btnDownload}>
                <Button
                  variant="contained"
                  className={styles.btn_nonDiscloAgree}
                  onClick={() => handleDownloadFile('PoA-Selling-Act')}
                >
                  <span
                    className="icon-download_icon"
                    style={{ marginRight: '12px', fontSize: '20px' }}
                  ></span>
                  Download PoA &amp; Selling Act
                </Button>
              </div>
              {isEmpty(lfaieInfor) ? (
                <div
                  className={styles.uploadFile}
                  style={{ margin: '12px 0px' }}
                >
                  <DropzoneArea
                    showAlerts={false}
                    showPreviews={false}
                    showFileNamesInPreview={false}
                    showPreviewsInDropzone={false}
                    useChipsForPreview={false}
                    showFileNames={false}
                    previewGridProps={{
                      container: { spacing: 1, direction: 'row' },
                    }}
                    dropzoneClass="dropZoneWrapper"
                    dropzoneParagraphClass={styles.dropZone}
                    previewText="Selected files"
                    dropzoneText="Upload your LFAIE here"
                    onChange={(e) =>
                      handleOnChangeClosingFile(e, FILE_TYPE.LFAIE)
                    }
                  />
                </div>
              ) : (
                <div
                  className={styles.appendedFile}
                  style={{
                    marginBottom: '12px',
                    fontSize: '16px',
                  }}
                >
                  {get(lfaieInfor[0], 'name')}
                  <span
                    className={styles.appendedFileRemoveIcon}
                    onClick={() => removeClosingFile(FILE_TYPE.LFAIE)}
                  />
                </div>
              )}

              {isEmpty(powerOfAttorny) ? (
                <div className={styles.uploadFile}>
                  <DropzoneArea
                    showAlerts={false}
                    showPreviews={false}
                    showFileNamesInPreview={false}
                    showPreviewsInDropzone={false}
                    useChipsForPreview={false}
                    showFileNames={false}
                    previewGridProps={{
                      container: { spacing: 1, direction: 'row' },
                    }}
                    dropzoneClass="dropZoneWrapper"
                    dropzoneParagraphClass={styles.dropZone}
                    previewText="Selected files"
                    dropzoneText="Upload the PoA here"
                    onChange={(e) =>
                      handleOnChangeClosingFile(e, FILE_TYPE.POWER_OF_ATTORNY)
                    }
                  />
                </div>
              ) : (
                <div className={styles.appendedFile}>
                  {get(powerOfAttorny[0], 'name')}
                  <span
                    className={styles.appendedFileRemoveIcon}
                    onClick={() =>
                      removeClosingFile(FILE_TYPE.POWER_OF_ATTORNY)
                    }
                  />
                </div>
              )}

              {!isEmpty(lfaieInfor) && !isEmpty(powerOfAttorny) ? (
                <button
                  onClick={() => submitClosingFiles()}
                  className={styles.submitFileBut}
                >
                  Submit
                </button>
              ) : (
                <div
                  className={`${styles.textBottom} mt18`}
                  onClick={handleOpenModalCommon}
                >
                  Cannot upload files?
                </div>
              )}
            </>
          )}
          {isClosing && isEditSubmission && (
            <>
              {_renderRoundClosingDay(null, true)}
              {_renderDeadlineDateTime(thankyouText)}
              <div className={styles.editSubmission}>
                <span className="icon-upload_icon"></span>
                <div
                  className={styles.editSubmissText}
                  onClick={handleEditSubmission}
                >
                  Edit submission
                </div>
                <div className={styles.noteText}>
                  Uploaded the{' '}
                  {createAt && moment(createAt).format('MM.DD.YY [at] h:mm a')}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  };

  const steps = [
    {
      label: 'Non-Disclosure Agreement',
      description: nonDisclosureAgreement(),
    },
    {
      label: 'Non-Binding Offer',
      description: nonBindingOffer(),
    },
    {
      label: 'Binding Offer',
      description: bindingOffer(),
    },
    {
      label: 'Closing',
      description: closing(),
    },
  ];

  function isCalendlyEvent(e: any) {
    return e.data.event && e.data.event.indexOf('calendly') === 0;
  }

  useEffect(() => {
    const handlerBookAInvitation = (e: any) => {
      if (isCalendlyEvent(e)) {
        const event = get(e.data, 'event');
        const uri = get(e.data, 'payload.event.uri');
        if (event === 'calendly.event_scheduled' && uri) {
          // book url call to server to save data calendar start time and end time
          // console.log(uri);
        }
      }
    };

    window.addEventListener('message', handlerBookAInvitation);

    return () => {
      window.removeEventListener('message', handlerBookAInvitation);
    };
  }, []);
  return (
    <>
      <Loading open={loadingState} />
      <div className={styles.verticalStepper}>
        <Box sx={{ maxWidth: 400 }}>
          <Stepper
            activeStep={activeStepCard}
            orientation="vertical"
            connector={<QontoConnector style={{ height: '32px' }} />}
          >
            {steps.map((step, index) => (
              <Step
                key={step.label}
                className={
                  (isNull(activeStepCard) || index > activeStepCard) &&
                  styles.stepperMinHeight
                }
              >
                <ColorlibStepLabel
                  className={styles.paddingStep}
                  StepIconComponent={(props) =>
                    ColorlibStepIcon(props, activeStepCard)
                  }
                >
                  {isNull(activeStepCard) || index > activeStepCard ? (
                    <>
                      <div
                        className={`${
                          index !== DEAL_STATUS_VALUE.CLOSING &&
                          styles.statusContainer
                        } `}
                      >
                        <span className={styles.statusLabel}>
                          {activeStepCard != index && step.label}
                        </span>
                        {index !== DEAL_STATUS_VALUE.CLOSING && (
                          <div>{_renderDeadlineDateTime(null, index)}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <span>{activeStepCard != index && step.label}</span>
                  )}
                </ColorlibStepLabel>
                <StepContent
                  style={{
                    borderLeft: `${
                      step.label == 'Closing' ? '' : '2px solid #edf5fe'
                    }`,
                    marginBottom: `${activeStepCard == index && '-48px'}`,
                  }}
                >
                  <Typography>{step.description}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>

        {activeStepCard !== 0 && (
          <Modal
            keepMounted
            open={openModalCommon}
            onClose={handleCloseModalCommon}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
          >
            <Box className={styles.modalDiscloAgreeWrapper}>
              <div
                className={styles.closeUseSignModelIcon}
                onClick={handleCloseModalCommon}
              />
              <Typography
                id="keep-mounted-modal-title"
                variant="h6"
                component="h2"
              >
                Cannot upload files?
                <Typography
                  id="keep-mounted-modal-description"
                  sx={{ mt: 2 }}
                  className={styles.noteText}
                >
                  If you have trouble upload files on the platform, you can
                  directly send the signed document the broker by email.
                </Typography>
              </Typography>
              <div className={styles.btnDownload}>
                <Button
                  variant="contained"
                  className={styles.buttonPopup}
                  onClick={handleSendEmail}
                >
                  <span className={styles.nonDiscloAgreeEmailIcon} />
                  Send files to the broker by email
                </Button>
              </div>
            </Box>
          </Modal>
        )}
      </div>
    </>
  );
};
export default DealStepCard;
