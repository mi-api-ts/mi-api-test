import { ObjectId } from 'mongodb';
import { StoredUser } from '../types/user.types';

import { generateTokens } from '../utils/token.utils';
import { REALM_API_KEY } from '../config/constants';

// Almacenamiento en memoria (en producción usar MongoDB)
const usersDb: Map<string, StoredUser> = new Map();

// Usuario por defecto
const defaultUser: StoredUser = {
  userId: new ObjectId().toHexString(),
  apiKey: REALM_API_KEY,
  profile: {
    email: 'simulado@ejemplo.com',
    name: 'Usuario Simulado',
    picture: 'https://ejemplo.com/avatar.png'
  },
  createdAt: new Date()
};

usersDb.set(defaultUser.userId, defaultUser);

export function getUserByApiKey(apiKey: string): StoredUser | undefined {
  console.log("apiKey",apiKey,usersDb.values())
  for (const user of usersDb.values()) {
    if (user.apiKey === apiKey) {
      return user;
    }
  }
  return undefined;
}

export function createUserFromApiKey(apiKey: string): StoredUser {
  const userId = new ObjectId().toHexString();
  const newUser: StoredUser = {
    userId,
    apiKey,
    profile: {
      email: `user_${userId.substring(0, 8)}@simulado.local`,
      name: `Usuario ${userId.substring(0, 8)}`
    },
    createdAt: new Date()
  };
  usersDb.set(userId, newUser);
  return newUser;
}

export function getUserById(userId: string): StoredUser | undefined {
  return usersDb.get(userId);
}

export function userExists(userId: string): boolean {
  return usersDb.has(userId);
}

export function createLoginResponse(userId: string) {
  const { accessToken, refreshToken } = generateTokens(userId);
  return {
    user_id: userId,
    access_token: accessToken,
    refresh_token: refreshToken,
    device_id: '000000000000000000000000'
  };
}

export function createRefreshResponse(userId: string) {
  const { accessToken } = generateTokens(userId);
  return { access_token: accessToken };
}
