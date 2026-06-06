import { gql } from '@apollo/client';

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    human { name gender location radius }
    dogs { id name breed age temperament size weight offLeashBehavior }
  }
`;

export const LOGIN_MUTATION = gql`
  ${USER_FIELDS}
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { ...UserFields }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  ${USER_FIELDS}
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      user { ...UserFields }
    }
  }
`;

export const GOOGLE_AUTH_MUTATION = gql`
  ${USER_FIELDS}
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      token
      user { ...UserFields }
    }
  }
`;

export const ONBOARD_HUMAN_MUTATION = gql`
  ${USER_FIELDS}
  mutation OnboardHuman($name: String!, $gender: String!, $location: String!, $radius: Float!) {
    onboardHuman(name: $name, gender: $gender, location: $location, radius: $radius) { ...UserFields }
  }
`;

export const ADD_DOG_PROFILE_MUTATION = gql`
  ${USER_FIELDS}
  mutation AddDogProfile(
    $name: String!
    $breed: String!
    $age: Float!
    $temperament: [String!]!
    $size: String!
    $weight: Float!
    $offLeashBehavior: String!
  ) {
    addDogProfile(
      name: $name
      breed: $breed
      age: $age
      temperament: $temperament
      size: $size
      weight: $weight
      offLeashBehavior: $offLeashBehavior
    ) { ...UserFields }
  }
`;

export const UPDATE_DOG_PROFILE_MUTATION = gql`
  ${USER_FIELDS}
  mutation UpdateDogProfile(
    $dogId: ID!
    $name: String!
    $breed: String!
    $age: Float!
    $temperament: [String!]!
    $size: String!
    $weight: Float!
    $offLeashBehavior: String!
  ) {
    updateDogProfile(
      dogId: $dogId
      name: $name
      breed: $breed
      age: $age
      temperament: $temperament
      size: $size
      weight: $weight
      offLeashBehavior: $offLeashBehavior
    ) { ...UserFields }
  }
`;

export const DELETE_DOG_PROFILE_MUTATION = gql`
  ${USER_FIELDS}
  mutation DeleteDogProfile($dogId: ID!) {
    deleteDogProfile(dogId: $dogId) { ...UserFields }
  }
`;

export const DOG_MATCHES_QUERY = gql`
  query DogMatches($dogId: ID!) {
    dogMatches(dogId: $dogId) {
      score
      reasons
      dog { id name breed age temperament size weight offLeashBehavior }
      owner {
        id
        human { name gender location radius }
      }
    }
  }
`;

export const DOG_SEARCH_QUERY = gql`
  query DogSearch($filters: DogSearchFilters) {
    dogSearch(filters: $filters) {
      dog { id name breed age temperament size weight offLeashBehavior }
      owner {
        id
        human { name gender location radius }
      }
    }
  }
`;
