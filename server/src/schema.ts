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

  type DogMatchOwner {
    id: ID!
    human: HumanProfile
  }

  type DogMatch {
    score: Float!
    reasons: [String!]!
    dog: DogProfile!
    owner: DogMatchOwner!
  }

  type DogSearchResult {
    dog: DogProfile!
    owner: DogMatchOwner!
  }

  input DogSearchFilters {
    breed: String
    temperament: [String!]
    size: String
    offLeashBehavior: String
    minAge: Float
    maxAge: Float
    minWeight: Float
    maxWeight: Float
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    hello: String
    dogMatches(dogId: ID!): [DogMatch!]!
    dogSearch(filters: DogSearchFilters): [DogSearchResult!]!
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
