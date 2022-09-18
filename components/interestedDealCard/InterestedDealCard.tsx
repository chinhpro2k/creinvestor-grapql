import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UNDO_NOT_INTERESTED_LEAD } from '@graphql/deal-details';
import useTrans from '@hooks/useTrans';
import styles from './InterestedDealCard.module.css';
import NoInterestedModal from '@components/modal/NoInterestedModal';
import { DEAL_STATUS_VALUE } from '@constants/card-item.constants';
import { get } from 'lodash';

const InterestedCard: React.FC<any> = ({
  deal,
  noInterestedReasons,
  updateLeadInterested,
  showInterestedCard,
  showNotInterestedCard,
  _renderRoundClosingDay,
  _renderDeadlineDateTime,
  setActiveStepCard,
  refetch,
  activeStepCard,
}: any) => {
  const trans = useTrans();
  const [isInterested, setIsInterested] = useState(true);
  const [isUndo, seIsUndo] = useState(true);
  const id = get(deal, 'id', '');
  const { refusal_reasons, refusal_reason_text } = get(
    deal,
    'leads[0]',
    {}
  );

  const [undoNotInterested] = useMutation(UNDO_NOT_INTERESTED_LEAD);

  const appendDescription = (
    <div className={styles.sign_the_non_disclosure}>
      Sign the non-disclosure agreement to have full access.
    </div>
  );

  const handleUpdateLeadInterested = () => {
    updateLeadInterested({
      variables: {
        dealId: id,
        isInterested: true,
        refusalReasonText: '',
        refusalReasonIds: null,
      },
      onCompleted(res: any) {
        if (res?.updateLeadInterested?.id) {
          setActiveStepCard(DEAL_STATUS_VALUE.NDA);
        }
      },
    });
  };

  const undo = () => {
    undoNotInterested({
      variables: {
        dealId: id,
      },
      onCompleted() {
        refetch();
        //seIsUndo(false);
      },
    });
  };
  return (
    <>
      {(showInterestedCard() || (showNotInterestedCard() && !isUndo)) &&
        activeStepCard === null && (
          <div className="wrapper_title_are_you_interested_deal">
            <div>
              <h3 className={styles.title_are_you_interested_deal}>
                {trans.common['areYouInterestedInThisDeal']}
              </h3>
              <div className={styles.round_closing_days}>
                {_renderRoundClosingDay(0)}
              </div>
              {_renderDeadlineDateTime(appendDescription, 0)}
              <div className={styles.interested_buttons}>
                <button
                  className={styles.but_interested_yes}
                  onClick={() => handleUpdateLeadInterested()}
                >
                  Yes
                </button>
                <NoInterestedModal
                  setIsInterested={setIsInterested}
                  noInterestedReasonsOptions={noInterestedReasons}
                  refusalReasons={refusal_reasons}
                  refusalReasonText={refusal_reason_text}
                  dealId={id}
                  refetch={refetch}
                  seIsUndo={seIsUndo}
                />
              </div>
            </div>
            {/* TODO: check condition who Undo case */}
          </div>
        )}
      {showNotInterestedCard() && isUndo && (
        <div className="wrapper_title_are_you_interested_deal">
          <div className={styles.title_are_you_interested_deal}>
            You are not interested in this deal
          </div>
          <div
            className={styles.round_label}
            onClick={undo}
            style={{ cursor: 'pointer' }}
          >
            Undo?
          </div>
        </div>
      )}
    </>
  );
};
export default InterestedCard;
