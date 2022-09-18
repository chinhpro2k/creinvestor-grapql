import { gql } from '@apollo/client';

export const DELETE_USER = gql`
  mutation deleteUser($id: uuid) {
    delete_users(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const INVITE_USERS = gql`
  mutation inviteUsers($email: [Email!]!) {
    inviteUsers(input: { emails: $email }) {
      message
    }
  }
`;
