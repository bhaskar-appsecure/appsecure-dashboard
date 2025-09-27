import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from './StatusBadge';
import {
  Building2,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    customerName: string;
    description?: string;
    status: 'planned' | 'in_progress' | 'complete';
    startDate?: Date;
    endDate?: Date;
    findingStats?: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
      informational: number;
    };
    teamSize?: number;
    progress?: number;
  };
  onOpen?: (id: string) => void;
  onViewFindings?: (id: string) => void;
  className?: string;
}

export function ProjectCard({
  project,
  onOpen,
  onViewFindings,
  className,
}: ProjectCardProps) {
  const handleOpen = () => {
    onOpen?.(project.id);
    console.log('Opening project:', project.id);
  };

  const handleViewFindings = () => {
    onViewFindings?.(project.id);
    console.log('View findings for project:', project.id);
  };

  const getSeverityCount = (severity: keyof typeof project.findingStats) => {
    return project.findingStats?.[severity] || 0;
  };

  const getProgressPercentage = () => {
    if (project.progress !== undefined) return project.progress;
    if (project.status === 'complete') return 100;
    if (project.status === 'in_progress') return 65;
    return 0;
  };

  return (
    <Card 
      className={cn('hover-elevate transition-colors', className)} 
      data-testid={`card-project-${project.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate mb-1">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span>{project.customerName}</span>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        {/* Project Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
        
        {/* Date Range */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {project.startDate && format(project.startDate, 'MMM dd')}
              {project.startDate && project.endDate && ' - '}
              {project.endDate && format(project.endDate, 'MMM dd, yyyy')}
            </span>
          </div>
        )}
        
        {/* Team Size */}
        {project.teamSize && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{project.teamSize} team members</span>
          </div>
        )}
        
        {/* Finding Statistics */}
        {project.findingStats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Findings</span>
              <span className="text-sm text-muted-foreground">
                {project.findingStats.total} total
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {getSeverityCount('critical') > 0 && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  {getSeverityCount('critical')} Critical
                </Badge>
              )}
              {getSeverityCount('high') > 0 && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  {getSeverityCount('high')} High
                </Badge>
              )}
              {getSeverityCount('medium') > 0 && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  {getSeverityCount('medium')} Medium
                </Badge>
              )}
              {getSeverityCount('low') > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {getSeverityCount('low')} Low
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleOpen} 
            className="flex-1"
            data-testid={`button-open-${project.id}`}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Project
          </Button>
          {project.findingStats && project.findingStats.total > 0 && (
            <Button 
              variant="outline" 
              onClick={handleViewFindings}
              data-testid={`button-findings-${project.id}`}
            >
              View Findings
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}