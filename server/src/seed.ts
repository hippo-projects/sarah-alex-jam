import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sarah-alex-jam';
const SAMPLE_PASSWORD = 'password123';

const sampleUsers = [
  {
    email: 'sample.alex@example.com',
    human: { name: 'Alex Morgan', gender: 'Non-binary', location: 'Oakland, CA', radius: 15 },
    dogs: [
      { name: 'Miso', breed: 'Shiba Inu', age: 3, temperament: ['Independent', 'Curious'], size: 'Small', weight: 22, offLeashBehavior: 'Needs leash' },
      { name: 'June', breed: 'Mixed breed', age: 5, temperament: ['Calm', 'Gentle'], size: 'Medium', weight: 38, offLeashBehavior: 'Sometimes reliable' },
    ],
  },
  {
    email: 'sample.jamie@example.com',
    human: { name: 'Jamie Lee', gender: 'Woman', location: 'Berkeley, CA', radius: 20 },
    dogs: [
      { name: 'River', breed: 'Golden Retriever', age: 4, temperament: ['Friendly', 'Playful', 'Social'], size: 'Large', weight: 66, offLeashBehavior: 'Reliable recall' },
    ],
  },
  {
    email: 'sample.casey@example.com',
    human: { name: 'Casey Patel', gender: 'Man', location: 'San Francisco, CA', radius: 12 },
    dogs: [
      { name: 'Bean', breed: 'French Bulldog', age: 2, temperament: ['Affectionate', 'Playful'], size: 'Small', weight: 24, offLeashBehavior: 'Needs leash' },
      { name: 'Nori', breed: 'Boston Terrier', age: 6, temperament: ['Friendly', 'Calm'], size: 'Small', weight: 19, offLeashBehavior: 'Sometimes reliable' },
    ],
  },
  {
    email: 'sample.taylor@example.com',
    human: { name: 'Taylor Smith', gender: 'Prefer not to say', location: 'Alameda, CA', radius: 10 },
    dogs: [
      { name: 'Atlas', breed: 'German Shepherd', age: 5, temperament: ['Confident', 'Protective', 'Energetic'], size: 'Large', weight: 82, offLeashBehavior: 'Reliable recall' },
    ],
  },
  {
    email: 'sample.riley@example.com',
    human: { name: 'Riley Chen', gender: 'Woman', location: 'Emeryville, CA', radius: 18 },
    dogs: [
      { name: 'Poppy', breed: 'Cavalier King Charles Spaniel', age: 7, temperament: ['Gentle', 'Affectionate', 'Calm'], size: 'Small', weight: 17, offLeashBehavior: 'Sometimes reliable' },
      { name: 'Scout', breed: 'Beagle', age: 3, temperament: ['Curious', 'Energetic', 'Social'], size: 'Medium', weight: 29, offLeashBehavior: 'Needs leash' },
    ],
  },
  {
    email: 'sample.morgan@example.com',
    human: { name: 'Morgan Diaz', gender: 'Man', location: 'San Mateo, CA', radius: 25 },
    dogs: [
      { name: 'Koda', breed: 'Siberian Husky', age: 4, temperament: ['Energetic', 'Independent'], size: 'Large', weight: 58, offLeashBehavior: 'Needs leash' },
      { name: 'Blue', breed: 'Australian Cattle Dog', age: 2, temperament: ['Energetic', 'Confident', 'Curious'], size: 'Medium', weight: 42, offLeashBehavior: 'Reliable recall' },
    ],
  },
  {
    email: 'sample.sam@example.com',
    human: { name: 'Sam Johnson', gender: 'Non-binary', location: 'Palo Alto, CA', radius: 30 },
    dogs: [
      { name: 'Waffles', breed: 'Poodle', age: 6, temperament: ['Friendly', 'Gentle', 'Social'], size: 'Medium', weight: 46, offLeashBehavior: 'Reliable recall' },
    ],
  },
  {
    email: 'sample.avery@example.com',
    human: { name: 'Avery Brooks', gender: 'Woman', location: 'Walnut Creek, CA', radius: 20 },
    dogs: [
      { name: 'Moose', breed: 'Great Dane', age: 5, temperament: ['Calm', 'Gentle'], size: 'Extra large', weight: 128, offLeashBehavior: 'Sometimes reliable' },
      { name: 'Pepper', breed: 'Dachshund', age: 8, temperament: ['Protective', 'Curious'], size: 'Small', weight: 14, offLeashBehavior: 'Needs leash' },
    ],
  },
  {
    email: 'sample.quinn@example.com',
    human: { name: 'Quinn Rivera', gender: 'Man', location: 'Daly City, CA', radius: 14 },
    dogs: [
      { name: 'Luna', breed: 'Border Collie', age: 3, temperament: ['Energetic', 'Curious', 'Social'], size: 'Medium', weight: 36, offLeashBehavior: 'Reliable recall' },
      { name: 'Otis', breed: 'Bulldog', age: 6, temperament: ['Calm', 'Affectionate'], size: 'Medium', weight: 52, offLeashBehavior: 'Sometimes reliable' },
      { name: 'Fig', breed: 'Chihuahua', age: 4, temperament: ['Shy', 'Anxious'], size: 'Small', weight: 9, offLeashBehavior: 'Needs leash' },
    ],
  },
  {
    email: 'sample.drew@example.com',
    human: { name: 'Drew Kim', gender: 'Prefer not to say', location: 'San Jose, CA', radius: 35 },
    dogs: [
      { name: 'Sunny', breed: 'Labrador Retriever', age: 2, temperament: ['Friendly', 'Playful', 'Energetic'], size: 'Large', weight: 64, offLeashBehavior: 'Reliable recall' },
      { name: 'Clover', breed: 'Havanese', age: 5, temperament: ['Affectionate', 'Social', 'Gentle'], size: 'Small', weight: 12, offLeashBehavior: 'Sometimes reliable' },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);

  await User.deleteMany({ isSeedUser: true });
  await User.insertMany(sampleUsers.map(user => ({
    ...user,
    isSeedUser: true,
    passwordHash,
  })));

  console.log(`Seeded ${sampleUsers.length} sample human profiles with ${sampleUsers.reduce((total, user) => total + user.dogs.length, 0)} dog profiles.`);
  console.log(`Sample login password: ${SAMPLE_PASSWORD}`);
}

seed()
  .catch(error => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
