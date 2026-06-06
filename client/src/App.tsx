import './App.css';
import { useAuth } from './AuthContext';
import DogDirectoryPage from './components/DogDirectoryPage';
import HumanOnboardingForm from './components/HumanOnboardingForm';
import LoginForm from './components/LoginForm';
import ProfilePage from './components/ProfilePage';
import { useState } from 'react';

type AppPage = 'profile' | 'dogs';

export default function App() {
  const { logout, user } = useAuth();
  const [page, setPage] = useState<AppPage>('profile');

  if (!user) return <LoginForm />;

  if (!user.human) return <HumanOnboardingForm />;

  return (
    <>
      <nav className="app-nav">
        <div className="app-nav__brand">Sarah Alex Jam</div>
        <div className="app-nav__links">
          <button
            className={`btn ${page === 'profile' ? 'btn--primary' : 'btn--ghost'}`}
            type="button"
            onClick={() => setPage('profile')}
          >
            Profile
          </button>
          <button
            className={`btn ${page === 'dogs' ? 'btn--primary' : 'btn--ghost'}`}
            type="button"
            onClick={() => setPage('dogs')}
          >
            Dogs
          </button>
          <button className="btn btn--ghost" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>
      {page === 'profile' ? <ProfilePage /> : <DogDirectoryPage />}
    </>
  );
}
