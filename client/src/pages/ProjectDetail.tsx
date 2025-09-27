import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, Finding, ProjectCredential, PostmanCollection, ProjectStatus, FindingStatus, Severity, CredentialType, ReportTemplateType } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { RichTextEditor } from "@/components/RichTextEditor";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Download, 
  Upload,
  Eye,
  Key,
  Globe,
  Shield,
  Plus,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface ProjectDetail extends Project {
  teamSize: number;
  scope: {
    inScope: string[];
    outOfScope: string[];
    methodology: string;
  };
  credentials: {
    id: string;
    name: string;
    type: CredentialType;
    username?: string;
    environment: string;
  }[];
  postmanCollections: {
    id: string;
    name: string;
    description: string;
    uploadedAt: Date;
    fileName: string;
    size: number;
  }[];
  findings: {
    id: string;
    title: string;
    severity: Severity;
    status: FindingStatus;
    createdAt: Date;
  }[];
  findingStats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
}

// Mock data for development
const mockProjectDetail: ProjectDetail = {
  id: "proj-001",
  name: "Healthcare Portal Security Assessment",
  customerName: "HealthTech Solutions",
  description: "Comprehensive security assessment of patient portal and healthcare management system including HIPAA compliance review. This assessment will cover web application security, API security, and database security aspects.",
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
  scope: {
    inScope: [
      "Patient portal web application (https://portal.healthtech.com)",
      "Healthcare management API endpoints",
      "Administrative dashboard",
      "Mobile application API",
      "Database security review"
    ],
    outOfScope: [
      "Physical security assessment",
      "Social engineering attacks",
      "Third-party integrations",
      "Legacy systems not in scope"
    ],
    methodology: "OWASP Web Security Testing Guide v4.2, NIST SP 800-115"
  },
  credentials: [
    {
      id: "cred-001",
      name: "Patient User Account",
      type: "user" as CredentialType,
      username: "test.patient@healthtech.com",
      environment: "Staging"
    },
    {
      id: "cred-002", 
      name: "Healthcare Admin",
      type: "admin" as CredentialType,
      username: "admin.test@healthtech.com",
      environment: "Staging"
    },
    {
      id: "cred-003",
      name: "API Service Account",
      type: "service" as CredentialType,
      environment: "Testing"
    }
  ],
  postmanCollections: [
    {
      id: "pc-001",
      name: "Healthcare API Collection",
      description: "Complete API collection for patient management endpoints",
      uploadedAt: new Date("2024-01-25"),
      fileName: "healthtech-api.postman_collection.json",
      size: 245760
    },
    {
      id: "pc-002",
      name: "Authentication Flows",
      description: "OAuth2 and session management API calls",
      uploadedAt: new Date("2024-01-22"),
      fileName: "auth-flows.postman_collection.json", 
      size: 89432
    }
  ],
  findings: [
    {
      id: "find-001",
      title: "SQL Injection in Patient Search",
      severity: "critical" as Severity,
      status: "submitted" as FindingStatus,
      createdAt: new Date("2024-02-01")
    },
    {
      id: "find-002",
      title: "Cross-Site Scripting in Profile",
      severity: "high" as Severity,
      status: "company_review" as FindingStatus,
      createdAt: new Date("2024-02-03")
    },
    {
      id: "find-003",
      title: "Weak Password Policy",
      severity: "medium" as Severity,
      status: "draft" as FindingStatus,
      createdAt: new Date("2024-02-05")
    }
  ],
  findingStats: { total: 18, critical: 1, high: 4, medium: 7, low: 5, informational: 1 }
};

