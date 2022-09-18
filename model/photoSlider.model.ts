export interface IPhotoSlider {
  dealImages: any[];
  totalImage: number;
  dealName: string;
  isNDASigned: boolean;
}
export type PhotoModel = {
  id: number;
  image: ImageType;
  require_nda_signed: boolean;
};
export interface IPhotoReviewModal {
  photos: PhotoModel[];
  isOpen: boolean;
  dealName: string;
  isShowDownloadBtn: boolean;
  onClose: () => void;
}

export interface ISwiperPhotoItem {
  photo: PhotoModel;
  mini: boolean;
}

type ImageType = {
  url: string;
  id: string;
};
