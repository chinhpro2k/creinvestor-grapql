import { gql } from "@apollo/client";

export const GET_DEALS_ACTIVE = gql`
  query dealsListQueryActive(
    $groupDealStatus: String
    $visibilityInvestor: String
    $limit: Int = 10
    $offset: Int = 0
  ) {
    deals_aggregate(
      where: {
        deal_status: { group: { _eq: $groupDealStatus } }
        visibility_investor: { _eq: $visibilityInvestor }
      }
    ) {
      aggregate {
        totalCount: count
      }
    }
    deals(
      where: {
        deal_status: { group: { _eq: $groupDealStatus } }
        visibility_investor: { _eq: $visibilityInvestor }
      }
      limit: $limit
      offset: $offset,
      order_by: {
          updated_at: desc
      }
    ) {
      id
      title_de
      title_en
      title_fr
      description_de
      description_en
      description_fr
      closing_date
      visibility_investor
      deal_images {
          id
          require_nda_signed
          title
          description
          image {
              id
              url
          }
      }
      image {
        id
        url
      }
      deal_status {
        id
        label_de
        label_en
        label_fr
        group
      }
      deal_use_types {
        use_type {
          label_de
          label_en
          label_fr
          id
        }
      }
      deal_regions {
        region {
          label_de
          label_en
          label_fr
        }
      }
      deal_progress_stage {
        label_de
        label_en
        label_fr
        id
      }
      deal_final_price
      construction_period
      expected_rent
      vacancy_rate
      location
      deal_type
      price
      price_min
      price_max
      currency_type
      price_type
      leads {
        id
        pipeline_stage {
          label_de
          label_fr
          label_en
          group
        }
        status
        nda_signed
        organisation_id
        is_interested
        interested_at
        refusal_reasons
        refusal_reason_text
      }
      total_surface
      land_surface
      location
      rental_surface_total
      expected_rent
      flat_number
      rental_surface_trade
      nda_deadline
      nbo_deadline
      bo_deadline
    }
  }
`;

export const GET_DEALS_CLOSED = gql`
  query dealsListQueryClosed(
    $groupDealStatus: String
    $limit: Int = 10
    $offset: Int = 0
  ) {
    deals_aggregate(
      where: { deal_status: { group: { _eq: $groupDealStatus } } }
    ) {
      aggregate {
        totalCount: count
      }
    }
    deals(
      where: { deal_status: { group: { _eq: $groupDealStatus } } }
      limit: $limit
      offset: $offset
      order_by: {
          updated_at: desc
      }
    ) {
      id
      title_de
      title_en
      title_fr
      description_de
      description_en
      description_fr
      closing_date
      visibility_investor
      deal_images {
          id
          require_nda_signed
          title
          description
          image {
              id
              url
          }
      }
      image {
        id
        url
      }
      deal_status {
        id
        label_de
        label_en
        label_fr
        group
      }
      deal_use_types {
        use_type {
          label_de
          label_en
          label_fr
          id
        }
      }
      deal_regions {
        region {
          label_de
          label_en
          label_fr
        }
      }
      deal_progress_stage {
        label_de
        label_en
        label_fr
        id
      }
      deal_final_price
      construction_period
      expected_rent
      vacancy_rate
      location
      deal_type
      price
      price_min
      price_max
      currency_type
      price_type
      leads {
        id
        pipeline_stage {
          label_de
          label_fr
          label_en
          group
        }
        status
        nda_signed
        organisation_id
        is_interested
        interested_at
        refusal_reasons
        refusal_reason_text
      }
      total_surface
      land_surface
      location
      rental_surface_total
      expected_rent
      flat_number
      rental_surface_trade
      nda_deadline
      nbo_deadline
      bo_deadline
    }
  }
`;
