# Frontend Skeleton Implementation Guide

## ✅ Already Created
1. ✅ `client/src/lib/api/` - Empty folder
2. ✅ `client/src/hooks/data/` - Empty folder
3. ✅ `client/src/components/ProtectedRoute.tsx` - Route guard component
4. ✅ `client/src/pages/Landing.tsx` - Portal selection page

---

## 📝 Files to Create

### **1. Install React Router**
```bash
cd "C:/OLD D DRIVE/appsecure-dashboard/SecureReportFlow-Production"
npm install react-router-dom
```

---

### **2. Client Login Page** (`client/src/pages/ClientLogin.tsx`)

```typescript
/**
 * Client Login Page
 * Route: /login
 * For customer_admin and project_user roles
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Add API call to /api/auth/login with portalType: 'client'
    console.log("Client login:", formData);

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
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
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Client Portal Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your security assessment reports
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
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
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
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
```

---

### **3. Internal Login Selection Page** (`client/src/pages/InternalLoginSelection.tsx`)

```typescript
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
```

---

### **4. Admin Login Page** (`client/src/pages/AdminLogin.tsx`)

```typescript
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
import { Shield, Eye, EyeOff, ArrowLeft, UserCog } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Add API call to /api/auth/login with portalType: 'appsecure', role: 'admin'
    console.log("Admin login:", formData);

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
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
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
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
```

---

### **5. Pentester Login Page** (`client/src/pages/PentesterLogin.tsx`)

```typescript
/**
 * Pentester Login Page
 * Route: /internal-login/pentester
 * For researcher role
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, Eye, EyeOff, ArrowLeft, Bug } from "lucide-react";

export default function PentesterLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Add API call to /api/auth/login with portalType: 'appsecure', role: 'researcher'
    console.log("Pentester login:", formData);

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
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
                <Bug className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Pentester Login</CardTitle>
            <CardDescription className="text-center">
              Access security researcher portal
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
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
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Pentester access required for this portal.</p>
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
```

---

### **6. Simple Dashboard** (`client/src/pages/SimpleDashboard.tsx`)

```typescript
/**
 * Simple Dashboard
 * Protected route after login
 * TODO: Split into ClientDashboard and InternalDashboard
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function SimpleDashboard() {
  const handleLogout = () => {
    // TODO: Add logout API call
    console.log("Logout clicked");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">SecureReport Flow</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to SecureReport Flow</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Manage your security projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Findings</CardTitle>
              <CardDescription>Security vulnerabilities found</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">Total findings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generated assessment reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">Reports generated</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>New Project</Button>
            <Button variant="outline">New Finding</Button>
            <Button variant="outline">Generate Report</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

---

### **7. Update App.tsx**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "@/pages/Landing";
import ClientLogin from "@/pages/ClientLogin";
import InternalLoginSelection from "@/pages/InternalLoginSelection";
import AdminLogin from "@/pages/AdminLogin";
import PentesterLogin from "@/pages/PentesterLogin";
import SimpleDashboard from "@/pages/SimpleDashboard";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/internal-login" element={<InternalLoginSelection />} />
          <Route path="/internal-login/admin" element={<AdminLogin />} />
          <Route path="/internal-login/pentester" element={<PentesterLogin />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SimpleDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
```

---

### **8. Update main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## 🎯 Routes Summary

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing (Portal Selection) | Public |
| `/login` | Client Login | Public |
| `/internal-login` | Internal Login Selection | Public |
| `/internal-login/admin` | Admin Login | Public |
| `/internal-login/pentester` | Pentester Login | Public |
| `/dashboard` | Simple Dashboard | Protected |

---

## ✅ Next Steps (After Skeleton)

1. **Install React Router**: `npm install react-router-dom`
2. **Copy all page files** from this guide
3. **Test navigation flow**:
   - Landing → Client Login → Dashboard
   - Landing → Internal Login → Admin/Pentester Login → Dashboard
4. **Add React Query** for API calls
5. **Connect to backend auth routes**

---

**All files are skeleton-only with TODO comments for API integration!**
