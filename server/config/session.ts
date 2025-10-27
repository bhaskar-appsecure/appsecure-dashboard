/**
 * Session Configuration
 *
 * Configures Express session with PostgreSQL store.
 * Sessions are stored in the database for persistence across server restarts.
 */

import session from "express-session";
import connectPg from "connect-pg-simple";

/**
 * Get configured session middleware
 * @returns Express session middleware
 */
export function getSessionConfig() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  const pgStore = connectPg(session);

  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevent JavaScript access to cookies
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: sessionTtl,
    },
  });
}
