/**
 * Auth API Client
 * 
 * This file contains all authentication-related API calls.
 * Uses the apiRequest helper from queryClient for consistent error handling.
 */

import { apiRequest } from "../queryClient";

/**
 * TypeScript Types for Auth
 */
export interface LoginRequest {
  email: string;
  password: string;
  portalType: 'client' | 'appsecure';
}

export interface SignupRequest {
  email: string;
  password: string;
  token: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: string;
  portalType?: 'client' | 'appsecure';
}

export interface AuthResponse {
  message: string;
  user: User;
}

/**
 * Login API Call
 * 
 * @param credentials - Email, password, and portal type
 * @returns User object on success
 * 
 * 🎓 LEARNING: This is a standard fetch wrapper
 * - Sends POST request to /api/auth/login
 * - Includes credentials (cookies) automatically
 * - Returns JSON response
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  return response.json();
}

/**
 * Signup API Call (Bootstrap Super Admin)
 * 
 * @param data - Email, password, and signup token
 * @returns User object on success
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await apiRequest('POST', '/api/auth/signup', data);
  return response.json();
}

/**
 * Logout API Call
 * 
 * @returns Success message
 */
export async function logout(): Promise<{ message: string }> {
  const response = await apiRequest('POST', '/api/auth/logout');
  return response.json();
}

/**
 * Get Current User
 * 
 * @returns Current authenticated user or null
 * 
 * 🎓 LEARNING: This is called a "query" in React Query
 * - Fetches current user from session
 * - Returns null if not authenticated (401)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include', // Important: Include session cookie
    });
    
    if (response.status === 401) {
      return null; // Not authenticated
    }
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
