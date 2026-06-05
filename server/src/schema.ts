export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    human: HumanProfile
  }

  type HumanProfile {
    name: String!
    gender: String!
    location: String!
    radius: Float!
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
    onboardHuman(name: String!, gender: String!, location: String!, radius: Float!): User!
  }
`;
