import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ArrowLeft, LogOut, MapPin, Music2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth, type AuthUser, type DogProfile } from '../AuthContext';
import {
  ADD_DOG_PROFILE_MUTATION,
  DELETE_DOG_PROFILE_MUTATION,
  UPDATE_DOG_PROFILE_MUTATION,
} from '../gql';

interface AddDogProfileResponse {
  addDogProfile: AuthUser;
}

interface UpdateDogProfileResponse {
  updateDogProfile: AuthUser;
}

interface DeleteDogProfileResponse {
  deleteDogProfile: AuthUser;
}

const sizeOptions = ['Small', 'Medium', 'Large', 'Extra large'];
const offLeashOptions = ['Reliable recall', 'Sometimes reliable', 'Needs leash', 'Unknown'];
const temperamentOptions = [
  'Friendly',
  'Playful',
  'Calm',
  'Energetic',
  'Gentle',
  'Confident',
  'Shy',
  'Anxious',
  'Curious',
  'Independent',
  'Affectionate',
  'Protective',
  'Social',
  'Reactive',
];
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

interface TemperamentTokenFieldProps {
  inputValue: string;
  label: string;
  listId: string;
  onInputChange: (value: string) => void;
  onTokensChange: (tokens: string[]) => void;
  tokens: string[];
}

function normalizeToken(value: string) {
  return value.trim();
}

function addToken(tokens: string[], value: string) {
  const token = normalizeToken(value);
  if (!token) return tokens;
  if (tokens.some(existing => existing.toLowerCase() === token.toLowerCase())) return tokens;
  return [...tokens, token];
}

function getTemperamentTokens(temperament: DogProfile['temperament']) {
  const values = Array.isArray(temperament) ? temperament : [temperament];
  return values.map(value => value.trim()).filter(Boolean);
}

function formatTemperament(temperament: DogProfile['temperament']) {
  return getTemperamentTokens(temperament).join(', ');
}

