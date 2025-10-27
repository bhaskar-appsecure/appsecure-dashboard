/**
 * Authentication Middleware
 *
 * Provides reusable middleware for protecting routes and checking permissions.
 * Includes role-based access control and portal-based authentication.
 */

import type { RequestHandler } from "express";
import { storage } from "../storage";

/**
 * Middleware to check if user is authenticated
 * Attaches user object to req.user if valid session exists
 */
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * Middleware factory to check if user has a specific permission
 * @param requiredPermission - Permission string to check (e.g., 'create:project')
 * @returns Express middleware
 */
export const hasPermission = (requiredPermission: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Super admin bypasses all permission checks
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Get user permissions from database
      const userPermissions = await storage.getUserPermissions(req.user.id);

      if (!userPermissions.has(requiredPermission)) {
        return res.status(403).json({
          message: "Access denied",
          requiredPermission,
        });
      }

      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

/**
 * Middleware factory to check if user has ALL of the provided permissions
 * @param requiredPermissions - Array of permission strings
 * @returns Express middleware
 */
export const hasAllPermissions = (
  requiredPermissions: string[]
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Super admin bypasses all permission checks
      if (req.user.role === 'super_admin') {
        return next();
      }

      const userPermissions = await storage.getUserPermissions(req.user.id);

      // Check if user has all required permissions
      const missingPermissions = requiredPermissions.filter(
        (p) => !userPermissions.has(p)
      );

      if (missingPermissions.length > 0) {
        return res.status(403).json({
          message: "Access denied",
          missingPermissions,
        });
      }

      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

/**
 * Middleware factory to check if user has ANY of the provided permissions
 * @param allowedPermissions - Array of permission strings
 * @returns Express middleware
 */
export const hasAnyPermission = (
  allowedPermissions: string[]
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Super admin bypasses all permission checks
      if (req.user.role === 'super_admin') {
        return next();
      }

      const userPermissions = await storage.getUserPermissions(req.user.id);

      // Check if user has any of the allowed permissions
      const hasAllowedPermission = allowedPermissions.some((p) =>
        userPermissions.has(p)
      );

      if (!hasAllowedPermission) {
        return res.status(403).json({
          message: "Access denied",
          allowedPermissions,
        });
      }

      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

/**
 * Middleware to check if user is a super admin
 */
export const isSuperAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        message: "Super admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking super admin status:", error);
    res.status(500).json({ message: "Error checking admin status" });
  }
};

/**
 * Middleware factory to restrict access based on portal type
 * @param allowedPortal - Portal type that is allowed ('client' or 'appsecure')
 * @returns Express middleware
 */
export const requirePortal = (
  allowedPortal: 'client' | 'appsecure'
): RequestHandler => {
  return (req, res, next) => {
    if (!req.session?.portalType) {
      return res.status(401).json({ message: "Portal type not set" });
    }

    if (req.session.portalType !== allowedPortal) {
      return res.status(403).json({
        message: `Access denied. This endpoint requires ${allowedPortal} portal access.`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user's role is allowed for their portal type
 * This is applied during login but can also be used on routes for extra validation
 */
export const validatePortalAccess: RequestHandler = (req, res, next) => {
  if (!req.user || !req.session?.portalType) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const clientRoles = ['customer_admin', 'project_user'];
  const internalRoles = ['org_admin', 'researcher', 'super_admin'];

  const portalType = req.session.portalType;
  const userRole = req.user.role;

  if (portalType === 'client' && !clientRoles.includes(userRole)) {
    return res.status(403).json({
      message: "Your role is not authorized for the Client Portal",
    });
  }

  if (portalType === 'appsecure' && !internalRoles.includes(userRole)) {
    return res.status(403).json({
      message: "Your role is not authorized for the Internal Portal",
    });
  }

  next();
};
