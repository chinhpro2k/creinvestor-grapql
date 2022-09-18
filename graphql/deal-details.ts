import { gql } from '@apollo/client';

export const GET_DEAL_DETAILS = gql`
  query dealDetailsQuery($id: uuid, $r_id: String!) {
    deals(where: { id: { _eq: $id } }) {
      id
      name
      title_de
      title_en
      title_fr
      description_de
      description_en
      description_fr
      closing_date
      visibility_investor
      owner_id
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
        lead_not_interested_reasons {
          not_interested_reason_id
          not_interested_reason {
            id
            label_de
            label_en
            label_fr
          }
        }
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
      arcade_ground_floor
      apartment_1_room
      apartment_2_rooms
      apartment_5_rooms
      apartment_6_rooms_with_parental_suite
      indoor_parking_spaces
      general_information
      calendly_url
      userByOwnerId {
        id
        last_name
        first_name
        email
        job_title
        mobile_phone
        office_phone
        image {
          id
          url
        }
      }
      userByLeaderBrokerId {
        id
        last_name
        first_name
        email
        job_title
        mobile_phone
        office_phone
        image {
          id
          url
        }
      }
      deal_images_aggregate {
        aggregate {
          total: count
        }
      }
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
    }
    not_interested_reasons(order_by: { position: asc }) {
      id
      label_de
      label_en
      label_fr
      position
    }
    fileByDealId(deal_id: $r_id) {
      id
      filename
      mimetype
      url
      fileType {
        id
        label_de
        label_en
        label_fr
        group
        type
      }
      created_at
    }
  }
`;

export const UPDATE_LEAD_INTERESTED = gql`
  mutation updateLeadInterested(
    $dealId: String!
    $isInterested: Boolean!
    $refusalReasonText: String!
    $refusalReasonIds: [String!]
  ) {
    updateLeadInterested(
      updateLeadInterestedDto: {
        dealId: $dealId
        isInterested: $isInterested
        refusalReasonText: $refusalReasonText
        refusalReasonIds: $refusalReasonIds
      }
    ) {
      id
    }
  }
`;

export const GENERATE_SIGNED_URL = gql`
  mutation generateSignedUrl($name: String!, $type: String!, $bucket: String!) {
    generateSignedUrl(input: { name: $name, type: $type, bucket: $bucket }) {
      url
    }
  }
`;

export const FILE_CREATE_MUTATION = gql`
  mutation fileCreateMutation(
    $dealId: UUID!
    $filename: String!
    $url: String!
    $mimetype: String!
    $size: Float!
  ) {
    fileCreateMutation(
      input: {
        url: $url
        filename: $filename
        mimetype: $mimetype
        size: $size
        dealId: $dealId
      }
    ) {
      id
      filename
      url
      mimetype
      fileType {
        label_de
        label_en
        label_fr
        group
        type
        id
      }
    }
  }
`;

export const SUBMIT_FILE_V_ONE = gql`
  mutation submitFileV1($dealId: UUID!, $files: [FileInput!]!) {
    submitFileV1(input: { dealId: $dealId, files: $files }) {
      id
    }
  }
`;

export const UNDO_NOT_INTERESTED_LEAD = gql`
  mutation undoNotInterestedLead($dealId: String!) {
    undoNotInterested(input: { dealId: $dealId }) {
      id
    }
  }
`;
