import { gql } from '@apollo/client';

export const GET_ORGANIZATION_DETAILS = gql`
  query getOrganisationDetails($organisation_id: uuid) {
    organisations(where: { id: { _eq: $organisation_id } }) {
      id
      name
      website_url
      street
      street_nr
      city
      postcode
      country
      organisation_type_id
      users {
        id
        first_name
        last_name
        email
      }
      image {
        id
        url
      }
      organisation_type {
          id
          label_de
          label_en
          label_fr
      }
    }
    organisation_types(order_by: { position: asc }) {
        id
        label_en
        label_de
        label_fr
        position
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation updateOrganisation($id: uuid, $input: organisations_set_input) {
    update_organisations(where: { id: { _eq: $id } }, _set: $input) {
      affected_rows
    }
  }
`;

export const INSERT_IMAGE_ORGANIZATION = gql`
  mutation generateSignedUrl($url: String, $organisation_id: uuid) {
    insert_images_one(
      object: { url: $url, organisation_id: $organisation_id }
    ) {
      url
      id
      organisation_id
    }
  }
`;
