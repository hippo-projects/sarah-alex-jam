import { LogOut, MapPin, Music2 } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const human = user?.human;

  if (!user || !human) return null;

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div className="header-title">
          <Music2 size={22} />
          <h1>Sarah Alex Jam</h1>
        </div>
        <button className="btn btn--ghost" type="button" onClick={logout}>
          <LogOut size={15} />
          Logout
        </button>
      </header>

      <section className="profile-panel">
        <div className="profile-avatar" aria-hidden="true">
          {human.name.slice(0, 1).toUpperCase()}
        </div>

        <div className="profile-summary">
          <div>
            <p className="profile-kicker">Human profile</p>
            <h2>{human.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <span>Gender</span>
            <strong>{human.gender}</strong>
          </div>
          <div className="profile-detail">
            <span>Location</span>
            <strong>
              <MapPin size={15} />
              {human.location}
            </strong>
          </div>
          <div className="profile-detail">
            <span>Radius</span>
            <strong>{human.radius} mi</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
