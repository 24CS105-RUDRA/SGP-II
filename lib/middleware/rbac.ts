import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export type UserRole = 'student' | 'faculty' | 'admin';

interface RoutePermission {
  roles: UserRole[];
  method: string[];
}

const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  '/api/admin': {
    roles: ['admin'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  '/api/faculty': {
    roles: ['admin', 'faculty'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  '/api/students': {
    roles: ['admin', 'faculty', 'student'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  '/api/notices': {
    roles: ['admin', 'faculty', 'student'],
    method: ['GET'],
  },
  '/api/fees': {
    roles: ['admin', 'faculty', 'student'],
    method: ['GET'],
  },
  '/api/attendance': {
    roles: ['admin', 'faculty', 'student'],
    method: ['GET'],
  },
  '/api/homework': {
    roles: ['admin', 'faculty', 'student'],
    method: ['GET'],
  },
  '/api/upload': {
    roles: ['admin', 'faculty'],
    method: ['POST', 'DELETE'],
  },
  '/api/delete': {
    roles: ['admin', 'faculty'],
    method: ['DELETE'],
  },
};

const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/seed',
];

export async function getUserFromRequest(request: NextRequest): Promise<{ role: UserRole; id: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        return verifyToken(token);
      }
      return null;
    }

    return verifyToken(token);
  } catch {
    return null;
  }
}

export function checkRoutePermission(pathname: string, method: string): { allowed: boolean; requiredRoles: UserRole[] } {
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (permission.method.includes(method)) {
        return { allowed: true, requiredRoles: permission.roles };
      }
    }
  }
  return { allowed: false, requiredRoles: [] };
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export async function rbacMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return null;
  }

  if (!pathname.startsWith('/api/')) {
    return null;
  }

  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const { allowed, requiredRoles } = checkRoutePermission(pathname, method);

  if (!allowed) {
    return null;
  }

  if (!hasRole(user.role, requiredRoles)) {
    return NextResponse.json(
      { error: 'Access denied. Insufficient permissions.' },
      { status: 403 }
    );
  }

  return null;
}

export function withRoleCheck<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  allowedRoles: UserRole[]
): T {
  return (async (request: NextRequest, ...args: any[]) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Insufficient permissions.' },
        { status: 403 }
      );
    }

    return handler(request, ...args);
  }) as T;
}
