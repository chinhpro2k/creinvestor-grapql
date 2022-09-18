import React from 'react';
import Carousel from 'react-material-ui-carousel';
import CardMedia from '@mui/material/CardMedia';
import styles from './carousels.module.css';
import PicDefault from '@public/images/pic_placeholder.png';

const Carousels: React.FC = ({ data, id }: any) => {
  const imgDataSourceFormat = data.filter(e => e.image?.url);

  return (
    <>
    <Carousel
      className={styles.carousel}
      IndicatorIcon={<div className={styles.line}></div>}
      activeIndicatorIconButtonProps={{ className: `${styles.active}` }}
      autoPlay={false}
    >
      {imgDataSourceFormat && imgDataSourceFormat.length > 0 ? imgDataSourceFormat.map((item: any)=>{
        return(
          <CardMedia
            key={item.id}
            component="img"
            height="188"
            image={item?.image?.url}
            alt={item?.title}
          />
        )
      }) : (
      <CardMedia
            key={id}
            component="img"
            height="188"
            image={PicDefault.src}
            alt='Default image'
          />
        )}
    </Carousel>
    </>
  );
};

export default Carousels;
