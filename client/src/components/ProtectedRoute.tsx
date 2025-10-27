/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Uses React Query via useAuth hook to check authentication status.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking authentication
  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
