import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LogOut, MapPin, Music2, Plus } from 'lucide-react';
import { useAuth, type AuthUser } from '../AuthContext';
import { ADD_DOG_PROFILE_MUTATION } from '../gql';

interface AddDogProfileResponse {
  addDogProfile: AuthUser;
}

const sizeOptions = ['Small', 'Medium', 'Large', 'Extra large'];
const offLeashOptions = ['Reliable recall', 'Sometimes reliable', 'Needs leash', 'Unknown'];
const breedOptions = [
  'Mixed breed',
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'French Bulldog',
  'Bulldog',
  'Poodle',
  'Beagle',
  'Rottweiler',
  'Dachshund',
  'Pembroke Welsh Corgi',
  'Australian Shepherd',
  'Yorkshire Terrier',
  'Boxer',
  'Cavalier King Charles Spaniel',
  'Great Dane',
  'Siberian Husky',
  'Border Collie',
  'Chihuahua',
  'Shih Tzu',
  'Boston Terrier',
  'Pomeranian',
  'Havanese',
  'Bernese Mountain Dog',
  'Cane Corso',
  'Doberman Pinscher',
  'Miniature Schnauzer',
  'Australian Cattle Dog',
  'Other',
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const human = user?.human;
  const dogs = user?.dogs ?? [];
  const [name, setName] = useState('');
  const [breed, setBreed] = useState(breedOptions[0]);
  const [age, setAge] = useState('');
  const [temperament, setTemperament] = useState('');
  const [size, setSize] = useState(sizeOptions[1]);
  const [weight, setWeight] = useState('');
  const [offLeashBehavior, setOffLeashBehavior] = useState(offLeashOptions[2]);
  const [error, setError] = useState<string | null>(null);
  const [addDogProfile, { loading }] = useMutation<AddDogProfileResponse>(ADD_DOG_PROFILE_MUTATION);

  if (!user || !human) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await addDogProfile({
        variables: {
          name,
          breed,
          age: Number(age),
          temperament,
          size,
          weight: Number(weight),
          offLeashBehavior,
        },
      });
      const updatedUser = res.data?.addDogProfile;
      if (updatedUser) {
        updateUser(updatedUser);
        setName('');
        setBreed(breedOptions[0]);
        setAge('');
        setTemperament('');
        setSize(sizeOptions[1]);
        setWeight('');
        setOffLeashBehavior(offLeashOptions[2]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save dog profile');
    }
  };

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

      <section className="dog-panel">
        <div className="dog-section-header">
          <div>
            <p className="profile-kicker">Dog profiles</p>
            <h2>Onboard a dog</h2>
          </div>
        </div>

        <form className="dog-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Breed</span>
              <select value={breed} onChange={e => setBreed(e.target.value)} required>
                {breedOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid dog-form-grid">
            <label className="form-field">
              <span>Age</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={age}
                onChange={e => setAge(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Size</span>
              <select value={size} onChange={e => setSize(e.target.value)} required>
                {sizeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Weight</span>
              <input
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Temperament</span>
              <input
                type="text"
                placeholder="Playful, shy, mellow"
                value={temperament}
                onChange={e => setTemperament(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Off leash behavior</span>
              <select
                value={offLeashBehavior}
                onChange={e => setOffLeashBehavior(e.target.value)}
                required
              >
                {offLeashOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn--primary" type="submit" disabled={loading}>
            <Plus size={15} />
            {loading ? 'Saving...' : 'Add dog'}
          </button>
        </form>

        <div className="dog-list">
          {dogs.length === 0 ? (
            <p className="dog-empty">No dog profiles yet.</p>
          ) : (
            dogs.map(dog => (
              <article className="dog-card" key={`${dog.name}-${dog.breed}`}>
                <div>
                  <h3>{dog.name}</h3>
                  <p>{dog.breed}</p>
                </div>
                <dl>
                  <div>
                    <dt>Age</dt>
                    <dd>{dog.age}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>{dog.size}</dd>
                  </div>
                  <div>
                    <dt>Weight</dt>
                    <dd>{dog.weight} lb</dd>
                  </div>
                  <div>
                    <dt>Temperament</dt>
                    <dd>{dog.temperament}</dd>
                  </div>
                  <div>
                    <dt>Off leash</dt>
                    <dd>{dog.offLeashBehavior}</dd>
                  </div>
                </dl>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
