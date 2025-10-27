/**
 * Internal Login Selection
 * Route: /internal-login
 * Choose between Admin or Pentester login
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, UserCog, Bug, ArrowLeft } from "lucide-react";

export default function InternalLoginSelection() {
  const navigate = useNavigate();

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

      {/* Selection Cards */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal Selection
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Internal Portal Access</h1>
            <p className="text-muted-foreground">Select your role to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Login */}
            <Card
              className="hover:shadow-lg cursor-pointer transition-all"
              onClick={() => navigate('/internal-login/admin')}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserCog className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Admin</CardTitle>
                <CardDescription>
                  Organization and system management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Admin Login
                </Button>
              </CardContent>
            </Card>

            {/* Pentester Login */}
            <Card
              className="hover:shadow-lg cursor-pointer transition-all"
              onClick={() => navigate('/internal-login/pentester')}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bug className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Pentester</CardTitle>
                <CardDescription>
                  Security researcher and findings management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Pentester Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