function ExportReportDialog({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [reportName, setReportName] = useState(`${projectName} - Security Assessment Report`);
  const [reportScope, setReportScope] = useState("");
  const [templateType, setTemplateType] = useState<string>("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportReport = async () => {
    if (!templateType) {
      toast({
        title: "Template Required",
        description: "Please select a report template before exporting.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      await apiRequest({
        method: 'POST',
        url: `/api/projects/${projectId}/export`,
        data: {
          reportName,
          reportScope,
          templateType,
          executiveSummary,
          includeExecutiveSummary: !!executiveSummary
        }
      });

      // Invalidate exports cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'exports'] });
      
      toast({
        title: "Report Export Started",
        description: "Your security assessment report is being generated. You'll be notified when it's ready."
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to start report export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExecutiveSummary = async () => {
    if (!executiveSummary) {
      toast({
        title: "Executive Summary Required",
        description: "Please write an executive summary before exporting.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      await apiRequest({
        method: 'POST',
        url: `/api/projects/${projectId}/export`,
        data: {
          reportName: `${reportName} - Executive Summary`,
          templateType: 'executive-summary',
          executiveSummary,
          includeExecutiveSummary: true
        }
      });

      // Invalidate exports cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'exports'] });
      
      toast({
        title: "Executive Summary Export Started",
        description: "Your executive summary is being generated. You'll be notified when it's ready."
      });
    } catch (error) {
      console.error('Executive summary export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export executive summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="button-export-report">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Security Assessment Report</DialogTitle>
          <DialogDescription>
            Configure and export your penetration testing report
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Enter report name"
              data-testid="input-report-name"
            />
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <Label htmlFor="report-scope">Scope</Label>
            <Textarea
              id="report-scope"
              value={reportScope}
              onChange={(e) => setReportScope(e.target.value)}
              placeholder="Define the scope of this security assessment..."
              rows={3}
              data-testid="input-report-scope"
            />
          </div>

          {/* Report Template */}
          <div className="space-y-2">
            <Label>Report Template</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger data-testid="select-report-template">
                <SelectValue placeholder="Select report template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application Security Report</SelectItem>
                <SelectItem value="mobile">Mobile Application Security Report</SelectItem>
                <SelectItem value="network">Network Penetration Test Report</SelectItem>
                <SelectItem value="cloud">Cloud Security Assessment Report</SelectItem>
                <SelectItem value="api">API Security Assessment Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <Label htmlFor="executive-summary">Executive Summary</Label>
            <RichTextEditor
              content={executiveSummary}
              onChange={setExecutiveSummary}
              placeholder="Write the executive summary for this security assessment..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleExportReport}
              disabled={isExporting || !templateType}
              className="flex-1"
              data-testid="button-export-full-report"
            >
              {isExporting ? "Exporting..." : "Export Full Report"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportExecutiveSummary}
              disabled={isExporting || !executiveSummary}
              data-testid="button-export-executive-summary"
            >
              Export Executive Summary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubmitFindingDialog({ projectId }: { projectId: string }) {
  const [findingTitle, setFindingTitle] = useState("");
  const [findingDescription, setFindingDescription] = useState("");
  const [severity, setSeverity] = useState<string>("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="button-submit-finding">
          <Plus className="h-4 w-4 mr-2" />
          Submit Finding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit New Finding</DialogTitle>
          <DialogDescription>
            Add a new security finding to this project
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finding-title">Finding Title</Label>
            <Input
              id="finding-title"
              value={findingTitle}
              onChange={(e) => setFindingTitle(e.target.value)}
              placeholder="e.g., SQL Injection in Login Form"
              data-testid="input-finding-title"
            />
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger data-testid="select-finding-severity">
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="informational">Informational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              content={findingDescription}
              onChange={setFindingDescription}
              placeholder="Describe the security finding in detail..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              disabled={!findingTitle || !severity || !findingDescription}
              className="flex-1"
              data-testid="button-save-finding"
            >
              Submit Finding
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;

  // Fetch real project data from API
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId
  });

  // Fetch project findings for statistics
  const { data: findings = [] } = useQuery<Finding[]>({
    queryKey: ['/api/projects', projectId, 'findings'],
    enabled: !!projectId
  });

  // Calculate finding statistics from real data
  const findingStats = findings.reduce((stats, finding) => {
    stats.total++;
    stats[finding.severity]++;
    return stats;
  }, { total: 0, critical: 0, high: 0, medium: 0, low: 0, informational: 0 });

  // Create extended project data with real findings and stats
  const projectData: ProjectDetail | undefined = project ? {
    ...project,
    teamSize: 4, // TODO: Get from project members API
    scope: {
      inScope: project.inScope || [],
      outOfScope: project.outOfScope || [],
      methodology: project.methodology || "OWASP Testing Guide"
    },
    credentials: [], // TODO: Fetch from credentials API
    postmanCollections: [], // TODO: Fetch from collections API
    findings: findings.slice(0, 10), // Show latest 10 findings
    findingStats
  } : undefined;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Project not found</h3>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/projects">
              <Button>Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="sm" data-testid="button-back-to-projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold" data-testid="heading-project-name">{projectData.name}</h1>
          <p className="text-muted-foreground">{projectData.customerName}</p>
        </div>
        <StatusBadge status={projectData.status} />
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        <SubmitFindingDialog projectId={projectData.id} />
        <ExportReportDialog projectId={projectData.id} projectName={projectData.name} />
        <Button variant="outline" data-testid="button-view-findings">
          <Eye className="h-4 w-4 mr-2" />
          View All Findings ({projectData.findingStats.total})
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scope">Scope & Details</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="collections">Postman Collections</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Project Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Start Date</span>
                </div>
                <div className="font-medium">{projectData.startDate ? format(projectData.startDate, "MMM d, yyyy") : 'TBD'}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Expected End</span>
                </div>
                <div className="font-medium">{projectData.expectedEndDate ? format(projectData.expectedEndDate, "MMM d, yyyy") : 'TBD'}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Team Size</span>
                </div>
                <div className="font-medium">{projectData.teamSize} members</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Findings</span>
                </div>
                <div className="font-medium">{projectData.findingStats.total}</div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{projectData.description}</p>
            </CardContent>
          </Card>

          {/* Finding Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Finding Distribution</CardTitle>
              <CardDescription>Security vulnerabilities by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {projectData.findingStats.critical > 0 && (
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity="critical" />
                    <span className="font-medium">{projectData.findingStats.critical}</span>
                  </div>
                )}
                {projectData.findingStats.high > 0 && (
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity="high" />
                    <span className="font-medium">{projectData.findingStats.high}</span>
                  </div>
                )}
                {projectData.findingStats.medium > 0 && (
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity="medium" />
                    <span className="font-medium">{projectData.findingStats.medium}</span>
                  </div>
                )}
                {projectData.findingStats.low > 0 && (
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity="low" />
                    <span className="font-medium">{projectData.findingStats.low}</span>
                  </div>
                )}
                {projectData.findingStats.informational > 0 && (
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity="informational" />
                    <span className="font-medium">{projectData.findingStats.informational}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scope" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  In Scope
                </CardTitle>
                <CardDescription>Assets and systems included in this assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {projectData.scope.inScope.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Out of Scope
                </CardTitle>
                <CardDescription>Assets and systems excluded from this assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {projectData.scope.outOfScope.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Testing Methodology</CardTitle>
              <CardDescription>Standards and frameworks used for this assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{projectData.scope.methodology}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Test Credentials
              </CardTitle>
              <CardDescription>Authentication credentials provided for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectData.credentials.map((cred) => (
                  <div key={cred.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{cred.name}</div>
                      {cred.username && (
                        <div className="text-sm text-muted-foreground">Username: {cred.username}</div>
                      )}
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {cred.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {cred.environment}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-view-credential-${cred.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Postman Collections
              </CardTitle>
              <CardDescription>API collections provided for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectData.postmanCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{collection.name}</div>
                      <div className="text-sm text-muted-foreground">{collection.description}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Uploaded: {format(collection.uploadedAt, "MMM d, yyyy")}</span>
                        <span>Size: {Math.round(collection.size / 1024)} KB</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-download-collection-${collection.id}`}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-view-collection-${collection.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Postman
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Security Findings
                </div>
                <SubmitFindingDialog projectId={projectData.id} />
              </CardTitle>
              <CardDescription>Vulnerabilities discovered during this assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectData.findings.map((finding) => (
                  <div key={finding.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{finding.title}</div>
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={finding.severity} />
                        <StatusBadge status={finding.status} />
                        <span className="text-xs text-muted-foreground">
                          {format(finding.createdAt, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-view-finding-${finding.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}