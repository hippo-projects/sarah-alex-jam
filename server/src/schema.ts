export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    human: HumanProfile
    dogs: [DogProfile!]!
  }

  type HumanProfile {
    name: String!
    gender: String!
    location: String!
    radius: Float!
  }

  type DogProfile {
    id: ID!
    name: String!
    breed: String!
    age: Float!
    temperament: [String!]!
    size: String!
    weight: Float!
    offLeashBehavior: String!
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
    addDogProfile(
      name: String!
      breed: String!
      age: Float!
      temperament: [String!]!
      size: String!
      weight: Float!
      offLeashBehavior: String!
    ): User!
    updateDogProfile(
      dogId: ID!
      name: String!
      breed: String!
      age: Float!
      temperament: [String!]!
      size: String!
      weight: Float!
      offLeashBehavior: String!
    ): User!
    deleteDogProfile(dogId: ID!): User!
  }
`;
