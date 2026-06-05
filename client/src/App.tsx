import './App.css';
import { useAuth } from './AuthContext';
import LoginForm from './components/LoginForm';

export default function App() {
  const { user, logout } = useAuth();

  if (!user) return <LoginForm />;

  return (
    <div style={{ padding: '2rem', fontFamily: 'DM Sans, sans-serif' }}>
      <h1>Sarah Alex Jam</h1>
      <p style={{ marginTop: '0.5rem', color: 'var(--text-2)' }}>Welcome, {user.email}</p>
      <button
        className="btn btn--ghost"
        style={{ marginTop: '1rem' }}
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
