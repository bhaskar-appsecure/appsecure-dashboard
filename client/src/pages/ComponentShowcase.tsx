import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CVSSCalculator } from "@/components/CVSSCalculator";
import { RichTextEditor } from "@/components/RichTextEditor";
import { FileUploadZone } from "@/components/FileUploadZone";
import { FindingCard } from "@/components/FindingCard";
import { ProjectCard } from "@/components/ProjectCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

// Mock data for components
const mockFinding = {
  id: 'showcase-finding',
  title: 'Cross-Site Scripting (XSS) in User Profile',
  severity: 'high' as const,
  status: 'company_review',
  description: '<p>A stored XSS vulnerability was identified in the user profile section where user input is not properly sanitized before being displayed to other users.</p>',
  cvssScore: 7.2,
  createdBy: { id: 'u-001', name: 'Alex Thompson' },
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  commentsCount: 4,
  evidenceCount: 7,
  affectedAssets: ['app.example.com', 'admin.example.com', 'portal.example.com'],
};

const mockProject = {
  id: 'showcase-project',
  name: 'Healthcare Portal Security Assessment',
  customerName: 'HealthTech Solutions',
  description: 'Comprehensive security assessment of patient portal and healthcare management system including HIPAA compliance review.',
  status: 'in_progress' as const,
  startDate: new Date('2024-01-20'),
  endDate: new Date('2024-03-15'),
  findingStats: { total: 18, critical: 1, high: 4, medium: 7, low: 5, informational: 1 },
  teamSize: 5,
  progress: 72,
};

export default function ComponentShowcase() {
  const [editorContent, setEditorContent] = useState('<p>Welcome to the <strong>PenTest Pro</strong> rich text editor!</p><p>This editor supports:</p><ul><li>Bold and italic formatting</li><li>Lists and quotes</li><li>Links and images</li><li>Tables and code blocks</li></ul>');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">PenTest Pro Components</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive UI components for modern penetration testing workflows
        </p>
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>

      <Separator />

      {/* Status and Severity Badges */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Status & Severity Indicators</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Severity Badges</CardTitle>
              <CardDescription>Visual indicators for vulnerability severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity="critical" />
                <SeverityBadge severity="high" />
                <SeverityBadge severity="medium" />
                <SeverityBadge severity="low" />
                <SeverityBadge severity="informational" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Badges</CardTitle>
              <CardDescription>Workflow status indicators for findings and projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Finding Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="draft" />
                    <StatusBadge status="submitted" />
                    <StatusBadge status="company_review" />
                    <StatusBadge status="verified_fixed" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Project Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="planned" />
                    <StatusBadge status="in_progress" />
                    <StatusBadge status="complete" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* CVSS Calculator */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">CVSS v3.1 Calculator</h2>
        <CVSSCalculator 
          onChange={(vector, score, severity) => {
            console.log('CVSS Updated:', { vector, score, severity });
          }}
        />
      </section>

      <Separator />

      {/* Rich Text Editor */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Rich Text Editor</h2>
        <Card>
          <CardHeader>
            <CardTitle>Finding Description Editor</CardTitle>
            <CardDescription>
              Professional rich text editing with TipTap for detailed finding descriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholder="Describe the security finding in detail..."
            />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* File Upload Zone */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Evidence File Upload</h2>
        <Card>
          <CardHeader>
            <CardTitle>Evidence Management</CardTitle>
            <CardDescription>
              Drag-and-drop file uploads with progress tracking and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onFilesAdded={(files) => {
                console.log('Files uploaded:', files.map(f => f.file.name));
              }}
              maxFiles={8}
              maxSize={100 * 1024 * 1024} // 100MB
            />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Finding and Project Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Data Display Components</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Finding Card</h3>
            <FindingCard
              finding={mockFinding}
              onView={(id) => console.log('View finding:', id)}
              onEdit={(id) => console.log('Edit finding:', id)}
              onStatusChange={(id, status) => console.log('Status change:', id, status)}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Project Card</h3>
            <ProjectCard
              project={mockProject}
              onOpen={(id) => console.log('Open project:', id)}
              onViewFindings={(id) => console.log('View findings:', id)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Feature Summary */}
      <section>
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Penetration Testing Platform</CardTitle>
            <CardDescription className="text-base">
              Professional-grade components designed for security teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">8+</div>
                <div className="text-sm text-muted-foreground">Core Components</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">TypeScript Coverage</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">Dark</div>
                <div className="text-sm text-muted-foreground">Mode Support</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Badge variant="outline" className="mr-2">React 18</Badge>
              <Badge variant="outline" className="mr-2">TypeScript</Badge>
              <Badge variant="outline" className="mr-2">Tailwind CSS</Badge>
              <Badge variant="outline" className="mr-2">Shadcn/ui</Badge>
              <Badge variant="outline" className="mr-2">TipTap Editor</Badge>
              <Badge variant="outline">CVSS v3.1</Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}