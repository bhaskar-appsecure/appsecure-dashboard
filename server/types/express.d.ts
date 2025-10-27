/**
 * Express Type Extensions
 *
 * Extends Express Request and Session types for TypeScript support.
 * Enables type-safe access to req.user and req.session properties.
 */

import type { User } from "../../shared/schema";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: typeof User.$inferSelect;
    }
  }
}

// Extend express-session SessionData interface
declare module "express-session" {
  interface SessionData {
    userId?: string;
    portalType?: 'client' | 'appsecure';
  }
}

export {};
