import {gql} from '@apollo/client';

export const UPDATE_DEAL_PREFERENCES = gql`
mutation updateDealPreferrece(
    $organisation_id: uuid,
    $profile_regions: [profile_regions_insert_input!]!,
    $profile_use_types: [profile_use_types_insert_input!]!,
    $profile_purchase_types: [profile_purchase_types_insert_input!]!,
    $organisation: organisations_set_input
    ) {
  update_organisations(
    where: {id: {_eq: $organisation_id}},
    _set: $organisation,
  ) {
    affected_rows
  }
  delete_profile_regions(where: { organisation_id: { _eq: $organisation_id}}) {
    affected_rows
  }
  insert_profile_regions(objects: $profile_regions) {
    affected_rows
  }
  delete_profile_use_types(where: { organisation_id: { _eq: $organisation_id}}) {
    affected_rows
  }
  insert_profile_use_types(objects: $profile_use_types) {
    affected_rows
  }
  delete_profile_purchase_types(where: { organisation_id: { _eq: $organisation_id}}) {
    affected_rows
  }
  insert_profile_purchase_types(objects: $profile_purchase_types) {
    affected_rows
  }
}
`;
