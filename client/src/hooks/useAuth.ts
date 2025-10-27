/**
 * useAuth Hook - React Query Authentication
 * 
 * 🎓 REACT QUERY TUTORIAL:
 * 
 * This hook demonstrates TWO core React Query concepts:
 * 1. useQuery - For fetching data (GET requests)
 * 2. useMutation - For changing data (POST/PUT/DELETE)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, logout, getCurrentUser, type LoginRequest } from '@/lib/api/auth';
import { useNavigate } from 'react-router-dom';

/**
 * 🎓 CONCEPT: useQuery
 * 
 * useQuery is used for FETCHING data. It:
 * - Automatically handles loading states
 * - Caches the result
 * - Refetches when needed
 * - Returns: { data, isLoading, error, refetch }
 * 
 * Syntax:
 * useQuery({
 *   queryKey: ['unique', 'key'], // Cache identifier
 *   queryFn: () => fetchData(),   // Function that fetches data
 *   enabled: true,                 // Whether to run automatically
 * })
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /**
   * QUERY: Get current user
   * 
   * 🎓 This fetches the current user on mount
   * - queryKey: ['user'] - unique identifier for this query
   * - queryFn: getCurrentUser - function that fetches the user
   * - The result is cached and shared across components
   */
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false,
  });

  /**
   * 🎓 CONCEPT: useMutation
   * 
   * useMutation is used for CHANGING data. It:
   * - Handles loading/error states
   * - Provides success/error callbacks
   * - Can invalidate queries (clear cache) after success
   * - Returns: { mutate, mutateAsync, isLoading, error }
   * 
   * Syntax:
   * useMutation({
   *   mutationFn: (data) => postData(data), // Function that changes data
   *   onSuccess: () => { },                  // Called on success
   *   onError: (error) => { },               // Called on error
   * })
   */

  /**
   * MUTATION: Login
   * 
   * 🎓 This handles the login process
   * - mutationFn: login - function that sends login request
   * - onSuccess: invalidates user query (refetches current user)
   * - onError: handles login errors
   */
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      // 🎓 Invalidate means "mark as stale and refetch"
      // This will trigger the user query to refetch
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    },
  });

  /**
   * MUTATION: Logout
   * 
   * 🎓 This handles the logout process
   * - Sets user data to null immediately (optimistic update)
   * - Calls logout endpoint
   * - Redirects to home
   */
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear the user from cache
      queryClient.setQueryData(['user'], null);
      navigate('/');
    },
  });

  /**
   * 🎓 RETURN VALUES:
   * 
   * - user: Current user object or null
   * - isLoading: True while fetching user
   * - isAuthenticated: Computed - true if user exists
   * - login: Function to call for login (returns a promise)
   * - logout: Function to call for logout
   * - loginError: Error from login mutation
   * - isLoggingIn: True while login is in progress
   */
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync, // Use mutateAsync to get promise
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
  };
}

/**
 * 🎓 HOW TO USE THIS HOOK:
 * 
 * In a component:
 * 
 * const { user, isAuthenticated, login, logout, isLoggingIn } = useAuth();
 * 
 * // Check if logged in
 * if (isAuthenticated) {
 *   return <div>Welcome {user.firstName}</div>
 * }
 * 
 * // Login
 * const handleLogin = async () => {
 *   try {
 *     await login({ 
 *       email: 'test@test.com', 
 *       password: 'password',
 *       portalType: 'appsecure'
 *     });
 *     // Success! User is now logged in
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 * 
 * // Logout
 * const handleLogout = () => {
 *   logout(); // No await needed, fire and forget
 * }
 */
