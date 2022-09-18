export interface Organisation {
  name: string;
  website: string;
  street: string;
  streetNr: string | number;
  city: string;
  postcode: string;
  country?: string;
  countryName?: string;
  invitingEmails?: string;
  organisationTypeId: number
  organisationType: OrganisationType
}

export interface OrganisationType {
  id: string
  label_en: string
  label_de: string
  label_fr: string
}
