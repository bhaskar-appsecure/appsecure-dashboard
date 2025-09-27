import { StatusBadge } from '../StatusBadge'

export default function StatusBadgeExample() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Finding Statuses</h4>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status="draft" />
          <StatusBadge status="submitted" />
          <StatusBadge status="company_review" />
          <StatusBadge status="remediation_in_progress" />
          <StatusBadge status="ready_for_retest" />
          <StatusBadge status="verified_fixed" />
          <StatusBadge status="risk_accepted" />
          <StatusBadge status="closed" />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Project Statuses</h4>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status="planned" />
          <StatusBadge status="in_progress" />
          <StatusBadge status="complete" />
        </div>
      </div>
    </div>
  )
}