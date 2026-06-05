import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  human?: {
    name: string;
    gender: string;
    location: string;
    radius: number;
  };
  dogs?: Array<{
    _id?: { toString(): string };
    name: string;
    breed: string;
    age: number;
    temperament: string[];
    size: string;
    weight: number;
    offLeashBehavior: string;
  }>;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  googleId: { type: String },
  human: {
    name: { type: String },
    gender: { type: String },
    location: { type: String },
    radius: { type: Number },
  },
  dogs: [{
    name: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    temperament: [{ type: String, required: true }],
    size: { type: String, required: true },
    weight: { type: Number, required: true },
    offLeashBehavior: { type: String, required: true },
  }],
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);
