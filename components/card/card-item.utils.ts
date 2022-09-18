import { isEmpty, get } from "lodash";
import moment from "moment";
import { STATUS, DEAL_STATUS, FILE_TYPE } from "@constants/card-item.constants";
import { formatNumber } from '@utils/number'

export const CONFIG_WORK_FLOW = [
  {
    field: 'nda_deadline',
    default: 'Non-Disclosure Agreement',
    value: 'NDA',
    status: [STATUS.INTERESTED, STATUS.SELECTED_NOTIFIED],
  },
  {
    field: 'nbo_deadline',
    default: 'Non-Binding Offer',
    value: 'NBO',
    status: [STATUS.NDA_SIGNED],
  },
  {
    field: 'bo_deadline',
    default: 'Binding Offer',
    value: 'BO',
    status: [STATUS.NBO_SUBMITTED, STATUS.VISIT, STATUS.DUE_DILIGENCE],
  },
  {
    field: 'closing_date',
    default: 'Closing',
    value: 'CLOSING',
    status: [STATUS.BO_SUBMITTED],
  },
];

const checkStepStatus = (group: string, status: string[]): boolean =>
  status.includes(group);

const buildDateForLabel = (date: string): string =>
  date ? ` - ${moment(date, 'YYYY-MM-DD').format('MM.DD.YY')}` : '';

export const buildWorkFlow = (item: CardItemModel) => {
  const groupStatus = get(item, 'leads[0].pipeline_stage.group', '');

  const workflowResult = CONFIG_WORK_FLOW.map((config) => {
    const groupStatusAvailable =
      groupStatus && groupStatus != STATUS.BO_SUBMITTED && checkStepStatus(groupStatus, config.status);
    return {
      label: groupStatusAvailable
        ? `${config.value}${buildDateForLabel(item[config.field])}`
        : config.default,
      activeStep: groupStatus != STATUS.BO_SUBMITTED ? groupStatusAvailable : true,
    };
  });

  return [
    ...workflowResult,
  ];
};

export const checkActiveStepCard = (item: CardItemModel) => {
  const group = get(item, 'leads[0].pipeline_stage.group', '');

  switch (group) {
    case STATUS.INTERESTED:
    case STATUS.SELECTED_NOTIFIED:
      return 0;
    case STATUS.NDA_SIGNED:
      return 1;
    case STATUS.NBO_SUBMITTED:
    case STATUS.VISIT:
    case STATUS.DUE_DILIGENCE:
      return 2;
    case STATUS.BO_SUBMITTED:
      return 3;
    case STATUS.CLOSING:
      return 4;
    default:
      return 0;
  }
};

export const getFileTypeStatus = (activeStepCard: number) => {
  switch (activeStepCard) {
    case 0: 
     return  [FILE_TYPE.NDA, FILE_TYPE.TEASER]
    case 1:
      return [STATUS.NBO_SUBMITTED, FILE_TYPE.SALES_MEMO, FILE_TYPE.BUILDING_PLAN, FILE_TYPE.COMMERCIAL_REGISTER, FILE_TYPE.RENTAL_STATUS];
    case 2:
      return [STATUS.BO_SUBMITTED];
    case 3:
      return [FILE_TYPE.LFAIE, FILE_TYPE.POWER_OF_ATTORNY];
    default:
      return [STATUS.NBO_SUBMITTED];
  }
};

export const getFileTypeStatusWhenDownload = (activeStepCard: number) => {
  switch (activeStepCard) {
    case 0: 
     return  [FILE_TYPE.NDA, FILE_TYPE.TEASER]
    case 1:
      return [FILE_TYPE.SALES_MEMO, FILE_TYPE.BUILDING_PLAN, FILE_TYPE.COMMERCIAL_REGISTER, FILE_TYPE.RENTAL_STATUS];
    case 2:
      return [FILE_TYPE.BO_SUBMITTED];
    case 3:
      return [FILE_TYPE.POA, FILE_TYPE.SELLING_ACT];
    default:
      return [FILE_TYPE.BO_SUBMITTED];
  }
};

interface TagsProps {
  text: string;
  color: string;
  icon?: string;
}

const countDateLeft = (dateDeadline: Date) => {
  return dateDeadline && new Date() < dateDeadline
  ? Math.ceil(
      (dateDeadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    )
  : 0;
}

export const buildCardTags = (item: CardItemModel, isSold: boolean) => {
  const { leads, deal_final_price, currency_type } = item;
  let resultCardTags: TagsProps[] = [];

  const activeStepCard = checkActiveStepCard(item);
  const fieldCountDay = CONFIG_WORK_FLOW[activeStepCard]?.field;
  const dateDeadline = new Date(item[fieldCountDay]);
   const isInterested = get(item, 'leads[0].is_interested', true);
   const status = get(item, 'leads[0].status', '');

   
  if (isEmpty(leads) || (status === DEAL_STATUS.ACTIVE && !isInterested)) {
    resultCardTags.push({
      text: 'New',
      color: '#DD3944',
    });
  }

  if (status === DEAL_STATUS.LOST) {
    resultCardTags.push({
      text: 'Not Interested',
      color: '#333E48',
    });
  }

  if (item[fieldCountDay] && new Date() < dateDeadline) {
    const dayLeft = countDateLeft(dateDeadline);

    resultCardTags.push({
      text: `${dayLeft} days left`,
      color: '#3455D1',
      icon: 'clock',
    });
  }

  if(deal_final_price && isSold) {
    resultCardTags.push({
      text: `${currency_type} ${formatNumber(deal_final_price)}`,
      color: '#3455D1',
    })
  }
  return [
    ...new Map(resultCardTags.map((_item) => [_item['text'], _item])).values(),
  ];
};

export const countDayLeft = (
  item: CardItemModel,
  activeStepCard: number = 0
) => {
  const fieldCountDay = CONFIG_WORK_FLOW[activeStepCard]?.field;
  const dateDeadline = new Date(item[fieldCountDay]);

  return item[fieldCountDay] && new Date() < dateDeadline
    ? Math.ceil(
        (dateDeadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      )
    : 0;
};

export const getDeadline = (
  item: CardItemModel,
  activeStepCard: number = 0
) => {
  const fieldCountDay = CONFIG_WORK_FLOW[activeStepCard]?.field;
  const dateDeadline = item[fieldCountDay]
    ? new Date(item[fieldCountDay])
    : item[fieldCountDay];

  return dateDeadline
    ? moment(dateDeadline, 'YYYY-MM-DD').format('MMM DD, YYYY')
    : dateDeadline;
};
