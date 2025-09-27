import { FindingCard } from '../FindingCard'

// TODO: Remove mock data
const mockFinding = {
  id: 'f-001',
  title: 'SQL Injection in /api/v1/users endpoint',
  severity: 'critical' as const,
  status: 'submitted',
  description: '<p>The user authentication endpoint is vulnerable to SQL injection attacks through the username parameter. An attacker can bypass authentication and gain unauthorized access to the application.</p>',
  cvssScore: 9.8,
  createdBy: {
    id: 'u-001',
    name: 'Sarah Chen',
    avatar: undefined,
  },
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  commentsCount: 3,
  evidenceCount: 5,
  affectedAssets: ['api.example.com', 'app.example.com', 'admin.example.com'],
}

export default function FindingCardExample() {
  return (
    <div className="max-w-md">
      <FindingCard
        finding={mockFinding}
        onView={(id) => console.log('Viewing finding:', id)}
        onEdit={(id) => console.log('Editing finding:', id)}
        onStatusChange={(id, status) => console.log('Status change:', id, status)}
      />
    </div>
  )
}