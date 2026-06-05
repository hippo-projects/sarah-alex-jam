import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

interface Props {
  onSuccess: (token: string) => void;
  onGoogleLogin: () => void;
}

export default function Login({ onSuccess, onGoogleLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [login] = useMutation(LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login({ variables: { email, password } });
      const token = data.login.token;
      localStorage.setItem('token', token);
      onSuccess(token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      </div>
      <div>
        <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      </div>
      <button type="submit">Login</button>
      <button type="button" onClick={onGoogleLogin}>Sign in with Google</button>
    </form>
  );
}
