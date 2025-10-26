import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import PortalSelection from "./PortalSelection";

interface LoginForm {
  email: string;
  password: string;
}

type PortalType = 'client' | 'appsecure' | null;

export default function Login() {
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [portalType, setPortalType] = useState<PortalType>(null);
  const { toast } = useToast();

  // Load portal type from localStorage on mount
  useEffect(() => {
    const savedPortalType = localStorage.getItem('portalType') as PortalType;
    if (savedPortalType) {
      setPortalType(savedPortalType);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to PenTest Pro!",
      });
      // Invalidate auth queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // The app will automatically redirect due to useAuth hook
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePortalSelection = (selectedPortal: 'client' | 'appsecure') => {
    setPortalType(selectedPortal);
    localStorage.setItem('portalType', selectedPortal);
  };

  const handleBackToPortalSelection = () => {
    setPortalType(null);
    localStorage.removeItem('portalType');
  };

  // Show portal selection if no portal type is selected
  if (!portalType) {
    return <PortalSelection onSelectPortal={handlePortalSelection} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">PenTest Pro</span>
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
                onClick={handleBackToPortalSelection}
                data-testid="button-back-to-portal"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Portal
              </Button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {portalType === 'client' ? 'Client Portal Login' : 'Appsecure Portal Login'}
            </CardTitle>
            <CardDescription className="text-center">
              {portalType === 'client' 
                ? 'Sign in to access your security assessment reports' 
                : 'Sign in to manage projects and findings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  disabled={loginMutation.isPending}
                  data-testid="input-email"
                  autoComplete="email"
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
                    onChange={handleInputChange("password")}
                    disabled={loginMutation.isPending}
                    data-testid="input-password"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isPending}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Only invited users can access this platform.</p>
              <p className="mt-2">Contact your administrator for access.</p>
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
            <span className="text-sm font-medium">PenTest Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 PenTest Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}