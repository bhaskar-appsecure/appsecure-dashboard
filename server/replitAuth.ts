import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
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
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Role-based access control middleware
export const hasPermission = (requiredPermission: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      const user = req.user as any;
      
      if (!req.isAuthenticated() || !user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = user.claims.sub;
      
      // Check if user is super admin first (bypass all permissions)
      const dbUser = await storage.getUser(userId);
      if (dbUser?.role === 'super_admin') {
        return next();
      }
      
      // Get user permissions efficiently in one query
      const userPermissions = await storage.getUserPermissions(userId);
      
      if (!userPermissions.has(requiredPermission)) {
        return res.status(403).json({ 
          message: "Access denied", 
          requiredPermission 
        });
      }
      
      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

// Check multiple permissions (user must have ALL of them)
export const hasAllPermissions = (requiredPermissions: string[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      const user = req.user as any;
      
      if (!req.isAuthenticated() || !user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = user.claims.sub;
      
      // Check if user is super admin first (bypass all permissions)
      const dbUser = await storage.getUser(userId);
      if (dbUser?.role === 'super_admin') {
        return next();
      }
      
      // Get user permissions efficiently in one query
      const userPermissions = await storage.getUserPermissions(userId);
      
      // Check if user has all required permissions
      const missingPermissions = requiredPermissions.filter(p => !userPermissions.has(p));
      
      if (missingPermissions.length > 0) {
        return res.status(403).json({ 
          message: "Access denied", 
          missingPermissions 
        });
      }
      
      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

// Check if user has any of the provided permissions
export const hasAnyPermission = (allowedPermissions: string[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      const user = req.user as any;
      
      if (!req.isAuthenticated() || !user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = user.claims.sub;
      
      // Check if user is super admin first (bypass all permissions)
      const dbUser = await storage.getUser(userId);
      if (dbUser?.role === 'super_admin') {
        return next();
      }
      
      // Get user permissions efficiently in one query
      const userPermissions = await storage.getUserPermissions(userId);
      
      // Check if user has any of the allowed permissions
      const hasAllowedPermission = allowedPermissions.some(p => userPermissions.has(p));
      
      if (!hasAllowedPermission) {
        return res.status(403).json({ 
          message: "Access denied", 
          allowedPermissions 
        });
      }
      
      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

// Super admin check - users with role 'super_admin'
export const isSuperAdmin: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user as any;
    
    if (!req.isAuthenticated() || !user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user.claims.sub;
    const dbUser = await storage.getUser(userId);
    
    if (dbUser?.role !== 'super_admin') {
      return res.status(403).json({ 
        message: "Super admin access required" 
      });
    }
    
    next();
  } catch (error) {
    console.error("Error checking super admin status:", error);
    res.status(500).json({ message: "Error checking admin status" });
  }
};