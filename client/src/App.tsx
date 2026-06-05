import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Login from './components/Login';
import Register from './components/Register';

const ME = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  const { data } = useQuery(ME, { skip: !token });
  const userEmail = data?.me?.email;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleSuccess = (newToken: string) => {
    setToken(newToken);
  };

  const handleGoogleLogin = () => {
    alert('Google login not yet integrated — wire up Google OAuth and call the googleLogin mutation with the ID token.');
  };

  if (token && userEmail) {
    return (
      <div>
        <h1>Sarah Alex Jam</h1>
        <p>Welcome, {userEmail}!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (token && !userEmail) {
    return (
      <div>
        <h1>Sarah Alex Jam</h1>
        <p>Loading...</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Sarah Alex Jam</h1>
      {showRegister ? (
        <>
          <Register onSuccess={handleSuccess} />
          <p>Already have an account? <button onClick={() => setShowRegister(false)}>Login</button></p>
        </>
      ) : (
        <>
          <Login onSuccess={handleSuccess} onGoogleLogin={handleGoogleLogin} />
          <p>No account? <button onClick={() => setShowRegister(true)}>Register</button></p>
        </>
      )}
    </div>
  );
}
