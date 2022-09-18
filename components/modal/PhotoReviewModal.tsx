import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper';
import styled from 'styled-components';
import Image from 'next/image';

import { IPhotoReviewModal, PhotoModel } from '@model/photoSlider.model';
import SwiperPhotoItem from '@components/deal/SwiperPhotoItem';
import { Wrapper } from '@components/deal/PhotoSlider';
import { downloadFilesAsZip } from '@utils/common';
import useTrans from '@hooks/useTrans';

import CloseIcon from '@public/images/close-icon.png';
import DownloadIcon from '@public/images/download_icon.png';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const StyledContenWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;

const StyledSwiper = styled(Swiper)`
  border-radius: 20px;
  width: 780px;
  padding: 24px 0px;
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

const MiniSwiper = styled(StyledSwiper)`
  width: 700px;
  align-items: center;
  .swiper-slide-thumb-active {
    .img-element {
      div {
        width: 68px !important;
        height: 68px !important;
        border: 6px solid #fff;
        border-radius: 15px;
      }
    }
  }
  .swiper-slide {
    width: 80px;
    cursor: pointer;
  }
`;

const MiniWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

const StyledCloseBtn = styled.div`
  width: 780px;
  display: flex;
  justify-content: flex-end;
  img {
    width: 24px;
    cursor: pointer;
  }
`;

const StyledDownloadBtn = styled.div`
  background-color: #3455d1;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding: 15px 25px;
  cursor: pointer;
  border-radius: 100px;
  display: flex;
  align-items: center;
  img {
    height: 21px;
    padding-right: 8px;
  }
`;

const PhotoReviewModal: React.FC<IPhotoReviewModal> = ({
  photos,
  isOpen,
  dealName,
  isShowDownloadBtn,
  onClose,
}: IPhotoReviewModal) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const trans = useTrans();
  const onCloseModal = () => {
    onClose();
  };
  const onDownloadAll = () => {
    const viewablePhoto: PhotoModel[] = photos.filter(
      (photo: PhotoModel) => photo.image.id
    );
    const filesToDownload = viewablePhoto.map((photo: PhotoModel) => {
      return {
        fileName:
          photo.image?.url?.split('/')[photo.image?.url?.split('/').length - 1],
        category: 'photo',
        url: photo.image.url,
        mimetype: 'image/jpeg',
      };
    });
    downloadFilesAsZip(filesToDownload, `${dealName}_photos`);
  };
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted={true}
    >
      <Fade in={isOpen}>
        <StyledContenWrapper>
          <StyledCloseBtn>
            <Image
              src={CloseIcon.src}
              onClick={onCloseModal}
              width={24}
              height={24}
              alt="close-btn"
            />
          </StyledCloseBtn>
          <StyledSwiper
            spaceBetween={20}
            slidesPerView={1}
            modules={[Navigation, Thumbs]}
            navigation
            loop
            thumbs={{ swiper: thumbsSwiper }}
          >
            {photos &&
              photos.length > 0 &&
              photos.map((photo) => (
                <SwiperSlide key={photo.id}>
                  <Wrapper>
                    <SwiperPhotoItem photo={photo} mini={false} />
                  </Wrapper>
                </SwiperSlide>
              ))}
          </StyledSwiper>
          <MiniSwiper
            spaceBetween={20}
            slidesPerView={'auto'}
            onSwiper={setThumbsSwiper}
            modules={[FreeMode, Thumbs]}
            freeMode
          >
            {photos &&
              photos.length > 0 &&
              photos.map((photo) => (
                <SwiperSlide key={photo.id}>
                  <MiniWrapper className="img-element">
                    <SwiperPhotoItem photo={photo} mini />
                  </MiniWrapper>
                </SwiperSlide>
              ))}
          </MiniSwiper>
          {isShowDownloadBtn && (
            <StyledDownloadBtn onClick={onDownloadAll}>
              <img src={DownloadIcon.src} />
              {trans.common['downloadAllPictures']}
            </StyledDownloadBtn>
          )}
        </StyledContenWrapper>
      </Fade>
    </Modal>
  );
};

export default PhotoReviewModal;
