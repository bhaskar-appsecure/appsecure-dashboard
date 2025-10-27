/**
 * Authentication Service
 *
 * Business logic for authentication operations.
 * Handles login validation, portal access control, and signup.
 */

import { hashPassword, verifyPassword } from "../utils/password";
import { storage } from "../storage";

export class AuthService {
  /**
   * Authenticate user and validate portal access
   * @param email - User email
   * @param password - Plain text password
   * @param portalType - Portal type (client or appsecure)
   * @returns User object if authentication successful
   * @throws Error if authentication fails
   */
  async login(
    email: string,
    password: string,
    portalType: 'client' | 'appsecure'
  ) {
    // 1. Validate input
    if (!email || !password || !portalType) {
      throw new Error("Email, password, and portal type are required");
    }

    if (portalType !== 'client' && portalType !== 'appsecure') {
      throw new Error("Invalid portal type");
    }

    // 2. Get user from database
    const user = await storage.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    // 3. Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // 4. Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // 5. Validate portal access based on role
    this.validatePortalAccess(user.role, portalType);

    return user;
  }

  /**
   * Validate if user's role is allowed for the portal type
   * @param role - User's role
   * @param portalType - Portal type being accessed
   * @throws Error if role is not allowed for portal
   */
  private validatePortalAccess(
    role: string,
    portalType: 'client' | 'appsecure'
  ): void {
    const clientRoles = ['customer_admin', 'project_user'];
    const internalRoles = ['org_admin', 'researcher', 'super_admin'];

    if (portalType === 'client' && !clientRoles.includes(role)) {
      throw new Error(
        "Access denied. Your account is not authorized for the Client Portal."
      );
    }

    if (portalType === 'appsecure' && !internalRoles.includes(role)) {
      throw new Error(
        "Access denied. Your account is not authorized for the Internal Portal."
      );
    }
  }

  /**
   * Create a new super admin account with signup token
   * @param email - User email
   * @param password - Plain text password
   * @param token - Signup token (for security)
   * @returns Created user object
   * @throws Error if signup fails
   */
  async signup(email: string, password: string, token: string) {
    // 1. Validate input
    if (!email || !password || !token) {
      throw new Error("Email, password, and token are required");
    }

    // 2. Check hardcoded signup token
    const SIGNUP_TOKEN = process.env.SIGNUP_TOKEN || "Q7emI3Z3tOo6b2xc70";
    if (token !== SIGNUP_TOKEN) {
      throw new Error("Invalid signup token");
    }

    // 3. Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // 4. Hash password
    const passwordHash = await hashPassword(password);

    // 5. Create default organization for super admin
    const defaultOrg = await storage.createOrganization({
      name: "Admin Organization",
      domain: email.split('@')[1] || "admin.local",
      settings: {},
    });

    // 6. Create super admin user
    const newUser = await storage.upsertUser({
      email,
      firstName: "Super",
      lastName: "Admin",
      passwordHash,
      role: "super_admin",
      organizationId: defaultOrg.id,
      isActive: true,
    });

    return newUser;
  }

  /**
   * Fix existing super admin without organization
   * @param email - User email
   * @param fixToken - Fix token (for security)
   * @returns Updated user object
   * @throws Error if fix fails
   */
  async fixSuperAdmin(email: string, fixToken: string) {
    // 1. Validate token
    const FIX_TOKEN = process.env.SIGNUP_TOKEN || "Q7emI3Z3tOo6b2xc70";
    if (fixToken !== FIX_TOKEN) {
      throw new Error("Invalid fix token");
    }

    // 2. Get user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "super_admin") {
      throw new Error("Only super admin accounts can be fixed");
    }

    if (user.organizationId) {
      throw new Error("User already has an organization");
    }

    // 3. Create organization
    const defaultOrg = await storage.createOrganization({
      name: "AppSecure Organization",
      domain: email.split('@')[1] || "appsecure.local",
      settings: {},
    });

    // 4. Update user with organization
    const updatedUser = await storage.upsertUser({
      ...user,
      organizationId: defaultOrg.id,
    });

    return updatedUser;
  }
}

// Export singleton instance
export const authService = new AuthService();
