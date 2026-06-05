import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        human { name gender location radius }
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      user {
        id
        email
        human { name gender location radius }
      }
    }
  }
`;

export const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      token
      user {
        id
        email
        human { name gender location radius }
      }
    }
  }
`;

export const ONBOARD_HUMAN_MUTATION = gql`
  mutation OnboardHuman($name: String!, $gender: String!, $location: String!, $radius: Float!) {
    onboardHuman(name: $name, gender: $gender, location: $location, radius: $radius) {
      id
      email
      human { name gender location radius }
    }
  }
`;
