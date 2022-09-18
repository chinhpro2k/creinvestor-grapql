import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper';
import styled from 'styled-components';

import { IPhotoSlider, PhotoModel } from '@model/photoSlider.model';
import SwiperPhotoItem from './SwiperPhotoItem';
import PhotoReviewModal from '@components/modal/PhotoReviewModal';
import useTrans from '@hooks/useTrans';

import MenuIcon from '@public/images/menu-icon.png';
import 'swiper/css';
import 'swiper/css/navigation';

const PhotoSliderContainer = styled.div`
  height: 400px;
  margin-bottom: 24px;
  position: relative;
`;

const StyledSwiper = styled(Swiper)`
  border-radius: 20px;
  .swiper-button-next {
    background-image: url(/images/next-icon.png);
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center;
  }

  .swiper-button-next::after {
    display: none;
  }

  .swiper-button-prev {
    background-image: url(/images/prev-icon.png);
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center;
  }

  .swiper-button-prev::after {
    display: none;
  }
`;

const StyledAllPhoto = styled.div`
  position: absolute;
  z-index: 2;
  bottom: 15px;
  left: 25px;
  background-color: #00000066;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 100px;
  display: flex;
  align-items: center;
  img {
    height: 24px;
    padding-right: 8px;
  }
`;

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
`;

const PhotoSlider: React.FC<IPhotoSlider> = ({
  dealImages,
  totalImage,
  dealName,
  isNDASigned,
}: IPhotoSlider) => {
  const [isOpenPhotoModal, setIsOpenPhotoModal] = useState<boolean>(false);
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const trans = useTrans();

  useEffect(() => {
    let sortedImages = [
      ...dealImages.filter((dealImage: PhotoModel) => dealImage.image),
      ...dealImages.filter((dealImage: PhotoModel) => !dealImage.image),
    ];
    sortedImages = sortedImages.map((dealImage: PhotoModel) => {
      if (dealImage.image) {
        return dealImage;
      } else {
        return { ...dealImage, image: { url: '/images/photo-slider1.png' } };
      }
    });
    setPhotos(sortedImages);
  }, [dealImages]);

  const onOpenDialog = () => {
    setIsOpenPhotoModal(true);
  };

  const onCloseDialog = () => {
    setIsOpenPhotoModal(false);
  };

  return (
    <>
      {photos && photos.length > 0 && (
        <>
          <PhotoSliderContainer>
            <StyledSwiper
              spaceBetween={20}
              freeMode
              slidesPerView={1.5}
              modules={[FreeMode, Navigation]}
              navigation
              loop
            >
              {photos &&
                photos.length > 0 &&
                photos.map((photo, index) => (
                  <SwiperSlide key={index}>
                    <Wrapper>
                      <SwiperPhotoItem photo={photo} mini={false} />
                    </Wrapper>
                  </SwiperSlide>
                ))}
            </StyledSwiper>
            <StyledAllPhoto onClick={onOpenDialog}>
              <img src={MenuIcon.src} />
              {`${trans.common['allPhoto']} (${totalImage})`}
            </StyledAllPhoto>
          </PhotoSliderContainer>
          <PhotoReviewModal
            photos={photos}
            isOpen={isOpenPhotoModal}
            onClose={onCloseDialog}
            dealName={dealName}
            isShowDownloadBtn={isNDASigned}
          />
        </>
      )}
    </>
  );
};

export default PhotoSlider;
