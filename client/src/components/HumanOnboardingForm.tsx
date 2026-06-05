import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { MapPin, UserRound } from 'lucide-react';
import { useAuth, type AuthUser } from '../AuthContext';
import { ONBOARD_HUMAN_MUTATION } from '../gql';

interface OnboardHumanResponse {
  onboardHuman: AuthUser;
}

const genderOptions = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];

export default function HumanOnboardingForm() {
  const { logout, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [gender, setGender] = useState(genderOptions[0]);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(25);
  const [error, setError] = useState<string | null>(null);
  const [onboardHuman, { loading }] = useMutation<OnboardHumanResponse>(ONBOARD_HUMAN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await onboardHuman({
        variables: {
          name,
          gender,
          location,
          radius,
        },
      });
      const user = res.data?.onboardHuman;
      if (user) updateUser(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save your profile');
    }
  };

  return (
    <main className="onboarding-page">
      <section className="onboarding-panel">
        <div className="onboarding-actions">
          <button className="btn btn--ghost" type="button" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="header-title">
          <UserRound size={22} />
          <h1>Human profile</h1>
        </div>
        <p className="header-sub">Add the basics Sarah Alex Jam needs to match you locally.</p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-grid">
            <label className="form-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
                autoFocus
              />
            </label>

            <label className="form-field">
              <span>Gender</span>
              <select value={gender} onChange={e => setGender(e.target.value)} required>
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field">
            <span>Location</span>
            <div className="input-with-icon">
              <MapPin size={16} />
              <input
                type="text"
                placeholder="City, state"
                value={location}
                onChange={e => setLocation(e.target.value)}
                autoComplete="address-level2"
                required
              />
            </div>
          </label>

          <label className="form-field radius-field">
            <span>Radius</span>
            <div className="radius-control">
              <input
                type="range"
                min="1"
                max="250"
                step="1"
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
              />
              <div className="radius-input">
                <input
                  type="number"
                  min="1"
                  max="250"
                  step="1"
                  value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                  required
                />
                <span>mi</span>
              </div>
            </div>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            className="btn btn--primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>
    </main>
  );
}
