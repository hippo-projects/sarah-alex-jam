import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from './models/User.js';
import { signToken, verifyToken } from './auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface AuthContext {
  authToken?: string;
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
      return { id: user._id.toString(), email: user.email };
    },
  },

  Mutation: {
    register: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('Email already registered');

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, passwordHash });
      const token = signToken(user._id.toString());
      return { token, user: { id: user._id.toString(), email: user.email } };
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials');

      const token = signToken(user._id.toString());
      return { token, user: { id: user._id.toString(), email: user.email } };
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
      return { token, user: { id: user._id.toString(), email: user.email } };
    },
  },
};
