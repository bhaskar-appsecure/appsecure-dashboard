import { ProjectCard } from '../ProjectCard'

// TODO: Remove mock data
const mockProject = {
  id: 'p-001',
  name: 'E-commerce Platform Security Assessment',
  customerName: 'TechCorp Industries',
  description: 'Comprehensive security assessment of the customer-facing e-commerce platform including web application, API endpoints, and payment processing systems.',
  status: 'in_progress' as const,
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-02-28'),
  findingStats: {
    total: 23,
    critical: 2,
    high: 5,
    medium: 8,
    low: 6,
    informational: 2,
  },
  teamSize: 4,
  progress: 65,
}

export default function ProjectCardExample() {
  return (
    <div className="max-w-sm">
      <ProjectCard
        project={mockProject}
        onOpen={(id) => console.log('Opening project:', id)}
        onViewFindings={(id) => console.log('View findings:', id)}
      />
    </div>
  )
}