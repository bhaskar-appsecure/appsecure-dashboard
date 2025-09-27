import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Project, ProjectStatus } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar, Clock, FileText, Plus, Search, Users } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface ProjectWithStats extends Project {
  teamSize: number;
  findingStats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  progress?: number;
}

// Mock data for development
const mockProjects: ProjectWithStats[] = [
  {
    id: "proj-001",
    name: "Healthcare Portal Security Assessment",
    customerName: "HealthTech Solutions",
    description: "Comprehensive security assessment of patient portal and healthcare management system including HIPAA compliance review.",
    status: "in_progress" as ProjectStatus,
    startDate: new Date("2024-01-20"),
    expectedEndDate: new Date("2024-03-15"),
    actualEndDate: null,
    inScope: [],
    outOfScope: [],
    methodology: null,
    organizationId: "org-001",
    createdBy: null,
    tags: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-10"),
    teamSize: 5,
    findingStats: { total: 18, critical: 1, high: 4, medium: 7, low: 5, informational: 1 },
    progress: 72
  },
  {
    id: "proj-002", 
    name: "E-commerce Platform Penetration Test",
    customerName: "RetailCorp Inc.",
    description: "Full-scope penetration test of online shopping platform including payment processing systems and customer data handling.",
    status: "planned" as ProjectStatus,
    startDate: new Date("2024-04-01"),
    expectedEndDate: new Date("2024-05-30"),
    actualEndDate: null,
    inScope: [],
    outOfScope: [],
    methodology: null,
    organizationId: "org-001",
    createdBy: null,
    tags: [],
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    teamSize: 3,
    findingStats: { total: 0, critical: 0, high: 0, medium: 0, low: 0, informational: 0 }
  },
  {
    id: "proj-003",
    name: "Banking API Security Review",
    customerName: "SecureBank Ltd.",
    description: "API security assessment and code review for mobile banking application and core banking interfaces.",
    status: "complete" as ProjectStatus,
    startDate: new Date("2023-11-15"),
    expectedEndDate: new Date("2024-01-10"),
    actualEndDate: new Date("2024-01-08"),
    inScope: [],
    outOfScope: [],
    methodology: null,
    organizationId: "org-001",
    createdBy: null,
    tags: [],
    createdAt: new Date("2023-11-10"),
    updatedAt: new Date("2024-01-08"),
    teamSize: 4,
    findingStats: { total: 24, critical: 2, high: 6, medium: 9, low: 5, informational: 2 }
  },
  {
    id: "proj-004",
    name: "Cloud Infrastructure Assessment",
    customerName: "TechStartup Co.",
    description: "AWS cloud security assessment including IAM, S3 configurations, and container security review.",
    status: "in_progress" as ProjectStatus,
    startDate: new Date("2024-02-01"),
    expectedEndDate: new Date("2024-03-30"),
    actualEndDate: null,
    inScope: [],
    outOfScope: [],
    methodology: null,
    organizationId: "org-001",
    createdBy: null,
    tags: [],
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-02-15"),
    teamSize: 2,
    findingStats: { total: 12, critical: 0, high: 2, medium: 6, low: 3, informational: 1 },
    progress: 45
  }
];

function ProjectTile({ project }: { project: ProjectWithStats }) {
  const isOverdue = project.status !== 'complete' && project.expectedEndDate && new Date() > project.expectedEndDate;
  const endDate = project.actualEndDate || project.expectedEndDate;
  
  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-6">{project.name}</CardTitle>
            <CardDescription className="text-sm">{project.customerName}</CardDescription>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Project Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Start:</span>
            <span>{project.startDate ? format(project.startDate, "MMM d, yyyy") : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} />
            <span className="text-muted-foreground">Due:</span>
            <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
              {endDate ? format(endDate, "MMM d, yyyy") : 'TBD'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Team:</span>
            <span>{project.teamSize} members</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Findings:</span>
            <span>{project.findingStats.total}</span>
          </div>
        </div>

        {/* Progress Bar (for in-progress projects) */}
        {project.status === 'in_progress' && project.progress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Finding Stats */}
        {project.findingStats.total > 0 && (
          <div className="flex gap-1 flex-wrap">
            {project.findingStats.critical > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0">
                {project.findingStats.critical} Critical
              </Badge>
            )}
            {project.findingStats.high > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                {project.findingStats.high} High
              </Badge>
            )}
            {project.findingStats.medium > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {project.findingStats.medium} Medium
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full" data-testid={`button-view-project-${project.id}`}>
              View Details
            </Button>
          </Link>
          {project.status === 'in_progress' && (
            <Button 
              variant="outline" 
              size="sm"
              data-testid={`button-submit-report-${project.id}`}
              onClick={() => {
                // TODO: Navigate to report submission
                console.log('Submit report for project:', project.id);
              }}
            >
              Submit Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Real API call enabled
  const { data: projects, isLoading } = useQuery<ProjectWithStats[]>({
    queryKey: ['/api/projects'],
    // For now we'll use mock data, but the API is ready
    queryFn: async () => {
      // TODO: Replace with actual API call when backend is ready
      return mockProjects;
    }
  });

  const projectsData = projects || mockProjects;

  const filteredProjects = projectsData.filter((project: ProjectWithStats) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-projects">Projects</h1>
          <p className="text-muted-foreground">
            Manage penetration testing projects and security assessments
          </p>
        </div>
        <Button data-testid="button-new-project">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-projects"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectsData.filter((p: ProjectWithStats) => p.status === 'in_progress').length}</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{projectsData.filter((p: ProjectWithStats) => p.status === 'planned').length}</div>
            <div className="text-sm text-muted-foreground">Planned Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {projectsData.reduce((sum: number, p: ProjectWithStats) => sum + p.findingStats.total, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Findings</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search terms or filters"
                : "Get started by creating your first project"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button data-testid="button-create-first-project">
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project: ProjectWithStats) => (
            <ProjectTile key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}