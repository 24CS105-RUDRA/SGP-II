import jwt from 'jsonwebtoken';
import { getEnv } from './environment.js';

export interface JWTPayload {
  userId: string;
  mobileNumber: string;
  role: 'student' | 'faculty' | 'admin';
  iat?: number;
  exp?: number;
}

export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE,
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  const env = getEnv();
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  const env = getEnv();
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

export function generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
