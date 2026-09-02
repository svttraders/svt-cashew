import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'super-admin' | 'admin' | 'user';
  isActive: boolean;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    role: { type: String, enum: ['super-admin', 'admin', 'user'], default: 'user' },
    isActive: { type: Boolean, default: true },
    phoneNumber: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
