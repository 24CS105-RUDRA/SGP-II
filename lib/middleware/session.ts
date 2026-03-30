import { cookies } from 'next/headers';
import { TokenPayload, createAccessToken, createRefreshToken, verifyToken } from './auth';
import type { UserRole } from './rbac';

const ACCESS_TOKEN_NAME = 'accessToken';
const REFRESH_TOKEN_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export async function setSessionTokens(user: TokenPayload): Promise<void> {
  const cookieStore = await cookies();
  
  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);
  
  cookieStore.set(ACCESS_TOKEN_NAME, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24,
  });
  
  cookieStore.set(REFRESH_TOKEN_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_NAME)?.value;
  
  if (!accessToken) {
    return null;
  }
  
  return verifyToken(accessToken);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_NAME);
  cookieStore.delete(REFRESH_TOKEN_NAME);
}

export async function refreshSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_NAME)?.value;
  
  if (!refreshToken) {
    return null;
  }
  
  const user = await verifyToken(refreshToken);
  
  if (!user) {
    await clearSession();
    return null;
  }
  
  await setSessionTokens(user);
  
  return user;
}

export function getTokenFromHeader(request: Headers): string | null {
  const authHeader = request.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function authenticateUser(
  credentials: {
    username: string;
    password: string;
    role: UserRole;
  },
  verifyFn: (username: string, password: string, role: UserRole) => Promise<TokenPayload | null>
): Promise<{ success: boolean; user?: TokenPayload; error?: string }> {
  try {
    const user = await verifyFn(credentials.username, credentials.password, credentials.role);
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    await setSessionTokens(user);
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
}
