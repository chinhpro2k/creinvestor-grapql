import React from 'react';
import { useMutation } from '@apollo/client';
import { isArray, get, isEmpty, isNull, isUndefined } from 'lodash';
import { UPDATE_LEAD_INTERESTED } from '@graphql/deal-details';
import { DEAL_STATUS } from '@constants/card-item.constants';
import DealTooltip from '@components/Tooltip/DealTooltip';
import WarningIcon from '@public/images/warning_icon.svg';
import {
  countDayLeft,
  getDeadline,
  checkActiveStepCard,
} from '../card/card-item.utils';
import InterestedCard from '../interestedDealCard/InterestedDealCard';
import DealStepCard from '../dealStepCard/DealStepCard';
import YourContact from '../deal/YourContact';
import styles from '../interestedDealCard/InterestedDealCard.module.css';

const DealCardWrapper: React.FC = ({ data, deal, refetch }: any) => {
  const { is_interested, status } = get(
    deal,
    'leads[0]',
    {}
  );

  const fileByDealId = get(data, 'fileByDealId', []);
  const showInterestedCard = () =>
    isEmpty(deal?.leads) || (status === DEAL_STATUS.ACTIVE && !is_interested);
  const [activeStepCard, setActiveStepCard] = React.useState(
    !showInterestedCard() && status !== DEAL_STATUS.LOST
      ? checkActiveStepCard(deal)
      : null
  );
  const noInterestedReasons =
    data && data?.not_interested_reasons && isArray(data.not_interested_reasons)
      ? data.not_interested_reasons
      : [];

  const [updateLeadInterested] = useMutation(UPDATE_LEAD_INTERESTED);

  const showNotInterestedCard = () => status === DEAL_STATUS.LOST;

  React.useEffect(() => {
    setActiveStepCard(
      !showInterestedCard() && status !== DEAL_STATUS.LOST
        ? checkActiveStepCard(deal)
        : null
    );
  }, [deal]);

  const _renderRoundClosingDay = (step: number, hiddenIconInfor: boolean) => {
    const stepFormat =
      isNull(step) || isUndefined(step) ? activeStepCard : step;
    const dayLeft = countDayLeft(deal, stepFormat);
    return (
      <>
        {dayLeft > 0 && (
          <>
            <div className={styles.round_closing_day}>
              <span>{`Round closing in ${dayLeft} days`}</span>
              {!hiddenIconInfor && (
                <DealTooltip tooltipProp={WarningIcon.src} />
              )}
            </div>
          </>
        )}
      </>
    );
  };

  const _renderDeadlineDateTime = (appendDescription: any, step: number) => {
    const stepFormat =
      isNull(step) || isUndefined(step) ? activeStepCard : step;
    const deadline = getDeadline(deal, stepFormat);

    return (
      <>
        {deadline && (
          <>
            <div className={styles.calendar}>
              <span className="icon-icon-calendar"></span>
              <p className={styles.round_closing_day_calendar}>{deadline}</p>
            </div>

            <div className={styles.calendar} style={{ marginBottom: '12px' }}>
              <span className="icon-icon_clock"></span>
              <p className={styles.round_closing_clock}>12:00 am</p>
            </div>
          </>
        )}
        {appendDescription && (
          <div className={styles.append_description}>{appendDescription}</div>
        )}
      </>
    );
  };

  return (
    <>
      <InterestedCard
        deal={deal}
        noInterestedReasons={noInterestedReasons}
        updateLeadInterested={updateLeadInterested}
        showInterestedCard={showInterestedCard}
        showNotInterestedCard={showNotInterestedCard}
        _renderRoundClosingDay={_renderRoundClosingDay}
        _renderDeadlineDateTime={_renderDeadlineDateTime}
        setActiveStepCard={setActiveStepCard}
        refetch={refetch}
        activeStepCard={activeStepCard}
      />
      <div className="verticalStepper">
        {deal && (
          <DealStepCard
            deal={deal}
            showInterestedCard={showInterestedCard}
            _renderRoundClosingDay={_renderRoundClosingDay}
            _renderDeadlineDateTime={_renderDeadlineDateTime}
            setActiveStepCard={setActiveStepCard}
            activeStepCard={activeStepCard}
            updateLeadInterested={updateLeadInterested}
            fileByDealId={fileByDealId}
            refetch={refetch}
          />
        )}
      </div>
      <YourContact deal={deal} />
    </>
  );
};

export default DealCardWrapper;
