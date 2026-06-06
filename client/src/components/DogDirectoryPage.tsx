import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Search } from 'lucide-react';
import type { DogSearchResult, DogProfile } from '../AuthContext';
import { DOG_SEARCH_QUERY } from '../gql';

interface DogSearchResponse {
  dogSearch: DogSearchResult[];
}

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

function getTemperamentTokens(temperament: DogProfile['temperament']) {
  const values = Array.isArray(temperament) ? temperament : [temperament];
  return values.map(value => value.trim()).filter(Boolean);
}

function compactNumber(value: string) {
  if (!value) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export default function DogDirectoryPage() {
  const [breed, setBreed] = useState('');
  const [temperament, setTemperament] = useState('');
  const [size, setSize] = useState('');
  const [offLeashBehavior, setOffLeashBehavior] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const filters = useMemo(() => ({
    breed: breed || undefined,
    temperament: temperament ? [temperament] : undefined,
    size: size || undefined,
    offLeashBehavior: offLeashBehavior || undefined,
    minAge: compactNumber(minAge),
    maxAge: compactNumber(maxAge),
    minWeight: compactNumber(minWeight),
    maxWeight: compactNumber(maxWeight),
  }), [breed, temperament, size, offLeashBehavior, minAge, maxAge, minWeight, maxWeight]);
  const { data, error, loading } = useQuery<DogSearchResponse>(DOG_SEARCH_QUERY, { variables: { filters } });
  const dogs = data?.dogSearch ?? [];

  return (
    <main className="directory-page">
      <section className="directory-header">
        <div>
          <p className="profile-kicker">Dog search</p>
          <h1>Dogs</h1>
        </div>
        <Search size={22} />
      </section>

      <section className="directory-filters">
        <label className="form-field">
          <span>Breed</span>
          <select value={breed} onChange={e => setBreed(e.target.value)}>
            <option value="">Any breed</option>
            {breedOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Temperament</span>
          <input
            list="dog-directory-temperaments"
            placeholder="Any temperament"
            value={temperament}
            onChange={e => setTemperament(e.target.value)}
          />
          <datalist id="dog-directory-temperaments">
            {temperamentOptions.map(option => <option key={option} value={option} />)}
          </datalist>
        </label>
        <label className="form-field">
          <span>Size</span>
          <select value={size} onChange={e => setSize(e.target.value)}>
            <option value="">Any size</option>
            {sizeOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Off leash</span>
          <select value={offLeashBehavior} onChange={e => setOffLeashBehavior(e.target.value)}>
            <option value="">Any behavior</option>
            {offLeashOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Min age</span>
          <input type="number" min="0" step="0.5" value={minAge} onChange={e => setMinAge(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Max age</span>
          <input type="number" min="0" step="0.5" value={maxAge} onChange={e => setMaxAge(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Min weight</span>
          <input type="number" min="1" step="0.1" value={minWeight} onChange={e => setMinWeight(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Max weight</span>
          <input type="number" min="1" step="0.1" value={maxWeight} onChange={e => setMaxWeight(e.target.value)} />
        </label>
      </section>

      <section className="directory-results">
        {loading && <p className="dog-empty">Loading dogs...</p>}
        {error && <p className="form-error">Could not load dogs.</p>}
        {!loading && !error && dogs.length === 0 && <p className="dog-empty">No dogs match these filters.</p>}
        {!loading && !error && dogs.map(({ dog, owner }) => (
          <article className="dog-card" key={`${owner.id}-${dog.id}`}>
            <div className="dog-card-header">
              <div>
                <h3>{dog.name}</h3>
                <p>{dog.breed}{owner.human?.name ? ` with ${owner.human.name}` : ''}</p>
              </div>
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
                <dd>{getTemperamentTokens(dog.temperament).join(', ')}</dd>
              </div>
              <div>
                <dt>Off leash</dt>
                <dd>{dog.offLeashBehavior}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{owner.human?.location ?? 'Unknown'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}
