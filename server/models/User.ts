import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  mobileNumber: string;
  password: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{10}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      match: /.+@.+\..+/,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.index({ mobileNumber: 1, role: 1 }, { unique: true });

export const User = model<IUser>('User', userSchema);
