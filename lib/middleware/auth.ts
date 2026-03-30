import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from './rbac';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

const JWT_ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  full_name: string;
  year_of_study?: string;
  division?: string;
  standard?: string;
  exp?: number;
  iat?: number;
}

export async function createAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function createRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (
      typeof payload.id === 'string' &&
      typeof payload.username === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.full_name === 'string'
    ) {
      return {
        id: payload.id,
        username: payload.username,
        role: payload.role as UserRole,
        email: payload.email,
        full_name: payload.full_name,
        year_of_study: payload.year_of_study as string | undefined,
        division: payload.division as string | undefined,
        standard: payload.standard as string | undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPayload | null> {
  const payload = await verifyToken(refreshToken);
  if (!payload) {
    return null;
  }

  const { exp, iat, ...tokenPayload } = payload;
  return tokenPayload as TokenPayload;
}
