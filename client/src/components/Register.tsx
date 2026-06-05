import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
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
}

export default function Register({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [register] = useMutation(REGISTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await register({ variables: { email, password } });
      const token = data.register.token;
      localStorage.setItem('token', token);
      onSuccess(token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      </div>
      <div>
        <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      </div>
      <button type="submit">Register</button>
    </form>
  );
}
