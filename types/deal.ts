export interface DocumentFileType {
  fileName: string;
  category: string;
  url: string;
  mimetype: string;
}

export interface DocumentFileTypeResponseType {
  group: string;
  id: string;
  label_de: string;
  label_en: string;
  label_fr: string;
  type: null | string;
}

export interface DocumentFileResponseType {
  id: string;
  url: string;
  mimetype: string;
  fileType: DocumentFileTypeResponseType;
}

export interface DealContactResponseType {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  job_title: string;
  mobile_phone: string;
  office_phone: string;
  image: {
    id: string;
    url: string;
  };
}
export interface DealResponseType {
  id: string;
  name: string;
  userByOwnerId: DealContactResponseType;
  userByLeaderBrokerId: DealContactResponseType;
}
