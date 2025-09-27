import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Calendar, User, FileText } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { format } from "date-fns";

interface FindingPreviewProps {
  title: string;
  severity: string;
  cvssVector?: string;
  cvssScore?: number;
  descriptionHtml?: string;
  stepsHtml?: string;
  impactHtml?: string;
  fixHtml?: string;
  proofOfConceptFiles?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  projectName?: string;
  trigger?: React.ReactNode;
}

export function FindingPreview({
  title,
  severity,
  cvssVector,
  cvssScore,
  descriptionHtml,
  stepsHtml,
  impactHtml,
  fixHtml,
  proofOfConceptFiles = [],
  projectName = "Selected Project",
  trigger
}: FindingPreviewProps) {
  const defaultTrigger = (
    <Button variant="outline" data-testid="button-preview-finding">
      <Eye className="h-4 w-4 mr-2" />
      Preview
    </Button>
  );

  // Helper function to render HTML content safely
  const renderHtmlContent = (html: string | undefined) => {
    if (!html || html.trim() === '') {
      return <p className="text-muted-foreground italic">No content provided</p>;
    }
    return (
      <div 
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  // Helper function to check if markdown image syntax exists in content
  const hasMarkdownImages = (html: string | undefined) => {
    if (!html) return false;
    return /!\[.*?\]\(.*?\)/.test(html);
  };

  // Filter files that are not referenced in markdown
  const getUnreferencedFiles = () => {
    const allMarkdownContent = [descriptionHtml, stepsHtml, impactHtml, fixHtml].join(' ');
    return proofOfConceptFiles.filter(file => 
      !allMarkdownContent.includes(file.url)
    );
  };

  const unreferencedFiles = getUnreferencedFiles();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="finding-preview-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Finding Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="preview-title">
                {title || "Untitled Finding"}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Current User</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <Badge variant="outline">{projectName}</Badge>
              </div>
            </div>

            {/* Severity and CVSS */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Severity:</span>
                <SeverityBadge severity={severity as any} />
              </div>
              {cvssScore && cvssScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">CVSS Score:</span>
                  <Badge variant="outline" className="font-mono">
                    {cvssScore.toFixed(1)}
                  </Badge>
                </div>
              )}
            </div>

            {cvssVector && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium mb-1">CVSS Vector</div>
                <code className="text-xs text-muted-foreground break-all">
                  {cvssVector}
                </code>
              </div>
            )}
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vulnerability Description</CardTitle>
              </CardHeader>
              <CardContent>
                {renderHtmlContent(descriptionHtml)}
              </CardContent>
            </Card>

            {/* Steps to Reproduce */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Steps to Reproduce</CardTitle>
              </CardHeader>
              <CardContent>
                {renderHtmlContent(stepsHtml)}
              </CardContent>
            </Card>

            {/* Impact Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                {renderHtmlContent(impactHtml)}
              </CardContent>
            </Card>

            {/* Fix Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fix Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {renderHtmlContent(fixHtml)}
              </CardContent>
            </Card>
          </div>

          {/* Proof of Concept Files */}
          {unreferencedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proof of Concept</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unreferencedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border rounded-lg p-4 space-y-2"
                      data-testid={`preview-file-${file.id}`}
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-auto rounded-md max-h-64 object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-muted rounded-md">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Notice */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <p><strong>Preview Note:</strong></p>
            <p>• This is how your finding will appear once saved</p>
            <p>• Images referenced in markdown will display inline within the content sections</p>
            <p>• Images not referenced in markdown will appear in the "Proof of Concept" section</p>
            <p>• You can still edit the finding after saving</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}