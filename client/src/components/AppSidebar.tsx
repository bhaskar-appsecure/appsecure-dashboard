import { useState, useEffect } from "react";
import {
  Calendar,
  Home,
  Search,
  Settings,
  FolderOpen,
  Bug,
  FileText,
  Users,
  Shield,
  UserPlus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

type PortalType = 'client' | 'appsecure';

// Base navigation items that all users can see
const baseNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Findings",
    url: "/findings",
    icon: Bug,
  },
];

// Additional items for different permissions
const permissionBasedItems = {
  search: {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  reports: {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  templates: {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
  settings: {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
};

// Admin section items based on permissions
const adminSectionItems = {
  manage_users: {
    title: "User Management",
    url: "/users",
    icon: Users,
  },
  manage_roles: {
    title: "Role Management",
    url: "/roles",
    icon: Shield,
  },
};

export function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [portalType, setPortalType] = useState<PortalType>('appsecure'); // Default to appsecure

  // Load portal type from localStorage
  useEffect(() => {
    const savedPortalType = localStorage.getItem('portalType') as PortalType;
    if (savedPortalType) {
      setPortalType(savedPortalType);
    }
  }, []);

  // Fetch user permissions from backend
  const { data: userPermissions = [] } = useQuery({
    queryKey: ['/api/auth/permissions'],
    enabled: !!user
  });

  // Convert permissions array to Set for faster lookup
  const permissions = new Set((userPermissions as any[])?.map((p: any) => p.name) || []);

  // Build navigation items based on user permissions and portal type
  const buildNavigationItems = () => {
    const items = [...baseNavigationItems];

    // Client portal: Only show Dashboard, Projects, Findings
    if (portalType === 'client') {
      return items; // Return only base items
    }

    // Appsecure portal: Show all navigation based on permissions
    // Add search for researchers
    if (permissions.has('view_findings') || permissions.has('manage_findings')) {
      items.push(permissionBasedItems.search);
    }

    // Add reports for customers
    if (permissions.has('view_reports')) {
      items.push(permissionBasedItems.reports);
    }

    // Add templates for appsecure users
    items.push(permissionBasedItems.templates);

    return items;
  };

  // Build admin section items based on permissions and portal type
  const buildAdminItems = () => {
    const adminItems = [];

    // Client portal: No admin items shown
    if (portalType === 'client') {
      return [];
    }

    // Appsecure portal: Show admin items based on permissions
    // Super admin users get all admin features regardless of permissions
    const isSuperAdmin = user?.role === 'super_admin';

    if (isSuperAdmin || permissions.has('manage_users')) {
      adminItems.push(adminSectionItems.manage_users);
    }

    if (isSuperAdmin || permissions.has('manage_roles')) {
      adminItems.push(adminSectionItems.manage_roles);
    }

    return adminItems;
  };

  const navigationItems = buildNavigationItems();
  const adminItems = buildAdminItems();
  const hasAdminAccess = adminItems.length > 0;

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">PenTest Pro</span>
            <span className="text-xs text-muted-foreground">
              {portalType === 'client' ? 'Client Portal' : 'Appsecure Portal'}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only show if user has admin permissions */}
        {hasAdminAccess && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const isActive = location === item.url || 
                    (item.url.includes('#') && location === item.url.split('#')[0]);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Quick Actions - Only for Appsecure portal */}
        {portalType === 'appsecure' && permissions.has('manage_findings') && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    data-testid="button-new-finding"
                  >
                    <Link href="/findings/new">
                      <Bug className="h-4 w-4" />
                      <span>New Finding</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Additional Quick Actions for Settings - Only for Appsecure portal */}
        {portalType === 'appsecure' && permissions.has('manage_system') && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    data-testid="nav-settings"
                  >
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {/* TODO: Remove mock functionality */}
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-medium">
                {user?.firstName || user?.email || 'User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}