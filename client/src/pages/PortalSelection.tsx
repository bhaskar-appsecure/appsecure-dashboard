import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, Users, Building2 } from "lucide-react";

interface PortalSelectionProps {
  onSelectPortal: (portalType: 'client' | 'appsecure') => void;
}

export default function PortalSelection({ onSelectPortal }: PortalSelectionProps) {
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

      {/* Portal Selection */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="heading-portal-selection">Welcome to PenTest Pro</h1>
            <p className="text-muted-foreground">Select your portal to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Portal */}
            <Card className="hover-elevate cursor-pointer transition-all" onClick={() => onSelectPortal('client')}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Client Portal</CardTitle>
                <CardDescription>
                  Access your security assessment reports and findings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    View assessment reports
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Track project progress
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Review security findings
                  </p>
                </div>
                <Button className="w-full" size="lg" data-testid="button-client-portal">
                  Login to Client Portal
                </Button>
              </CardContent>
            </Card>

            {/* Appsecure Portal */}
            <Card className="hover-elevate cursor-pointer transition-all" onClick={() => onSelectPortal('appsecure')}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Appsecure Portal</CardTitle>
                <CardDescription>
                  Internal portal for security researchers and administrators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Manage all projects and findings
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Create and manage templates
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    User and role management
                  </p>
                </div>
                <Button className="w-full" size="lg" data-testid="button-appsecure-portal">
                  Login to Appsecure
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
