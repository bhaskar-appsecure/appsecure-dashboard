import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Shield,
  Bug,
  FileText,
  Users,
  BarChart3,
  Lock,
  Zap,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Bug,
    title: "Smart Finding Management",
    description: "Create, track, and manage security findings with rich text editing, CVSS scoring, and evidence attachments."
  },
  {
    icon: FileText,
    title: "Custom Report Templates",
    description: "Generate professional security reports with customizable templates and automated content population."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-role access with researcher and customer portals for seamless collaboration and communication."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track project progress, finding statistics, and security trends with comprehensive dashboards."
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Multi-tenant architecture with role-based access control and complete audit trails."
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Automated status tracking, notifications, and integrations with popular security tools."
  }
];

const benefits = [
  "Streamline penetration testing workflows",
  "Reduce reporting time by 80%",
  "Ensure consistent finding quality",
  "Enable real-time collaboration",
  "Maintain complete audit trails",
  "Scale across multiple projects"
];

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
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
            <span className="text-xl font-bold">PenTest Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4">
            🔒 Enterprise-Grade Security Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Modern Penetration Testing Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your security assessments with comprehensive finding management, 
            collaborative workflows, and automated reporting capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => console.log('View demo')}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Security Teams</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to conduct professional penetration tests and deliver 
            comprehensive security assessments.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover-elevate transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Why Choose PenTest Pro?</CardTitle>
              <CardDescription className="text-base">
                Join hundreds of security teams who trust our platform for their penetration testing needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button size="lg" onClick={handleLogin} data-testid="button-start-free">
                  Start Your Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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