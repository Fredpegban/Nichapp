import { Schema, model, models, Document } from 'mongoose';

export type UserRole = 'founder' | 'supporter' | 'admin';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  country?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['founder', 'supporter', 'admin'],
      default: 'supporter',
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: String,
    country: String,
    region: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = models.User || model<IUser>('User', userSchema);

export default User;
