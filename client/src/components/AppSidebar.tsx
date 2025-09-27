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

// Menu items based on user role
const researcherItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My Projects",
    url: "/projects",
    icon: FolderOpen,
  },
  {
    title: "My Findings",
    url: "/findings",
    icon: Bug,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
];

const customerItems = [
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
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
];

const adminItems = [
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
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  // TODO: Remove mock functionality - get user role from auth
  const userRole = user?.role || 'researcher';
  
  const getMenuItems = () => {
    switch (userRole) {
      case 'customer_admin':
      case 'project_user':
        return customerItems;
      case 'org_admin':
        return adminItems;
      default:
        return researcherItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">PenTest Pro</span>
            <span className="text-xs text-muted-foreground capitalize">
              {userRole.replace('_', ' ')}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.title === "My Findings" && (
                          <Badge variant="secondary" className="ml-auto h-5 text-xs">
                            {/* TODO: Remove mock functionality */}
                            12
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions for Researchers */}
        {userRole === 'researcher' && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => console.log('Create new finding')}
                    data-testid="button-new-finding"
                  >
                    <Bug className="h-4 w-4" />
                    <span>New Finding</span>
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