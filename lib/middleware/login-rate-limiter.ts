'use strict';

import { NextRequest, NextResponse } from 'next/server';

interface LoginAttempt {
  count: number;
  lockedUntil?: number;
  lockoutCount: number;
}

const LOGIN_ATTEMPTS = new Map<string, LoginAttempt>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const FIRST_LOCKOUT_DURATION_MS = 1 * 60 * 1000;
const SUBSEQUENT_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const IP_GLOBAL_ATTEMPTS = new Map<string, { count: number; lockedUntil?: number }>();
const MAX_IP_ATTEMPTS = 20;
const IP_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return 'unknown';
}

function isAccountLocked(username: string): boolean {
  const attempts = LOGIN_ATTEMPTS.get(username);
  if (!attempts) return false;
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true;
  }
  
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    LOGIN_ATTEMPTS.delete(username);
    return false;
  }
  
  return false;
}

function recordFailedLoginAttempt(username: string): void {
  const attempts = LOGIN_ATTEMPTS.get(username) || { count: 0, lockoutCount: 0 };
  attempts.count++;

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const lockoutDuration = attempts.lockoutCount === 0 
      ? FIRST_LOCKOUT_DURATION_MS 
      : SUBSEQUENT_LOCKOUT_DURATION_MS;
    attempts.lockedUntil = Date.now() + lockoutDuration;
    attempts.lockoutCount++;
  }

  LOGIN_ATTEMPTS.set(username, attempts);
}

function clearFailedLoginAttempts(username: string): void {
  LOGIN_ATTEMPTS.delete(username);
}

function getRemainingLoginAttempts(username: string): number {
  const attempts = LOGIN_ATTEMPTS.get(username);
  if (!attempts) return MAX_LOGIN_ATTEMPTS;
  return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.count);
}

function isIpLocked(ip: string): boolean {
  const attempts = IP_GLOBAL_ATTEMPTS.get(ip);
  if (!attempts) return false;
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true;
  }
  
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    IP_GLOBAL_ATTEMPTS.delete(ip);
    return false;
  }
  
  return false;
}

function recordIpAttempt(ip: string): void {
  const attempts = IP_GLOBAL_ATTEMPTS.get(ip) || { count: 0 };
  attempts.count++;
  
  if (attempts.count >= MAX_IP_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + IP_WINDOW_MS;
  }
  
  IP_GLOBAL_ATTEMPTS.set(ip, attempts);
}

function cleanExpiredAttempts(): void {
  const now = Date.now();
  
  for (const [key, value] of LOGIN_ATTEMPTS.entries()) {
    if (value.lockedUntil && value.lockedUntil < now) {
      LOGIN_ATTEMPTS.delete(key);
    }
  }
  
  for (const [key, value] of IP_GLOBAL_ATTEMPTS.entries()) {
    if (value.lockedUntil && value.lockedUntil < now) {
      IP_GLOBAL_ATTEMPTS.delete(key);
    }
  }
}

setInterval(cleanExpiredAttempts, 60 * 1000);

export function checkLoginRateLimit(request: NextRequest): {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
  error?: string;
} {
  const ip = getClientIp(request);
  
  if (ip === 'unknown') {
    return {
      allowed: true,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
    };
  }
  
  if (isIpLocked(ip)) {
    const attempts = IP_GLOBAL_ATTEMPTS.get(ip);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempts?.lockedUntil,
      error: 'Too many requests from your IP. Please try again later.',
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: MAX_LOGIN_ATTEMPTS,
  };
}

export function recordLoginFailure(username: string): void {
  recordFailedLoginAttempt(username);
  
  const ip = 'global';
  recordIpAttempt(ip);
}

export function checkAccountLockout(username: string): {
  locked: boolean;
  lockedUntil?: number;
  remainingAttempts: number;
} {
  const attempts = LOGIN_ATTEMPTS.get(username);
  
  if (!attempts) {
    return {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
    };
  }
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return {
      locked: true,
      lockedUntil: attempts.lockedUntil,
      remainingAttempts: 0,
    };
  }
  
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    LOGIN_ATTEMPTS.delete(username);
    return {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
    };
  }
  
  return {
    locked: false,
    remainingAttempts: getRemainingLoginAttempts(username),
  };
}

export function clearLoginAttempts(username: string): void {
  clearFailedLoginAttempts(username);
}

export function loginRateLimitMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  
  if (!pathname.startsWith('/api/auth/login')) {
    return null;
  }
  
  const ip = getClientIp(request);
  const { allowed, lockedUntil, error } = checkLoginRateLimit(request);
  
  const response = NextResponse.next();
  
  response.headers.set('X-RateLimit-Limit', String(MAX_LOGIN_ATTEMPTS));
  
  if (!allowed) {
    const retryAfter = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 900;
    response.headers.set('Retry-After', String(retryAfter));
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', String(Math.ceil((lockedUntil || Date.now()) / 1000)));
    
    return NextResponse.json(
      { error: error || 'Too many login attempts. Please try again later.' },
      { status: 429, headers: Object.fromEntries(response.headers) }
    );
  }
  
  response.headers.set('X-RateLimit-Remaining', String(MAX_LOGIN_ATTEMPTS));
  
  return null;
}
