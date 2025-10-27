/**
 * Admin Login Page
 * Route: /internal-login/admin
 * For org_admin and super_admin roles
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, Eye, EyeOff, ArrowLeft, UserCog, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * 🎓 REACT QUERY IN ACTION!
 *
 * This component shows how to USE the useAuth hook we created.
 * Notice how simple the logic becomes - React Query handles all the complexity!
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  /**
   * 🎓 STEP 1: Get auth functions from our hook
   *
   * The useAuth hook gives us:
   * - login: Function to call the login API
   * - isLoggingIn: Loading state (true while login is in progress)
   * - loginError: Any error that occurred during login
   */
  const { login, isLoggingIn, loginError } = useAuth();

  /**
   * 🎓 STEP 2: Handle form submission
   *
   * Now our handleSubmit is MUCH simpler:
   * - No manual loading state
   * - No manual error handling
   * - No manual navigation (handled in the hook)
   * - Just call login() and React Query handles the rest!
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Call the login mutation
      await login({
        email: formData.email,
        password: formData.password,
        portalType: 'appsecure', // Internal portal
      });
      // Success! Hook will navigate to /dashboard automatically
    } catch (error) {
      // Error is already captured in loginError
      // We can display it in the UI
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">SecureReport Flow</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/internal-login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserCog className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Access organization and system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {loginError instanceof Error ? loginError.message : 'Login failed. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoggingIn}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoggingIn}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Admin access required for this portal.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Shield className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">SecureReport Flow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 SecureReport Flow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
