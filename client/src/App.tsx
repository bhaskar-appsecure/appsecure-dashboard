import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import MyFindings from "@/pages/MyFindings";
import FindingDetail from "@/pages/FindingDetail";
import CreateFinding from "@/pages/CreateFinding";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/findings" component={MyFindings} />
      <Route path="/findings/new" component={CreateFinding} />
      <Route path="/findings/:id" component={FindingDetail} />
      <Route path="/search" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Search</h1><p className="text-muted-foreground">Advanced search interface coming soon...</p></div>} />
      <Route path="/reports" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground">Report generation interface coming soon...</p></div>} />
      <Route path="/templates" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Templates</h1><p className="text-muted-foreground">Template management interface coming soon...</p></div>} />
      <Route path="/users" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Users</h1><p className="text-muted-foreground">User management interface coming soon...</p></div>} />
      <Route path="/settings" component={() => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Settings interface coming soon...</p></div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  // Custom sidebar width for the application
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-2 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <AuthenticatedRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;