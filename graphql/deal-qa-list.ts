import { gql } from '@apollo/client';

export const GET_DEAL_QAS = gql`
  query dealQuestionsQuery(
    $limit: Int
    $offset: Int
    $search: String!
    $deal_id: uuid
  ) {
    deal_questions_aggregate(
      where: {
        _and: [
          { deal_id: { _eq: $deal_id } }
          {
            _or: [
              { question: { _ilike: $search } }
              { deal_answers: { answers: { _ilike: $search } } }
            ]
          }
        ]
      }
    ) {
      aggregate {
        total: count
      }
    }
    deal_questions(
      limit: $limit
      offset: $offset
      where: {
        _and: [
          { deal_id: { _eq: $deal_id } }
          {
            _or: [
              { question: { _ilike: $search } }
              { deal_answers: { answers: { _ilike: $search } } }
            ]
          }
        ]
      }
      order_by: { created_at: desc }
    ) {
      id
      question
      created_at
      user {
        id
        last_name
        first_name
        email
        image {
          url
        }
      }
      created_at
      deal_answers {
        id
        answers
        user {
          last_name
          first_name
          email
          image {
            url
          }
        }
        created_at
      }
    }
  }
`;