function TemperamentTokenField({
  inputValue,
  label,
  listId,
  onInputChange,
  onTokensChange,
  tokens,
}: TemperamentTokenFieldProps) {
  const handleAddInput = () => {
    const nextTokens = addToken(tokens, inputValue);
    onTokensChange(nextTokens);
    if (nextTokens !== tokens) onInputChange('');
  };

  const handleInputChange = (value: string) => {
    const exactOption = temperamentOptions.find(option => option.toLowerCase() === value.trim().toLowerCase());
    if (exactOption) {
      const nextTokens = addToken(tokens, exactOption);
      onTokensChange(nextTokens);
      onInputChange('');
      return;
    }

    onInputChange(value);
  };

  return (
    <div className="form-field token-field">
      <span>{label}</span>
      <div className="token-list" aria-live="polite">
        {tokens.map(token => (
          <button
            className="token-chip token-chip--selected"
            key={token}
            type="button"
            onClick={() => onTokensChange(tokens.filter(existing => existing !== token))}
          >
            {token}
          </button>
        ))}
      </div>
      <div className="token-input-row">
        <input
          list={listId}
          type="text"
          placeholder="Add temperament"
          value={inputValue}
          onBlur={handleAddInput}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              handleAddInput();
            }
          }}
        />
        <datalist id={listId}>
          {temperamentOptions.map(option => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const human = user?.human;
  const dogs = user?.dogs ?? [];
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [isOnboardingDog, setIsOnboardingDog] = useState(false);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState(breedOptions[0]);
  const [age, setAge] = useState('');
  const [temperament, setTemperament] = useState<string[]>([]);
  const [temperamentInput, setTemperamentInput] = useState('');
  const [size, setSize] = useState(sizeOptions[1]);
  const [weight, setWeight] = useState('');
  const [offLeashBehavior, setOffLeashBehavior] = useState(offLeashOptions[2]);
  const [error, setError] = useState<string | null>(null);
  const [addDogProfile, { loading }] = useMutation<AddDogProfileResponse>(ADD_DOG_PROFILE_MUTATION);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState(breedOptions[0]);
  const [editAge, setEditAge] = useState('');
  const [editTemperament, setEditTemperament] = useState<string[]>([]);
  const [editTemperamentInput, setEditTemperamentInput] = useState('');
  const [editSize, setEditSize] = useState(sizeOptions[1]);
  const [editWeight, setEditWeight] = useState('');
  const [editOffLeashBehavior, setEditOffLeashBehavior] = useState(offLeashOptions[2]);
  const [isEditingDog, setIsEditingDog] = useState(false);
  const [dogError, setDogError] = useState<string | null>(null);
  const [updateDogProfile, { loading: updatingDog }] = useMutation<UpdateDogProfileResponse>(UPDATE_DOG_PROFILE_MUTATION);
  const [deleteDogProfile, { loading: deletingDog }] = useMutation<DeleteDogProfileResponse>(DELETE_DOG_PROFILE_MUTATION);
  const selectedDog = dogs.find(dog => dog.id === selectedDogId) ?? null;

  if (!user || !human) return null;

  const startEditingDog = (dog: DogProfile) => {
    setEditName(dog.name);
    setEditBreed(breedOptions.includes(dog.breed) ? dog.breed : 'Other');
    setEditAge(String(dog.age));
    setEditTemperament(getTemperamentTokens(dog.temperament));
    setEditTemperamentInput('');
    setEditSize(sizeOptions.includes(dog.size) ? dog.size : sizeOptions[1]);
    setEditWeight(String(dog.weight));
    setEditOffLeashBehavior(
      offLeashOptions.includes(dog.offLeashBehavior) ? dog.offLeashBehavior : offLeashOptions[2],
    );
    setDogError(null);
    setIsEditingDog(true);
  };

  const stopEditingDog = () => {
    setDogError(null);
    setIsEditingDog(false);
  };

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
        setTemperament([]);
        setTemperamentInput('');
        setSize(sizeOptions[1]);
        setWeight('');
        setOffLeashBehavior(offLeashOptions[2]);
        setIsOnboardingDog(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save dog profile');
    }
  };

  const handleUpdateDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDog) return;
    setDogError(null);

    try {
      const res = await updateDogProfile({
        variables: {
          dogId: selectedDog.id,
          name: editName,
          breed: editBreed,
          age: Number(editAge),
          temperament: editTemperament,
          size: editSize,
          weight: Number(editWeight),
          offLeashBehavior: editOffLeashBehavior,
        },
      });
      const updatedUser = res.data?.updateDogProfile;
      if (updatedUser) {
        updateUser(updatedUser);
        setIsEditingDog(false);
      }
    } catch (err: unknown) {
      setDogError(err instanceof Error ? err.message : 'Could not update dog profile');
    }
  };

  const handleDeleteDog = async () => {
    if (!selectedDog) return;
    setDogError(null);

    try {
      const res = await deleteDogProfile({ variables: { dogId: selectedDog.id } });
      const updatedUser = res.data?.deleteDogProfile;
      if (updatedUser) {
        updateUser(updatedUser);
        setSelectedDogId(null);
        setIsEditingDog(false);
      }
    } catch (err: unknown) {
      setDogError(err instanceof Error ? err.message : 'Could not delete dog profile');
    }
  };

  if (isOnboardingDog) {
    return (
      <main className="profile-page">
        <header className="profile-header">
          <button className="btn btn--ghost" type="button" onClick={() => setIsOnboardingDog(false)}>
            <ArrowLeft size={15} />
            Back
          </button>
          <button className="btn btn--ghost" type="button" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </header>

        <section className="dog-detail-panel">
          <div className="dog-detail-header">
            <div>
              <p className="profile-kicker">Dog onboarding</p>
              <h1>Onboard a dog</h1>
              <p>Add the profile details for one of {human.name}'s dogs.</p>
            </div>
          </div>

          <form className="dog-form dog-edit-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
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
              <TemperamentTokenField
                inputValue={temperamentInput}
                label="Temperament"
                listId="temperament-options"
                onInputChange={setTemperamentInput}
                onTokensChange={setTemperament}
                tokens={temperament}
              />
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

            <div className="dog-form-actions">
              <button className="btn btn--primary" type="submit" disabled={loading}>
                <Plus size={15} />
                {loading ? 'Saving...' : 'Add dog'}
              </button>
              <button className="btn btn--ghost" type="button" onClick={() => setIsOnboardingDog(false)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  if (selectedDog) {
    return (
      <main className="profile-page">
        <header className="profile-header">
          <button className="btn btn--ghost" type="button" onClick={() => setSelectedDogId(null)}>
            <ArrowLeft size={15} />
            Back
          </button>
          <button className="btn btn--ghost" type="button" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </header>

        <section className="dog-detail-panel">
          <div className="dog-detail-header">
            <div>
              <p className="profile-kicker">Dog profile</p>
              <h1>{selectedDog.name}</h1>
              <p>{selectedDog.breed}</p>
            </div>
            <div className="dog-detail-actions">
              <button className="btn btn--ghost" type="button" onClick={() => startEditingDog(selectedDog)}>
                <Pencil size={15} />
                Edit
              </button>
              <button
                className="btn btn--danger"
                type="button"
                onClick={handleDeleteDog}
                disabled={deletingDog}
              >
                <Trash2 size={15} />
                {deletingDog ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {isEditingDog ? (
            <form className="dog-form dog-edit-form" onSubmit={handleUpdateDog}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Name</span>
                  <input value={editName} onChange={e => setEditName(e.target.value)} required />
                </label>
                <label className="form-field">
                  <span>Breed</span>
                  <select value={editBreed} onChange={e => setEditBreed(e.target.value)} required>
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
                    value={editAge}
                    onChange={e => setEditAge(e.target.value)}
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Size</span>
                  <select value={editSize} onChange={e => setEditSize(e.target.value)} required>
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
                    value={editWeight}
                    onChange={e => setEditWeight(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="form-grid">
                <TemperamentTokenField
                  inputValue={editTemperamentInput}
                  label="Temperament"
                  listId="edit-temperament-options"
                  onInputChange={setEditTemperamentInput}
                  onTokensChange={setEditTemperament}
                  tokens={editTemperament}
                />
                <label className="form-field">
                  <span>Off leash behavior</span>
                  <select
                    value={editOffLeashBehavior}
                    onChange={e => setEditOffLeashBehavior(e.target.value)}
                    required
                  >
                    {offLeashOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              {dogError && <p className="form-error">{dogError}</p>}

              <div className="dog-form-actions">
                <button className="btn btn--primary" type="submit" disabled={updatingDog}>
                  <Save size={15} />
                  {updatingDog ? 'Saving...' : 'Save'}
                </button>
                <button className="btn btn--ghost" type="button" onClick={stopEditingDog}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {dogError && <p className="form-error">{dogError}</p>}
              <div className="dog-detail-grid">
                <div className="profile-detail">
                  <span>Age</span>
                  <strong>{selectedDog.age}</strong>
                </div>
                <div className="profile-detail">
                  <span>Size</span>
                  <strong>{selectedDog.size}</strong>
                </div>
                <div className="profile-detail">
                  <span>Weight</span>
                  <strong>{selectedDog.weight} lb</strong>
                </div>
                <div className="profile-detail">
                  <span>Temperament</span>
                  <strong>{formatTemperament(selectedDog.temperament)}</strong>
                </div>
                <div className="profile-detail">
                  <span>Off leash behavior</span>
                  <strong>{selectedDog.offLeashBehavior}</strong>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

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
            <p className="profile-kicker">My dogs</p>
            <h2>{human.name}'s dogs</h2>
          </div>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => {
              setSelectedDogId(null);
              setIsOnboardingDog(true);
            }}
          >
            <Plus size={15} />
            Add dog
          </button>
        </div>

        <div className="dog-list">
          {dogs.length === 0 ? (
            <p className="dog-empty">No dog profiles yet.</p>
          ) : (
            dogs.map(dog => (
              <article className="dog-card" key={dog.id}>
                <div className="dog-card-header">
                  <div>
                    <h3>{dog.name}</h3>
                    <p>{dog.breed}</p>
                  </div>
                  <button className="btn btn--ghost" type="button" onClick={() => setSelectedDogId(dog.id)}>
                    Details
                  </button>
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
                    <dd>{formatTemperament(dog.temperament)}</dd>
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
