import { useRef } from 'react';
import styled from 'styled-components';

import { ISwiperPhotoItem, PhotoModel } from '@model/photoSlider.model';

import LockIcon from '@public/images/white-locked-icon.png';

type CustomSwiperImageSlideProps = {
  photo: PhotoModel;
  mini: boolean;
};

const ImageElement = styled.div<CustomSwiperImageSlideProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-image: url(${(props) => props.photo.image?.url || ''});
  background-size: cover;
  background-position: center;
  border-radius: ${(props) => (props.mini ? '10px' : '20px')};
`;

const ImageBlurCover = styled.div<any>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(20px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => (props.mini ? '10px' : '20px')};

  div {
    font-size: 18px;
    font-weight: 500;
    color: #fff;
    text-align: center;
  }
`;

const SwiperPhotoItem: React.FC<ISwiperPhotoItem> = ({
  photo,
  mini,
}: ISwiperPhotoItem) => {
  const imageRef = useRef<null | HTMLDivElement>(null);

  return (
    <>
      <ImageElement ref={imageRef} photo={photo} mini={mini} />
      {!photo.image.id && (
        <ImageBlurCover mini={mini}>
          <img src={LockIcon.src} />
          {!mini && (
            <div>
              Please sign the NDA
              <br /> to have full access
            </div>
          )}
        </ImageBlurCover>
      )}
    </>
  );
};

export default SwiperPhotoItem;
