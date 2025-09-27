import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Plus } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  status: string;
  createdAt: string;
  project: {
    name: string;
    id: string;
  };
  reporter: {
    firstName: string;
    lastName: string;
  };
}

export default function MyFindings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedReporter, setSelectedReporter] = useState<string>("all");

  const { data: findingsData = [], isLoading } = useQuery({
    queryKey: ['/api/findings'],
  });

  const findings = findingsData as Finding[];

  // Get unique projects and reporters for filtering
  const uniqueProjects = findings.reduce((acc: Array<{id: string, name: string}>, finding) => {
    if (!acc.find((p: any) => p.id === finding.project.id)) {
      acc.push(finding.project);
    }
    return acc;
  }, []);

  const uniqueReporters = findings.reduce((acc: Array<{name: string}>, finding) => {
    const fullName = `${finding.reporter.firstName} ${finding.reporter.lastName}`;
    if (!acc.find((r: any) => r.name === fullName)) {
      acc.push({ name: fullName });
    }
    return acc;
  }, []);

  // Filter findings based on search and filters
  const filteredFindings = findings.filter((finding) => {
    const matchesSearch = finding.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === "all" || finding.project.id === selectedProject;
    const reporterName = `${finding.reporter.firstName} ${finding.reporter.lastName}`;
    const matchesReporter = selectedReporter === "all" || reporterName === selectedReporter;
    
    return matchesSearch && matchesProject && matchesReporter;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="page-my-findings">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-my-findings">My Findings</h1>
            <p className="text-muted-foreground">
              Manage and track security findings across all your projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/findings/new">
              <Button data-testid="button-create-finding">
                <Plus className="h-4 w-4 mr-2" />
                Create Finding
              </Button>
            </Link>
            <Badge variant="outline" data-testid="badge-total-findings">
              Total: {findings.length}
            </Badge>
            <Badge variant="outline" data-testid="badge-filtered-findings">
              Filtered: {filteredFindings.length}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search findings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-findings"
                  />
                </div>
              </div>

              {/* Project Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger data-testid="select-project-filter">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {uniqueProjects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reporter Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedReporter} onValueChange={setSelectedReporter}>
                  <SelectTrigger data-testid="select-reporter-filter">
                    <SelectValue placeholder="Filter by reporter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reporters</SelectItem>
                    {uniqueReporters.map((reporter: any) => (
                      <SelectItem key={reporter.name} value={reporter.name}>
                        {reporter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedProject !== "all" || selectedReporter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedProject("all");
                    setSelectedReporter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Findings Table */}
        <Card>
          <CardContent className="p-0">
            {filteredFindings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground mb-2">
                  {findings.length === 0 ? (
                    <>No findings found. Start by creating findings in your projects.</>
                  ) : (
                    <>No findings match your current filters.</>
                  )}
                </div>
                {(searchTerm || selectedProject !== "all" || selectedReporter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedProject("all");
                      setSelectedReporter("all");
                    }}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFindings.map((finding) => (
                    <TableRow 
                      key={finding.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      data-testid={`row-finding-${finding.id}`}
                    >
                      <TableCell className="font-medium">
                        <Link 
                          href={`/findings/${finding.id}`}
                          className="hover:text-primary transition-colors"
                          data-testid={`link-finding-${finding.id}`}
                        >
                          {finding.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={finding.severity} />
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/projects/${finding.project.id}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {finding.project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={finding.status as any} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {`${finding.reporter.firstName} ${finding.reporter.lastName}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(finding.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Link href={`/findings/${finding.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-view-finding-${finding.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}