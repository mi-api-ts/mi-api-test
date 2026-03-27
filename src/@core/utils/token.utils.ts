import jwt from 'jsonwebtoken';
import { JWT_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '@core/config/constants';
import { TokenPayload } from '../types/auth.types';

export function generateTokens(userId: string): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(
    {
      userId,
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY
    },
    JWT_SECRET
  );

  const refreshToken = jwt.sign(
    {
      userId,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY
    },
    JWT_SECRET
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
