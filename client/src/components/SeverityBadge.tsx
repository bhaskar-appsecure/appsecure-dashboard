import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Severity = "critical" | "high" | "medium" | "low" | "informational";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  low: {
    label: "Low",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  informational: {
    label: "Info",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
      data-testid={`badge-severity-${severity}`}
    >
      {config.label}
    </Badge>
  );
}