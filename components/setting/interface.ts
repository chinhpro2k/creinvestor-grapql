export interface UserType {
  id: number
  label_de: string
  label_en: string
  label_fr: string
  position: number
  __typename: string
}

export interface Regions {
  id: string
  label_en: string
  label_fr: string
  position: number
  __typename: string
}

export interface OrganisationReq {
  core: boolean
  core_plus: boolean
  lex_koller_compliant: boolean
  max_asset_size: number
  min_asset_size: number
  only_indirect: boolean
  opportunistic: boolean
  value_add:boolean
}

export interface ProfileRegionReq {
  "organisation_id": string,
  "region_id": string
}

export interface ProfileUserTypeReq {
  "organisation_id": string,
  "use_type_id": number
}

export interface ProfilePurchaseTypeReq {
  "organisation_id": string,
  "purchase_type_id": number
}

export interface IDataPreferences {
  organisations: {
    core: boolean
    core_plus: boolean
    lex_koller_compliant: boolean
    max_asset_size: number
    min_asset_size: number
    only_indirect: boolean
    opportunistic: boolean
    profile_purchase_types: {
      purchase_type_id: number
      __typename: string
    }[];
    profile_regions: {
      region_id: string
      __typename: string
    }[];
    profile_use_types: {
      use_type_id: 1
      __typename: string
    }[]
    value_add: boolean
    __typename: string
  }[];
  purchase_types: {
    id: number
    label_en: string
    label_fr: string
    __typename: string
  }[];
  regions: Regions[];
  use_types: UserType[];
}
