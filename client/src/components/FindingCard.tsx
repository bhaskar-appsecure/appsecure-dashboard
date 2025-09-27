import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import {
  Eye,
  MessageSquare,
  Paperclip,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FindingCardProps {
  finding: {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
    status: string;
    description?: string;
    cvssScore?: number;
    createdBy: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    commentsCount?: number;
    evidenceCount?: number;
    affectedAssets?: string[];
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  className?: string;
}

export function FindingCard({
  finding,
  onView,
  onEdit,
  onStatusChange,
  className,
}: FindingCardProps) {
  const handleView = () => {
    onView?.(finding.id);
    console.log('View finding:', finding.id);
  };

  const handleEdit = () => {
    onEdit?.(finding.id);
    console.log('Edit finding:', finding.id);
  };

  const handleStatusChange = (status: string) => {
    onStatusChange?.(finding.id, status);
    console.log('Change status:', finding.id, status);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card 
      className={cn('hover-elevate transition-colors', className)} 
      data-testid={`card-finding-${finding.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate mb-2">
              {finding.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={finding.severity} />
              <StatusBadge status={finding.status as any} />
              {finding.cvssScore && (
                <Badge variant="outline" className="font-mono text-xs">
                  {finding.cvssScore.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid={`button-menu-${finding.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                Edit Finding
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('submitted')}>
                Mark as Submitted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                Close Finding
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {finding.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {finding.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
          </p>
        )}
        
        {finding.affectedAssets && finding.affectedAssets.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {finding.affectedAssets.slice(0, 3).map((asset, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {asset}
                </Badge>
              ))}
              {finding.affectedAssets.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{finding.affectedAssets.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={finding.createdBy.avatar} />
              <AvatarFallback className="text-xs">
                {getInitials(finding.createdBy.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {finding.createdBy.name}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {finding.commentsCount !== undefined && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{finding.commentsCount}</span>
              </div>
            )}
            {finding.evidenceCount !== undefined && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{finding.evidenceCount}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(finding.updatedAt, { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleView}
            data-testid={`button-view-${finding.id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            onClick={handleEdit}
            data-testid={`button-edit-${finding.id}`}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}