import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const createFindingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().min(1, "Project is required"),
  severity: z.enum(["critical", "high", "medium", "low", "informational"]),
  descriptionHtml: z.string().optional(),
  stepsHtml: z.string().optional(),
  impactHtml: z.string().optional(),
  fixHtml: z.string().optional(),
});

type CreateFindingForm = z.infer<typeof createFindingSchema>;

interface Project {
  id: string;
  name: string;
}

export default function CreateFinding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const form = useForm<CreateFindingForm>({
    resolver: zodResolver(createFindingSchema),
    defaultValues: {
      title: "",
      projectId: "",
      severity: "medium",
      descriptionHtml: "",
      stepsHtml: "",
      impactHtml: "",
      fixHtml: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFindingForm) =>
      fetch(`/api/projects/${data.projectId}/findings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create finding');
        return res.json();
      }),
    onSuccess: (finding) => {
      queryClient.invalidateQueries({ queryKey: ['/api/findings'] });
      toast({
        title: "Finding created",
        description: "The finding has been created successfully.",
      });
      setLocation(`/findings/${finding.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create finding. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreateFindingForm) => {
    createMutation.mutate(data);
  };

  const typedProjects = projects as Project[];

  return (
    <div className="p-6" data-testid="page-create-finding">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/findings">
            <Button variant="ghost" size="sm" data-testid="button-back-to-findings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Findings
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" data-testid="heading-create-finding">
              Create New Finding
            </h1>
            <p className="text-muted-foreground">
              Document a new security finding for your project
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finding Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter finding title..."
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingProjects}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-project">
                              <SelectValue placeholder="Select project..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {typedProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-severity">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="informational">Informational</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Technical Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vulnerability Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="descriptionHtml"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={8}
                            placeholder="Describe the vulnerability in detail..."
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Steps to Reproduce</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="stepsHtml"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={8}
                            placeholder="1. Step one&#10;2. Step two&#10;3. Result"
                            data-testid="textarea-steps"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="impactHtml"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={8}
                            placeholder="Describe the potential impact and risks..."
                            data-testid="textarea-impact"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fix Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="fixHtml"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={8}
                            placeholder="Provide recommendations for fixing this vulnerability..."
                            data-testid="textarea-fix"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Link href="/findings">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-create-finding"
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creating..." : "Create Finding"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}