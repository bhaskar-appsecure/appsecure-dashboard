import { SeverityBadge } from '../SeverityBadge'

export default function SeverityBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <SeverityBadge severity="critical" />
      <SeverityBadge severity="high" />
      <SeverityBadge severity="medium" />
      <SeverityBadge severity="low" />
      <SeverityBadge severity="informational" />
    </div>
  )
}