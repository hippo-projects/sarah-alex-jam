import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from './models/User.js';
import { signToken, verifyToken } from './auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface AuthContext {
  authToken?: string;
}

interface DogInput {
  name: string;
  breed: string;
  age: number;
  temperament: string[];
  size: string;
  weight: number;
  offLeashBehavior: string;
}

interface DogSearchFilters {
  breed?: string;
  temperament?: string[];
  size?: string;
  offLeashBehavior?: string;
  minAge?: number;
  maxAge?: number;
  minWeight?: number;
  maxWeight?: number;
}

type SerializableDog = DogInput & {
  _id?: { toString(): string };
  id?: string;
};

function normalizeTemperament(temperament: string[] | string) {
  const values = Array.isArray(temperament) ? temperament : [temperament];
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function serializeDog(dog: SerializableDog) {
  return {
    id: dog._id?.toString() ?? dog.id ?? `${dog.name}-${dog.breed}`,
    name: dog.name,
    breed: dog.breed,
    age: dog.age,
    temperament: normalizeTemperament(dog.temperament),
    size: dog.size,
    weight: dog.weight,
    offLeashBehavior: dog.offLeashBehavior,
  };
}

function numericSimilarity(left: number, right: number, maxDifference: number) {
  const difference = Math.abs(left - right);
  return Math.max(0, 1 - difference / maxDifference);
}

function sizeSimilarity(left: string, right: string) {
  const order = ['Small', 'Medium', 'Large', 'Extra large'];
  const leftIndex = order.indexOf(left);
  const rightIndex = order.indexOf(right);
  if (leftIndex === -1 || rightIndex === -1) return left === right ? 1 : 0;
  return Math.max(0, 1 - Math.abs(leftIndex - rightIndex) / 3);
}

function calculateDogMatchScore(sourceDog: SerializableDog, candidateDog: SerializableDog) {
  const reasons: string[] = [];
  let score = 0;
  const sourceTemperament = normalizeTemperament(sourceDog.temperament);
  const candidateTemperament = normalizeTemperament(candidateDog.temperament);
  const sharedTemperament = sourceTemperament.filter(source =>
    candidateTemperament.some(candidate => candidate.toLowerCase() === source.toLowerCase()),
  );
  const temperamentScore =
    sharedTemperament.length / Math.max(sourceTemperament.length, candidateTemperament.length, 1);

  score += temperamentScore * 40;
  if (sharedTemperament.length > 0) reasons.push(`Shared temperament: ${sharedTemperament.join(', ')}`);

  const sizeScore = sizeSimilarity(sourceDog.size, candidateDog.size);
  score += sizeScore * 20;
  if (sourceDog.size === candidateDog.size) reasons.push(`Both ${sourceDog.size.toLowerCase()} size`);
  else if (sizeScore > 0.6) reasons.push('Similar size');

  const ageScore = numericSimilarity(sourceDog.age, candidateDog.age, 6);
  score += ageScore * 15;
  if (ageScore > 0.75) reasons.push('Similar age');

  const weightScore = numericSimilarity(sourceDog.weight, candidateDog.weight, 60);
  score += weightScore * 10;
  if (weightScore > 0.75) reasons.push('Similar weight');

  const offLeashScore = sourceDog.offLeashBehavior === candidateDog.offLeashBehavior ? 1 : 0;
  score += offLeashScore * 15;
  if (offLeashScore) reasons.push(`Both ${sourceDog.offLeashBehavior.toLowerCase()}`);

  if (sourceDog.breed === candidateDog.breed) {
    score += 5;
    reasons.push(`Same breed: ${sourceDog.breed}`);
  }

  if (reasons.length === 0) reasons.push('Some profile attributes are compatible');

  return {
    reasons,
    score: Math.round(Math.min(score, 100)),
  };
}

function serializeUser(user: {
  _id: { toString(): string };
  email: string;
  human?: { name: string; gender: string; location: string; radius: number };
  dogs?: Array<DogInput & {
    _id?: { toString(): string };
    id?: string;
  }>;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    human: user.human?.name ? user.human : null,
    dogs: (user.dogs ?? []).map(serializeDog),
  };
}

function validateDogInput({
  name,
  breed,
  age,
  temperament,
  size,
  weight,
  offLeashBehavior,
}: DogInput): DogInput {
  const trimmedName = name.trim();
  const trimmedBreed = breed.trim();
  const normalizedTemperament = normalizeTemperament(temperament);
  const trimmedSize = size.trim();
  const trimmedOffLeashBehavior = offLeashBehavior.trim();

  if (!trimmedName) throw new Error('Dog name is required');
  if (!trimmedBreed) throw new Error('Breed is required');
  if (!Number.isFinite(age) || age < 0) throw new Error('Age must be zero or greater');
  if (normalizedTemperament.length === 0) throw new Error('Temperament is required');
  if (!trimmedSize) throw new Error('Size is required');
  if (!Number.isFinite(weight) || weight <= 0) throw new Error('Weight must be greater than zero');
  if (!trimmedOffLeashBehavior) throw new Error('Off leash behavior is required');

  return {
    name: trimmedName,
    breed: trimmedBreed,
    age,
    temperament: normalizedTemperament,
    size: trimmedSize,
    weight,
    offLeashBehavior: trimmedOffLeashBehavior,
  };
}

function findDogIndex(dogs: Array<{ _id?: { toString(): string } }>, dogId: string) {
  const index = dogs.findIndex(dog => dog._id?.toString() === dogId);
  if (index === -1) throw new Error('Dog profile not found');
  return index;
}

function dogMatchesFilters(dog: SerializableDog, filters: DogSearchFilters = {}) {
  if (filters.breed && dog.breed !== filters.breed) return false;
  if (filters.size && dog.size !== filters.size) return false;
  if (filters.offLeashBehavior && dog.offLeashBehavior !== filters.offLeashBehavior) return false;
  if (Number.isFinite(filters.minAge) && dog.age < Number(filters.minAge)) return false;
  if (Number.isFinite(filters.maxAge) && dog.age > Number(filters.maxAge)) return false;
  if (Number.isFinite(filters.minWeight) && dog.weight < Number(filters.minWeight)) return false;
  if (Number.isFinite(filters.maxWeight) && dog.weight > Number(filters.maxWeight)) return false;

  const filterTemperament = normalizeTemperament(filters.temperament ?? []);
  if (filterTemperament.length > 0) {
    const dogTemperament = normalizeTemperament(dog.temperament).map(value => value.toLowerCase());
    const hasTemperamentMatch = filterTemperament.some(value => dogTemperament.includes(value.toLowerCase()));
    if (!hasTemperamentMatch) return false;
  }

  return true;
}

async function requireUser(authToken?: string) {
  if (!authToken) throw new Error('Not authenticated');
  const payload = verifyToken(authToken);
  if (!payload) throw new Error('Not authenticated');
  const user = await User.findById(payload.userId);
  if (!user) throw new Error('Not authenticated');
  return user;
}

export const resolvers = {
  Query: {
    hello: () => 'Hello from Sarah Alex Jam!',

    me: async (_: unknown, __: unknown, context: AuthContext) => {
      if (!context.authToken) return null;
      const payload = verifyToken(context.authToken);
      if (!payload) return null;
      const user = await User.findById(payload.userId);
      if (!user) return null;
      return serializeUser(user);
    },

    dogMatches: async (_: unknown, { dogId }: { dogId: string }, context: AuthContext) => {
      const user = await requireUser(context.authToken);
      const dogs = user.dogs ?? [];
      const sourceDogIndex = findDogIndex(dogs, dogId);
      const sourceDog = dogs[sourceDogIndex];
      const users = await User.find({ _id: { $ne: user._id }, human: { $exists: true }, dogs: { $exists: true, $ne: [] } });

      return users
        .flatMap(candidateUser => (candidateUser.dogs ?? []).map(candidateDog => {
          const match = calculateDogMatchScore(sourceDog, candidateDog);
          return {
            ...match,
            dog: serializeDog(candidateDog),
            owner: {
              id: candidateUser._id.toString(),
              human: candidateUser.human,
            },
          };
        }))
        .filter(match => match.score > 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, 10);
    },

    dogSearch: async (_: unknown, { filters }: { filters?: DogSearchFilters }, context: AuthContext) => {
      await requireUser(context.authToken);
      const users = await User.find({ human: { $exists: true }, dogs: { $exists: true, $ne: [] } });

      return users.flatMap(user =>
        (user.dogs ?? [])
          .filter(dog => dogMatchesFilters(dog, filters))
          .map(dog => ({
            dog: serializeDog(dog),
            owner: {
              id: user._id.toString(),
              human: user.human,
            },
          })),
      );
    },
  },

  Mutation: {
    register: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('Email already registered');

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, passwordHash });
      const token = signToken(user._id.toString());
      return { token, user: serializeUser(user) };
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials');

      const token = signToken(user._id.toString());
      return { token, user: serializeUser(user) };
    },

    googleLogin: async (_: unknown, { idToken }: { idToken: string }) => {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) throw new Error('Invalid Google token');

      let user = await User.findOne({ googleId: payload.sub });
      if (!user) {
        user = await User.findOne({ email: payload.email });
        if (user) {
          user.googleId = payload.sub;
          await user.save();
        } else {
          user = await User.create({ email: payload.email, googleId: payload.sub });
        }
      }

      const token = signToken(user._id.toString());
      return { token, user: serializeUser(user) };
    },

    onboardHuman: async (
      _: unknown,
      { name, gender, location, radius }: { name: string; gender: string; location: string; radius: number },
      context: AuthContext,
    ) => {
      const trimmedName = name.trim();
      const trimmedGender = gender.trim();
      const trimmedLocation = location.trim();

      if (!trimmedName) throw new Error('Name is required');
      if (!trimmedGender) throw new Error('Gender is required');
      if (!trimmedLocation) throw new Error('Location is required');
      if (!Number.isFinite(radius) || radius <= 0) throw new Error('Radius must be greater than zero');

      const user = await requireUser(context.authToken);
      user.human = {
        name: trimmedName,
        gender: trimmedGender,
        location: trimmedLocation,
        radius,
      };
      await user.save();

      return serializeUser(user);
    },

    addDogProfile: async (
      _: unknown,
      dogInput: DogInput,
      context: AuthContext,
    ) => {
      const user = await requireUser(context.authToken);
      user.dogs = [...(user.dogs ?? []), validateDogInput(dogInput)];
      await user.save();

      return serializeUser(user);
    },

    updateDogProfile: async (
      _: unknown,
      { dogId, ...dogInput }: DogInput & { dogId: string },
      context: AuthContext,
    ) => {
      const user = await requireUser(context.authToken);
      const dogs = user.dogs ?? [];
      const index = findDogIndex(dogs, dogId);
      Object.assign(dogs[index], validateDogInput(dogInput));
      await user.save();

      return serializeUser(user);
    },

    deleteDogProfile: async (
      _: unknown,
      { dogId }: { dogId: string },
      context: AuthContext,
    ) => {
      const user = await requireUser(context.authToken);
      const dogs = user.dogs ?? [];
      const index = findDogIndex(dogs, dogId);
      dogs.splice(index, 1);
      await user.save();

      return serializeUser(user);
    },
  },
};
