import { gql } from '@apollo/client';

export const REQUEST_NDA_SIGNED = gql`
  mutation requestSignedNDA($dealId: UUID!) {
    requestNDASigned(input: { dealId: $dealId }) {
      redirectUrl
    }
  }
`;
