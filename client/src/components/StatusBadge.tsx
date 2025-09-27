import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FindingStatus = "draft" | "submitted" | "company_review" | "remediation_in_progress" | "ready_for_retest" | "verified_fixed" | "risk_accepted" | "closed";
type ProjectStatus = "planned" | "in_progress" | "complete";

interface StatusBadgeProps {
  status: FindingStatus | ProjectStatus;
  className?: string;
}

const statusConfig = {
  // Finding statuses
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  company_review: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  remediation_in_progress: {
    label: "In Remediation",
    className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  },
  ready_for_retest: {
    label: "Ready for Retest",
    className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  },
  verified_fixed: {
    label: "Verified Fixed",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  risk_accepted: {
    label: "Risk Accepted",
    className: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800",
  },
  closed: {
    label: "Closed",
    className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
  },
  // Project statuses
  planned: {
    label: "Planned",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  complete: {
    label: "Complete",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}