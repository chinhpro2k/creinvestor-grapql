import * as React from 'react';
import { useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import styles from './NoInterestedModal.module.css';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { getValueBaseOnLang } from '@utils/common';
import { UPDATE_LEAD_INTERESTED } from '@graphql/deal-details';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: '20px',
  boxShadow: 24,
  p: 4,
};

const NoInterestedModal: React.FC<any> = ({
  setIsInterested,
  noInterestedReasonsOptions,
  refusalReasons,
  refusalReasonText,
  dealId,
  refetch,
  seIsUndo,
}: any) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const otherOption =
    noInterestedReasonsOptions.filter((e: any) => e.label_en === 'Other')[0] || {};
  const [selectRefusalReasons, setSelectRefusalReasons] = React.useState(
    refusalReasons || []
  );

  const [refusalReasonTextCurrent, setRefusalReasonTextCurrent] =
    React.useState(refusalReasonText || '');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let selectRefusalReasonsNew = [...selectRefusalReasons];
    if (event.target.checked) {
      selectRefusalReasonsNew.push(event.target.id);
    } else {
      selectRefusalReasonsNew = selectRefusalReasonsNew.filter(
        (e) => e !== event.target.id
      );
    }
    setSelectRefusalReasons(selectRefusalReasonsNew);
  };
  const submitModal = () => {
    setOpen(false);
    setIsInterested(false);
    seIsUndo(true);
    handleUpdateLeadInterested();
  };

  const [updateLeadInterested] = useMutation(UPDATE_LEAD_INTERESTED);

  const handleUpdateLeadInterested = () => {
    updateLeadInterested({
      variables: {
        dealId: dealId,
        isInterested: false,
        refusalReasonText: refusalReasonTextCurrent,
        refusalReasonIds: selectRefusalReasons,
      },
      onCompleted(res) {
        if (res) {
          refetch();
          seIsUndo(true);
        }
      },
    });
  };

  return (
    <>
      <div>
        <Button
          onClick={handleOpen}
          variant="outlined"
          color="error"
          className={styles.btnNo}
        >
          No
        </Button>
        <Modal
          keepMounted
          open={open}
          onClose={handleClose}
          aria-labelledby="keep-mounted-modal-title"
          aria-describedby="keep-mounted-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="keep-mounted-modal-title"
              variant="h6"
              component="h2"
            >
              Why are you not interested?
              <Typography id="keep-mounted-modal-description" sx={{ mt: 2 }}>
                Please select one or more reasons.
              </Typography>
            </Typography>
            <div>
              <FormControl className={styles.checkboxGroup}>
                <FormGroup>
                  {noInterestedReasonsOptions?.map((option: any, index: number) => (
                    <>
                      {!(index % 2) && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectRefusalReasons.includes(
                                option?.id
                              )}
                              onChange={handleChange}
                              name="gilad"
                              id={option?.id}
                            />
                          }
                          label={getValueBaseOnLang(option, 'label')}
                        />
                      )}
                    </>
                  ))}
                </FormGroup>
                <FormGroup>
                  {noInterestedReasonsOptions?.map((option: any, index: number) => (
                    <>
                      {index % 2 === 1 && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectRefusalReasons.includes(
                                option?.id
                              )}
                              onChange={handleChange}
                              name="gilad"
                              id={option?.id}
                            />
                          }
                          label={getValueBaseOnLang(option, 'label')}
                        />
                      )}
                    </>
                  ))}
                </FormGroup>
              </FormControl>
            </div>
            <div>
              {selectRefusalReasons.includes(otherOption?.id) && (
                <TextareaAutosize
                  aria-label="minimum height"
                  minRows={3}
                  placeholder="Very interesting text."
                  className={styles.textArea}
                  value={refusalReasonTextCurrent}
                  onChange={(e) => setRefusalReasonTextCurrent(e.target.value)}
                />
              )}
            </div>
            <div className={styles.btnStyles}>
              <Button onClick={handleClose} style={{ color: '#96A4B4' }}>
                Cancel
              </Button>
              <Button onClick={submitModal}>Submit</Button>
            </div>
          </Box>
        </Modal>
      </div>
    </>
  );
};
export default NoInterestedModal;
