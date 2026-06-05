export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    hello: String
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    googleLogin(idToken: String!): AuthPayload!
  }
`;
