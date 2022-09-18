import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector';

import { StepIconProps } from '@mui/material/StepIcon';
import { styled } from '@mui/material/styles';
import Carousels from '../carousel/carousels';
import styles from './cardItem.module.scss';
import {
  buildWorkFlow,
  checkActiveStepCard,
  buildCardTags,
} from './card-item.utils';
import Link from 'next/link';
import { formatNumber, formatSquare, formatCurrency } from '@utils/number';

interface CardItemProps {
  item: any;
}

export const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#EDF5FE',
  zIndex: 1,
  color: '#3455D1',
  width: 20,
  height: 20,
  display: 'flex',
  borderRadius: '50%',
  transform: ' translateX(2px)',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: 'white',
    border: '1px solid#3455D1',
  }),
  ...(ownerState.completed && {
    backgroundColor: '#3455D1',
  }),
}));

export const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
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
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
    width: '20px',
  },
}));

export function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    ></ColorlibStepIconRoot>
  );
}

export const _renderTags = (
  item: any,
  tagsNotDisplay: string[],
  isSold: boolean
) => {
  const tags = buildCardTags(item, isSold);
  return (
    <>
      {tags && (
        <div className={styles.tagContainer}>
          {tags.map((tag) => (
            <>
              {!tagsNotDisplay.includes(tag.text) && (
                <div
                  className={styles.iconBtnTag}
                  style={{ backgroundColor: tag.color }}
                >
                  {tag?.icon && (
                    <div className={styles.clockIcon}>
                      <span className="icon-icon_clock-white"></span>
                    </div>
                  )}
                  <div
                    style={{ backgroundColor: tag.color }}
                    className={styles.textTag}
                  >
                    {tag.text}
                  </div>
                </div>
              )}
            </>
          ))}
        </div>
      )}
    </>
  );
};

export const _renderSubBodyCardField = (fieldLabel: any, fieldData: any) => (
  fieldData && <div className={styles.subBodyCard}>
    <div className={styles.subTitle}>{fieldLabel}</div>
    <div className={styles.subContent2}>{fieldData || '-'}</div>
  </div>
);
const renderClassLabel = (index: number, activeStepCard: number) => {
  if (index < activeStepCard) return styles.textCompleted;
  return index === activeStepCard ? styles.textActive : '';
};

export const _renderStepper = (steps: any, activeStepCard: number) => (
  <Box sx={{ maxWidth: 400 }} style={{ marginTop: '12px' }}>
    <Stepper
      activeStep={activeStepCard}
      orientation="vertical"
      connector={<QontoConnector />}
    >
      {steps.map((step: any, index: number) => (
        <Step
          key={step.label}
          active={step.activeStep}
          className={styles.stepStyle}
        >
          <StepLabel
            className={styles.paddingStep}
            StepIconComponent={ColorlibStepIcon}
          >
            <span className={renderClassLabel(index, activeStepCard)}>
              {step.label}
            </span>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
);

const CardItem: React.FC<CardItemProps> = (item: any) => {
  const activeStepCard = checkActiveStepCard(item);
  const steps = buildWorkFlow(item);
  const tagsNotDisplay = item.isSold ? ['New'] : [];

  return (
    <div className={styles.fontCard} style={{ height: '565px' }}>
      <Card sx={{ maxWidth: 345 }} style={{ borderRadius: '20px' }}>
        <CardActionArea>
          {_renderTags(item, tagsNotDisplay, item.isSold)}
          <Carousels data={item.deal_images} id={item.id} />
          <CardContent>
            <Link href={!item.isSold ? '/deal/' + item.id : '#'}>
              <a>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  className={styles.title}
                >
                  {item.title_en}
                </Typography>
                <div className={styles.bodyContainer}>
                  <div className={styles.subContent}>
                    {formatSquare(item.total_surface)}
                    {formatSquare(item.land_surface, '•', 'Plot')}
                  </div>
                  <Typography className={styles.location} variant="body2" color="text.secondary">
                    {item.location}
                  </Typography>
                </div>
              </a>
            </Link>
          </CardContent>
        </CardActionArea>
        <CardContent style={{ paddingTop: '0px' }}>
          <Link href={!item.isSold ? '/deal/' + item.id : '#'}>
            <a>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                className={styles.title_1}
              >
                Residential
              </Typography>
              <h2>{item.isSold} </h2>
              <div
                className={item.isSold ? styles.soldCard : styles.currentCard}
              >
                <div className={styles.bodyContainer}>
                  {_renderSubBodyCardField(
                    'Rental status',
                    formatSquare(item.rental_surface_total)
                  )}
                  {_renderSubBodyCardField(
                    'Expected rent',
                    formatCurrency(item.expected_rent, item.currency_type)
                  )}
                  {_renderSubBodyCardField(
                    'Apartments',
                    formatNumber(item.flat_number)
                  )}
                  {_renderSubBodyCardField(
                    'Commercial surface',
                    formatSquare(item.rental_surface_trade)
                  )}
                </div>
                {_renderStepper(steps, activeStepCard)}
              </div>
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
export default CardItem;
