import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/ProjectCard";
import { FindingCard } from "@/components/FindingCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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

// Interfaces for real data
interface Project {
  id: string;
  name: string;
  customerName: string;
  description: string;
  status: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Finding {
  id: string;
  title: string;
  severity: string;
  status: string;
  description: string;
  cvssScore?: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const userRole = user?.role || 'researcher';
  const isResearcher = userRole === 'researcher';
  const isCustomer = userRole === 'project_user' || userRole === 'customer_admin';

  // Fetch real projects data
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user
  });

  // Fetch real findings data
  const { data: findings = [] } = useQuery({
    queryKey: ['/api/findings'],
    enabled: !!user
  });

  // Calculate real stats from API data
  const stats = {
    activeProjects: projects.filter((p: Project) => p.status === 'in_progress').length,
    totalFindings: findings.length,
    criticalFindings: findings.filter((f: Finding) => f.severity === 'critical').length,
    resolvedFindings: findings.filter((f: Finding) => f.status === 'resolved' || f.status === 'closed').length,
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
              {stats.totalFindings > 0 ? Math.round((stats.resolvedFindings / stats.totalFindings) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project: Project) => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  startDate: new Date(project.startDate),
                  endDate: project.expectedEndDate ? new Date(project.expectedEndDate) : new Date(),
                  findingStats: { total: 0, critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
                  teamSize: 1,
                  progress: project.status === 'completed' ? 100 : project.status === 'in_progress' ? 50 : 0,
                }}
                onOpen={(id) => window.location.href = `/projects/${id}`}
                onViewFindings={(id) => window.location.href = `/projects/${id}/findings`}
              />
            ))}
            {projects.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No projects yet. Create your first project to get started.
              </div>
            )}
          </div>
        </div>

        {/* Recent Findings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isResearcher ? 'My Recent Findings' : 'Recent Findings'}
            </h2>
            <Link href="/findings">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {findings.slice(0, 3).map((finding: Finding) => (
              <FindingCard
                key={finding.id}
                finding={{
                  ...finding,
                  createdBy: { id: 'user', name: user?.firstName || 'User' },
                  createdAt: new Date(finding.createdAt),
                  updatedAt: new Date(finding.updatedAt),
                  commentsCount: 0,
                  evidenceCount: 0,
                  affectedAssets: [],
                }}
                onView={(id) => window.location.href = `/findings/${id}`}
                onEdit={(id) => window.location.href = `/findings/${id}/edit`}
                onStatusChange={(id, status) => console.log('Status change:', id, status)}
              />
            ))}
            {findings.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No findings yet. Start security testing to create findings.
              </div>
            )}
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
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}