import { gql } from '@apollo/client';

export const GET_DEAL_PREFERENCES = gql`
  query dealPreferrece($organisation_id: uuid) {
    organisations(where: { id: { _eq: $organisation_id } }) {
      min_asset_size
      max_asset_size
      profile_use_types {
        use_type_id
      }
      profile_regions {
        region_id
      }
      profile_purchase_types {
        purchase_type_id
      }
      core
      core_plus
      value_add
      opportunistic
      only_indirect
      lex_koller_compliant
    }
    use_types(order_by: { position: asc }) {
      id
      label_de
      label_en
      label_fr
      position
    }
    regions(order_by: { position: asc }) {
      id
      label_fr
      label_en
      label_fr
      position
    }
    purchase_types {
      id
      label_fr
      label_en
      label_fr
    }
  }
`;
