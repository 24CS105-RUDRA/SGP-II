'use strict';

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequestTime: number;
}

const RATE_LIMIT_STORAGE = new Map<string, RateLimitEntry>();

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  upload: { windowMs: 60 * 1000, maxRequests: 10 },
};

const IP_ATTEMPTS = new Map<string, { count: number; lockedUntil?: number }>();
const MAX_IP_ATTEMPTS = 50;
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
  return 'unknown';
}

function isIpLocked(ip: string): boolean {
  const attempts = IP_ATTEMPTS.get(ip);
  if (!attempts) return false;
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return true;
  }
  
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    IP_ATTEMPTS.delete(ip);
    return false;
  }
  
  return false;
}

function recordIpAttempt(ip: string, blocked: boolean = false): void {
  if (blocked) {
    const attempts = IP_ATTEMPTS.get(ip) || { count: 0 };
    attempts.count++;
    if (attempts.count >= MAX_IP_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + IP_WINDOW_MS;
    }
    IP_ATTEMPTS.set(ip, attempts);
  }
}

function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of RATE_LIMIT_STORAGE.entries()) {
    if (value.resetTime < now) {
      RATE_LIMIT_STORAGE.delete(key);
    }
  }
}

setInterval(cleanExpiredEntries, 60 * 1000);

export function getRateLimitKey(request: NextRequest, type: string = 'default'): string {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  return `${type}:${ip}:${path}`;
}

export function checkRateLimit(request: NextRequest, type: string = 'default'): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIp(request);
  
  if (isIpLocked(ip)) {
    return { allowed: false, remaining: 0, resetTime: IP_WINDOW_MS };
  }
  
  const config = RATE_LIMITS[type] || RATE_LIMITS.default;
  const key = getRateLimitKey(request, type);
  
  let entry = RATE_LIMIT_STORAGE.get(key);
  const now = Date.now();
  
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      firstRequestTime: now,
    };
    RATE_LIMIT_STORAGE.set(key, entry);
  }
  
  entry.count++;
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  if (entry.count > config.maxRequests) {
    recordIpAttempt(ip, true);
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  if (entry.count > config.maxRequests * 0.8) {
    recordIpAttempt(ip, true);
  }
  
  return { allowed: true, remaining, resetTime: entry.resetTime };
}

export function rateLimitMiddleware(request: NextRequest, type: string = 'default'): NextResponse | null {
  const { allowed, remaining, resetTime } = checkRateLimit(request, type);
  
  const response = NextResponse.next();
  
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMITS[type]?.maxRequests || RATE_LIMITS.default.maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
  
  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    response.headers.set('Retry-After', String(retryAfter));
    
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfter },
      { status: 429, headers: Object.fromEntries(response.headers) }
    );
  }
  
  return null;
}
