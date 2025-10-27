/**
 * Authentication Routes
 *
 * HTTP endpoints for authentication operations.
 * Thin layer that delegates business logic to AuthService.
 */

import { Router } from "express";
import { authService } from "../services/AuthService";
import { rateLimiter, resetRateLimit } from "../middleware/rateLimiter";
import { isAuthenticated } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with email, password, and portal type
 */
router.post("/login", rateLimiter(5), async (req, res) => {
  try {
    const { email, password, portalType } = req.body;

    // Business logic in service
    const user = await authService.login(email, password, portalType);

    // Session management
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Store user ID and portal type in session
      req.session.userId = user.id;
      req.session.portalType = portalType;

      // Reset rate limit on successful login
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      resetRateLimit(clientIp);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({ message: error.message || "Login failed" });
  }
});

/**
 * POST /api/auth/signup
 * Create new super admin account with signup token
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, token } = req.body;

    const user = await authService.signup(email, password, token);

    res.status(201).json({
      message: "Super admin account created successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    const statusCode = error.message.includes("already exists") ? 409 :
                       error.message.includes("Invalid") ? 403 : 500;

    res.status(statusCode).json({ message: error.message || "Signup failed" });
  }
});

/**
 * POST /api/auth/fix-super-admin
 * Fix existing super admin without organization
 */
router.post("/fix-super-admin", async (req, res) => {
  try {
    const { email, fixToken } = req.body;

    const user = await authService.fixSuperAdmin(email, fixToken);

    res.json({
      message: "Super admin organization fixed successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error: any) {
    console.error("Fix super admin error:", error);

    const statusCode = error.message.includes("not found") ? 404 :
                       error.message.includes("Invalid") ? 403 :
                       error.message.includes("already has") ? 400 : 500;

    res.status(statusCode).json({ message: error.message || "Fix failed" });
  }
});

/**
 * POST /api/auth/logout
 * Destroy user session
 */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logout successful" });
  });
});

/**
 * GET /api/auth/user
 * Get current authenticated user
 */
router.get("/user", isAuthenticated, async (req, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    organizationId: user.organizationId,
    portalType: req.session.portalType, // Include portal type
  });
});

/**
 * GET /api/auth/permissions
 * Get current user's permissions
 */
router.get("/permissions", isAuthenticated, async (req, res) => {
  try {
    const user = req.user!;
    const permissions = await storage.getUserPermissions(user.id);
    res.json(Array.from(permissions).map((name) => ({ name })));
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Error fetching permissions" });
  }
});

export default router;
