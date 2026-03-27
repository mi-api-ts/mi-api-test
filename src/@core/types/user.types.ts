import { ObjectId } from 'mongodb';

export interface StoredUser {
  userId: string;
  apiKey: string;
  profile: {
    email?: string;
    name?: string;
    picture?: string;
  };
  createdAt: Date;
}

export interface UserProfileData {
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

export interface UserIdentity {
  id: string;
  provider_type: string;
}
