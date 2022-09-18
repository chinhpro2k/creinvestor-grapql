import React from "react";
import { useRouter } from 'next/router'
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Box from "@mui/material/Box";
import Carousels from "../carousel/carousels";
import styles from "./cardItem.module.scss";
import {
  buildWorkFlow,
  checkActiveStepCard,
} from "./card-item.utils";
import Link from "next/link";
import { formatNumber, formatSquare, formatCurrency } from '@utils/number'
import {
  _renderTags,
  _renderSubBodyCardField,
  _renderStepper,
} from './card-item'

interface CardItemProps {
  item: any;
}

const HorizontalCardItem: React.FC<CardItemProps> = (item: any) => {
  const router = useRouter();
  const activeStepCard = checkActiveStepCard(item);
  const steps = buildWorkFlow(item);
  const tagsNotDisplay = item.isSold ? ['New'] : [];

  const handleRedirectToDetail = () => {
    router.push(!item.isSold ? '/deal/' + item.id : '#');
  }
  
  return (
    <div className={`${styles.fontCard} ${styles.boxShadowFontCard}`} onClick={handleRedirectToDetail}>
      <Card sx={{ display: 'flex',  justifyContent:' space-evenly' }} style={{ borderRadius: '20px', boxShadow: 'unset'}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width:' 252px', flex:'1' }}>
          <CardActionArea>
            {_renderTags(item, tagsNotDisplay, item.isSold)}
            <Carousels data={item.deal_images} id={item.id} />
          </CardActionArea>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex:'1'}} >
          <CardContent className={styles.titleContainer}>
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
                <div>
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
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex:'1' }} className={styles.line}>
          <CardContent className={styles.contentContainer}>
            <Link href={!item.isSold ? '/deal/' + item.id : '#'}>
              <a style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{width:' 252px'}}>
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
                    className={
                      item.isSold ? styles.soldCard : styles.currentCard
                    }
                  >
                    <div>
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
                  </div>
                </div>
              </a>
            </Link>
          </CardContent>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex:'1' }} >
          <CardContent style={{ paddingTop: '0px' }}>
            <Link href={!item.isSold ? '/deal/' + item.id : '#'}>
              <a style={{ display: 'flex', flexDirection: 'row' }}>
                <div
                  className={item.isSold ? styles.soldCard : styles.currentCard}
                >
              {_renderStepper(steps, activeStepCard)}
              </div>
              </a>
            </Link>
          </CardContent>
        </Box>
      </Card>
    </div>
  );
};
export default HorizontalCardItem;
