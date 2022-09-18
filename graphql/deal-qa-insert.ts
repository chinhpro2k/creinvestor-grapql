import { gql } from "@apollo/client";

export const INSERT_DEAL_QAS = gql`
  mutation insertDealQuestion($dealId: uuid, $question: String) {
    insert_deal_questions(objects: { deal_id: $dealId, question: $question }) {
      returning {
        id
        question
        created_at
      }
    }
  }
`;
