import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/ProjectCard";
import { FindingCard } from "@/components/FindingCard";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FolderOpen,
  Bug,
  Users,
} from "lucide-react";

// TODO: Remove mock data
const mockProjects = [
  {
    id: 'p-001',
    name: 'E-commerce Platform Assessment',
    customerName: 'TechCorp Industries',
    description: 'Comprehensive security assessment of customer-facing e-commerce platform.',
    status: 'in_progress' as const,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-28'),
    findingStats: { total: 23, critical: 2, high: 5, medium: 8, low: 6, informational: 2 },
    teamSize: 4,
    progress: 65,
  },
  {
    id: 'p-002',
    name: 'Mobile Banking App Review',
    customerName: 'SecureBank Corp',
    description: 'Security review of mobile banking application and backend APIs.',
    status: 'planned' as const,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-03-15'),
    findingStats: { total: 8, critical: 1, high: 2, medium: 3, low: 2, informational: 0 },
    teamSize: 3,
    progress: 15,
  },
];

const mockFindings = [
  {
    id: 'f-001',
    title: 'SQL Injection in User Authentication',
    severity: 'critical' as const,
    status: 'submitted',
    description: 'Critical SQL injection vulnerability found in login endpoint allowing authentication bypass.',
    cvssScore: 9.8,
    createdBy: { id: 'u-001', name: 'Sarah Chen' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    commentsCount: 3,
    evidenceCount: 5,
    affectedAssets: ['api.example.com', 'app.example.com'],
  },
  {
    id: 'f-002',
    title: 'Cross-Site Scripting in Dashboard',
    severity: 'high' as const,
    status: 'company_review',
    description: 'Reflected XSS vulnerability in user dashboard allowing session hijacking.',
    cvssScore: 7.2,
    createdBy: { id: 'u-002', name: 'Marcus Rodriguez' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    commentsCount: 1,
    evidenceCount: 3,
    affectedAssets: ['dashboard.example.com'],
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  // TODO: Remove mock functionality
  const userRole = user?.role || 'researcher';
  const isResearcher = userRole === 'researcher';
  const isCustomer = userRole === 'project_user' || userRole === 'customer_admin';

  const stats = {
    activeProjects: 8,
    totalFindings: 156,
    criticalFindings: 12,
    resolvedFindings: 89,
  };

  return (
    <div className="p-6 space-y-6" data-testid="dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}. Here's your security overview.
          </p>
        </div>
        <div className="flex gap-2">
          {isResearcher && (
            <Button data-testid="button-new-finding">
              <Plus className="h-4 w-4 mr-1" />
              New Finding
            </Button>
          )}
          <Button variant="outline" data-testid="button-new-project">
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFindings}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12 this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalFindings}</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedFindings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.resolvedFindings / stats.totalFindings) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {mockProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={(id) => console.log('Open project:', id)}
                onViewFindings={(id) => console.log('View findings:', id)}
              />
            ))}
          </div>
        </div>

        {/* Recent Findings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isResearcher ? 'My Recent Findings' : 'Recent Findings'}
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {mockFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onView={(id) => console.log('View finding:', id)}
                onEdit={(id) => console.log('Edit finding:', id)}
                onStatusChange={(id, status) => console.log('Status change:', id, status)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions for Different Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            {isResearcher
              ? 'Common tasks for security researchers'
              : isCustomer
              ? 'Manage your projects and findings'
              : 'Administrative actions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isResearcher && (
              <>
                <Button variant="outline">
                  <Bug className="h-4 w-4 mr-1" />
                  Create Finding
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-1" />
                  Submit Draft Findings
                </Button>
              </>
            )}
            {isCustomer && (
              <>
                <Button variant="outline">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Review Findings
                </Button>
                <Button variant="outline">
                  Export Report
                </Button>
              </>
            )}
            <Button variant="outline">
              <Users className="h-4 w-4 mr-1" />
              Invite Team Member
            </Button>
            <Button variant="outline">
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}