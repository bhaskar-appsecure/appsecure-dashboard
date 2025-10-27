/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiting for login attempts and other sensitive endpoints.
 * Tracks attempts per IP address with configurable limits and time windows.
 */

import type { RequestHandler } from "express";

// In-memory store for rate limiting
const attemptStore = new Map<string, { count: number; lastAttempt: number }>();

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Rate limiting middleware factory
 * @param maxAttempts - Maximum number of attempts allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns Express middleware
 */
export const rateLimiter = (
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW
): RequestHandler => {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const attempts = attemptStore.get(ip);

    // First attempt from this IP
    if (!attempts) {
      attemptStore.set(ip, { count: 1, lastAttempt: now });
      return next();
    }

    // Reset if outside window
    if (now - attempts.lastAttempt > windowMs) {
      attemptStore.set(ip, { count: 1, lastAttempt: now });
      return next();
    }

    // Check if exceeded limit
    if (attempts.count >= maxAttempts) {
      return res.status(429).json({
        message: "Too many attempts. Please try again later.",
      });
    }

    // Increment count
    attempts.count++;
    attempts.lastAttempt = now;
    next();
  };
};

/**
 * Reset rate limit for a specific IP (e.g., after successful login)
 * @param ip - IP address to reset
 */
export function resetRateLimit(ip: string): void {
  attemptStore.delete(ip);
}

/**
 * Check if an IP has exceeded rate limit (without incrementing)
 * @param ip - IP address to check
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns Boolean indicating if rate limit is exceeded
 */
export function isRateLimited(
  ip: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW
): boolean {
  const now = Date.now();
  const attempts = attemptStore.get(ip);

  if (!attempts) return false;

  // Reset if outside window
  if (now - attempts.lastAttempt > windowMs) {
    attemptStore.delete(ip);
    return false;
  }

  return attempts.count >= maxAttempts;
}
