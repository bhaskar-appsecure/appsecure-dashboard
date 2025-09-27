import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, X, MessageSquare, Clock, User, Calendar, Building } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CVSSCalculator } from "@/components/CVSSCalculator";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Finding {
  id: string;
  title: string;
  descriptionHtml?: string;
  stepsHtml?: string;
  impactHtml?: string;
  fixHtml?: string;
  cvssVector?: string;
  cvssScore?: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  status: string;
  createdAt: string;
  updatedAt: string;
  project: {
    name: string;
    id: string;
  };
  reporter: {
    firstName: string;
    lastName: string;
  };
}

interface Activity {
  id: string;
  action: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  actorId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

export default function FindingDetail() {
  const [, params] = useRoute("/findings/:id");
  const findingId = params?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editedFinding, setEditedFinding] = useState<Partial<Finding>>({});
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: finding, isLoading } = useQuery({
    queryKey: ['/api/findings', findingId],
    enabled: !!findingId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['/api/findings', findingId, 'activities'],
    enabled: !!findingId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['/api/findings', findingId, 'comments'],
    enabled: !!findingId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Finding>) => 
      fetch(`/api/findings/${findingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/findings', findingId] });
      queryClient.invalidateQueries({ queryKey: ['/api/findings', findingId, 'activities'] });
      setIsEditing(false);
      setEditedFinding({});
      toast({
        title: "Finding updated",
        description: "Changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update finding. Please try again.",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      fetch(`/api/findings/${findingId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/findings', findingId, 'comments'] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(editedFinding);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedFinding({});
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      commentMutation.mutate(newComment);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Finding Not Found</h1>
          <p className="text-muted-foreground mb-4">The finding you're looking for doesn't exist.</p>
          <Link href="/findings">
            <Button>Back to Findings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const typedFinding = finding as Finding;
  const typedActivities = activities as Activity[];
  const typedComments = comments as Comment[];

  return (
    <div className="p-6" data-testid="page-finding-detail">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/findings">
              <Button variant="ghost" size="sm" data-testid="button-back-to-findings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Findings
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold" data-testid="heading-finding-title">
                {isEditing ? (
                  <Input
                    value={editedFinding.title ?? typedFinding.title}
                    onChange={(e) => setEditedFinding({ ...editedFinding, title: e.target.value })}
                    className="text-2xl font-bold border-none p-0 h-auto bg-transparent"
                    data-testid="input-edit-title"
                  />
                ) : (
                  typedFinding.title
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <SeverityBadge severity={typedFinding.severity} />
                {isEditing ? (
                  <Select
                    value={editedFinding.status ?? typedFinding.status}
                    onValueChange={(value) => setEditedFinding({ ...editedFinding, status: value })}
                  >
                    <SelectTrigger className="w-48" data-testid="select-edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="company_review">Under Review</SelectItem>
                      <SelectItem value="remediation_in_progress">In Remediation</SelectItem>
                      <SelectItem value="ready_for_retest">Ready for Retest</SelectItem>
                      <SelectItem value="verified_fixed">Verified Fixed</SelectItem>
                      <SelectItem value="risk_accepted">Risk Accepted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={typedFinding.status as any} />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-changes"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-cancel-edit"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                disabled={typedFinding.status === 'closed' || typedFinding.status === 'verified_fixed'}
                data-testid="button-edit-finding"
              >
                Edit Finding
              </Button>
            )}
          </div>
        </div>

        {/* Finding Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/projects/${typedFinding.project.id}`} className="text-primary hover:underline">
                {typedFinding.project.name}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Reporter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {typedFinding.reporter.firstName?.[0]}{typedFinding.reporter.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span>{typedFinding.reporter.firstName} {typedFinding.reporter.lastName}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reported
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{format(new Date(typedFinding.createdAt), 'MMM d, yyyy')}</p>
              <p className="text-sm text-muted-foreground">
                Updated {format(new Date(typedFinding.updatedAt), 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Finding Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedFinding.descriptionHtml ?? typedFinding.descriptionHtml ?? ""}
                  onChange={(e) => setEditedFinding({ ...editedFinding, descriptionHtml: e.target.value })}
                  rows={6}
                  placeholder="Describe the vulnerability..."
                  data-testid="textarea-edit-description"
                />
              ) : (
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: typedFinding.descriptionHtml || "No description provided." }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Steps to Reproduce</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedFinding.stepsHtml ?? typedFinding.stepsHtml ?? ""}
                  onChange={(e) => setEditedFinding({ ...editedFinding, stepsHtml: e.target.value })}
                  rows={6}
                  placeholder="List the steps to reproduce..."
                  data-testid="textarea-edit-steps"
                />
              ) : (
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: typedFinding.stepsHtml || "No steps provided." }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impact</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedFinding.impactHtml ?? typedFinding.impactHtml ?? ""}
                  onChange={(e) => setEditedFinding({ ...editedFinding, impactHtml: e.target.value })}
                  rows={6}
                  placeholder="Describe the impact..."
                  data-testid="textarea-edit-impact"
                />
              ) : (
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: typedFinding.impactHtml || "No impact description provided." }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fix Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedFinding.fixHtml ?? typedFinding.fixHtml ?? ""}
                  onChange={(e) => setEditedFinding({ ...editedFinding, fixHtml: e.target.value })}
                  rows={6}
                  placeholder="Suggest fixes..."
                  data-testid="textarea-edit-fix"
                />
              ) : (
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: typedFinding.fixHtml || "No fix suggestions provided." }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* CVSS Score Section */}
        <div className="space-y-6">
          {isEditing ? (
            <CVSSCalculator
              value={editedFinding.cvssVector ?? typedFinding.cvssVector ?? ""}
              onChange={(vector, score, severity) => {
                setEditedFinding({ 
                  ...editedFinding, 
                  cvssVector: vector,
                  cvssScore: score,
                  severity: severity as any
                });
              }}
              disabled={updateMutation.isPending}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>CVSS Score</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-sm" data-testid="cvss-score-display">
                      {typedFinding.cvssScore?.toFixed(1) ?? "N/A"}
                    </Badge>
                    <SeverityBadge severity={typedFinding.severity} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typedFinding.cvssVector ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">CVSS Vector</p>
                    <p className="font-mono text-sm bg-muted p-2 rounded" data-testid="cvss-vector-display">
                      {typedFinding.cvssVector}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No CVSS score calculated</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typedActivities.length === 0 ? (
              <p className="text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {typedActivities.map((activity) => (
                  <div key={activity.id} className="border-l-2 border-muted pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{activity.action}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {activity.oldValues && activity.newValues && (
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(activity.newValues).map((key) => (
                          <div key={key}>
                            <strong>{key}:</strong> {activity.oldValues[key]} → {activity.newValues[key]}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({typedComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Comment */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    data-testid="textarea-new-comment"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || commentMutation.isPending}
                      size="sm"
                      data-testid="button-add-comment"
                    >
                      {commentMutation.isPending ? "Adding..." : "Add Comment"}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              {typedComments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {typedComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {comment.author.firstName} {comment.author.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}