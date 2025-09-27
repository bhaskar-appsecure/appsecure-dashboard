import bcrypt from 'bcryptjs';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Simple in-memory rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if outside window
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if exceeded limit
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  
  // Increment count
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
};

const resetRateLimit = (ip: string): void => {
  loginAttempts.delete(ip);
};

const SALT_ROUNDS = 12;

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Session configuration
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // CSRF protection
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Attach user to request for convenience
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Role-based access control middleware
export const hasPermission = (requiredPermission: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user is super admin first (bypass all permissions)
      if (user.role === 'super_admin') {
        return next();
      }
      
      // Get user permissions efficiently in one query
      const userPermissions = await storage.getUserPermissions(user.id);
      
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
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user is super admin first (bypass all permissions)
      if (user.role === 'super_admin') {
        return next();
      }
      
      // Get user permissions efficiently in one query
      const userPermissions = await storage.getUserPermissions(user.id);
      
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
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user is super admin first (bypass all permissions)
      if (user.role === 'super_admin') {
        return next();
      }
      
      // Get user permissions efficiently in one query
      const userPermissions = await storage.getUserPermissions(user.id);
      
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
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (user.role !== 'super_admin') {
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

// Setup authentication
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Signup endpoint with hardcoded token for super admin creation
  app.post("/api/signup", async (req, res) => {
    try {
      const { email, password, token } = req.body;

      if (!email || !password || !token) {
        return res.status(400).json({ message: "Email, password, and token are required" });
      }

      // Check hardcoded signup token
      if (token !== "Q7emI3Z3tOo6b2xc70") {
        return res.status(403).json({ message: "Invalid signup token" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create a default organization for the super admin
      const defaultOrg = await storage.createOrganization({
        name: "Admin Organization",
        domain: email.split('@')[1] || "admin.local",
        settings: {}
      });

      // Create super admin user with organization
      const newUser = {
        email,
        firstName: "Super",
        lastName: "Admin",
        passwordHash,
        role: "super_admin" as const,
        organizationId: defaultOrg.id,
        isActive: true
      };

      const createdUser = await storage.upsertUser(newUser);

      res.status(201).json({
        message: "Super admin account created successfully",
        user: {
          id: createdUser.id,
          email: createdUser.email,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          role: createdUser.role
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Fix existing super admin without organization - special endpoint
  app.post("/api/fix-super-admin", async (req, res) => {
    try {
      const { email, fixToken } = req.body;

      // Use the same hardcoded token for security
      if (fixToken !== "Q7emI3Z3tOo6b2xc70") {
        return res.status(403).json({ message: "Invalid fix token" });
      }

      // Get the user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "super_admin") {
        return res.status(403).json({ message: "Only super admin accounts can be fixed" });
      }

      if (user.organizationId) {
        return res.status(400).json({ message: "User already has an organization" });
      }

      // Create organization for the super admin
      const defaultOrg = await storage.createOrganization({
        name: "AppSecure Organization",
        domain: email.split('@')[1] || "appsecure.local",
        settings: {}
      });

      // Update user with organization
      const updatedUser = await storage.upsertUser({
        ...user,
        organizationId: defaultOrg.id
      });

      res.json({
        message: "Super admin organization fixed successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          organizationId: updatedUser.organizationId
        }
      });
    } catch (error) {
      console.error("Fix super admin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Check rate limit
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          message: "Too many login attempts. Please try again later." 
        });
      }

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        
        // Create session with new ID
        req.session.userId = user.id;
        
        // Reset rate limit on successful login
        resetRateLimit(clientIp);
        
        res.json({ 
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const user = (req as any).user;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId
    });
  });

  // Get user permissions endpoint
  app.get("/api/auth/permissions", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const permissions = await storage.getUserPermissions(user.id);
      res.json(Array.from(permissions).map(name => ({ name })));
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Error fetching permissions" });
    }
  });
}

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}