import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, FileText, Calendar } from "lucide-react";
import { insertTemplateSchema } from "@shared/schema";

type ReportTemplate = {
  id: string;
  name: string;
  description: string | null;
  type: "html" | "docx" | "markdown";
  content: string;
  variables?: any;
  organizationId: string | null;
  customerId: string | null;
  isDefault: boolean | null;
  version: number | null;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const templateFormSchema = insertTemplateSchema.omit({ 
  organizationId: true, 
  createdBy: true 
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

export default function TemplateManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery<ReportTemplate[]>({
    queryKey: ['/api/templates'],
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: TemplateFormData) => 
      apiRequest('POST', '/api/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Template created",
        description: "Report template has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TemplateFormData> }) =>
      apiRequest('PUT', `/api/templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      toast({
        title: "Template updated",
        description: "Report template has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template deleted",
        description: "Report template has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (template: ReportTemplate) => {
    if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const getTemplateTypeBadgeVariant = (type: ReportTemplate['type']) => {
    switch (type) {
      case 'html': return 'destructive';
      case 'docx': return 'default';
      case 'markdown': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTemplateType = (type: ReportTemplate['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-template-management">Report Templates</h1>
          <p className="text-muted-foreground">
            Manage report templates for vulnerability assessments and penetration tests
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Report Template</DialogTitle>
              <DialogDescription>
                Create a new report template for generating standardized reports
              </DialogDescription>
            </DialogHeader>
            <TemplateForm
              onSubmit={(data) => createTemplateMutation.mutate(data)}
              isPending={createTemplateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first report template
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-first-template">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Report Template</DialogTitle>
                  <DialogDescription>
                    Create a new report template for generating standardized reports
                  </DialogDescription>
                </DialogHeader>
                <TemplateForm
                  onSubmit={(data) => createTemplateMutation.mutate(data)}
                  isPending={createTemplateMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg" data-testid={`text-template-name-${template.id}`}>
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getTemplateTypeBadgeVariant(template.type)}
                        data-testid={`badge-template-type-${template.id}`}
                      >
                        {formatTemplateType(template.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      data-testid={`button-edit-template-${template.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template)}
                      data-testid={`button-delete-template-${template.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3" data-testid={`text-template-description-${template.id}`}>
                    {template.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Report Template</DialogTitle>
            <DialogDescription>
              Update the report template details and content
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <TemplateForm
              initialValues={{
                name: editingTemplate.name,
                description: editingTemplate.description || "",
                content: editingTemplate.content,
                type: editingTemplate.type,
              }}
              onSubmit={(data) => updateTemplateMutation.mutate({ 
                id: editingTemplate.id, 
                data 
              })}
              isPending={updateTemplateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateFormProps {
  initialValues?: Partial<TemplateFormData>;
  onSubmit: (data: TemplateFormData) => void;
  isPending: boolean;
}

function TemplateForm({ initialValues, onSubmit, isPending }: TemplateFormProps) {
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      content: initialValues?.content || "",
      type: initialValues?.type || "html",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Standard VAPT Report" 
                  {...field} 
                  data-testid="input-template-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Type</FormLabel>
              <FormControl>
                <select 
                  {...field} 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="select-template-type"
                >
                  <option value="html">HTML Report</option>
                  <option value="docx">DOCX Document</option>
                  <option value="markdown">Markdown Document</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Brief description of this template" 
                  {...field} 
                  value={field.value || ""}
                  data-testid="input-template-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Template content with variables like {{findings}}, {{scope}}, {{executive_summary}}..."
                  className="min-h-[200px]"
                  {...field} 
                  data-testid="textarea-template-content"
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground">
                <p>Available variables:</p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <span>• {`{{findings}}`} - All findings</span>
                  <span>• {`{{scope}}`} - Project scope</span>
                  <span>• {`{{executive_summary}}`} - Summary</span>
                  <span>• {`{{organization_name}}`} - Client name</span>
                  <span>• {`{{project_name}}`} - Project name</span>
                  <span>• {`{{date}}`} - Current date</span>
                </div>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isPending} data-testid="button-save-template">
            {isPending ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}