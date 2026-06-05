import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import { typeDefs } from './schema.js';
import { resolvers, AuthContext } from './resolvers.js';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sarah-alex-jam';
const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  // Connect to MongoDB
  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected: ${MONGODB_URI}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connect(MONGODB_URI).catch((err) => {
    console.warn('Could not connect to MongoDB (server will still run):', err.message);
  });

  // Start Apollo Server
  const server = new ApolloServer<AuthContext>({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => {
      const authHeader = req.headers.authorization ?? '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      return { authToken: token };
    },
  });

  console.log(`GraphQL server ready at ${url}`);
}

main().catch(console.error);
