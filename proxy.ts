import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rate Limiting Proxy
 *
 * Simple in-memory rate limiting to protect against abuse.
 * Limits are per-IP and reset after the window expires.
 *
 * Limitations:
 * - In-memory store doesn't share across serverless instances
 * - Effective for casual abuse prevention, not distributed attacks
 *
 * Future upgrades:
 * - Replace with Vercel KV or Upstash Redis for distributed limiting
 * - Add Cloudflare Turnstile verification
 * - Add per-user limits (by API key hash)
 */

// --- Configuration ---

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/chat': { windowMs: 60_000, maxRequests: 20 }, // 20 req/min
  '/api/auth': { windowMs: 60_000, maxRequests: 30 }, // 30 req/min for auth endpoints
  default: { windowMs: 60_000, maxRequests: 60 }, // 60 req/min for other API routes
};

// --- In-Memory Store ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Map of "ip:route" -> rate limit entry
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// --- Rate Limit Logic ---

function getClientIp(request: NextRequest): string {
  // Vercel provides the real IP in x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback headers
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Last resort (usually 127.0.0.1 in dev)
  return 'unknown';
}

function getRouteKey(pathname: string): string {
  // Match specific routes first
  if (pathname.startsWith('/api/chat')) return '/api/chat';
  if (pathname.startsWith('/api/auth')) return '/api/auth';
  return 'default';
}

function checkRateLimit(
  ip: string,
  routeKey: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMITS[routeKey] || RATE_LIMITS.default;
  const storeKey = `${ip}:${routeKey}`;
  const now = Date.now();

  let entry = rateLimitStore.get(storeKey);

  // Create new entry or reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    rateLimitStore.set(storeKey, entry);
  }

  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return { allowed, remaining, resetAt: entry.resetAt };
}

// --- Proxy ---

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting for certain endpoints if needed
  // e.g., health checks, webhooks with signatures
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  // Periodic cleanup
  cleanupStaleEntries();

  const ip = getClientIp(request);
  const routeKey = getRouteKey(pathname);
  const { allowed, remaining, resetAt } = checkRateLimit(ip, routeKey);

  // Add rate limit headers to all responses
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', String(RATE_LIMITS[routeKey]?.maxRequests || 60));
  headers.set('X-RateLimit-Remaining', String(remaining));
  headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Please slow down. Try again in a minute.',
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          ...Object.fromEntries(headers),
        },
      }
    );
  }

  // Continue with rate limit headers
  const response = NextResponse.next();
  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

// --- Matcher Configuration ---

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
