import { gql } from '@apollo/client';

export const GET_USER_DETAILS = gql`
  query getUserProfileQuery($id: uuid) {
    users(where: { id: { _eq: $id } }) {
      first_name
      last_name
      job_title
      email
      office_phone
      mobile_phone
      language
      image {
        id
        url
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($id: uuid, $usersSetInput: users_set_input) {
    update_users(where: { id: { _eq: $id } }, _set: $usersSetInput) {
      affected_rows
    }
  }
`;

export const INSERT_IMAGE = gql`
  mutation insertImage($id: uuid, $url: String) {
    insert_images_one(object: { url: $url, user_id: $id }) {
      url
      id
      user_id
    }
  }
`;
