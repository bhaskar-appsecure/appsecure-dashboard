# Pentest Reporting Tool - Design Guidelines

## Design Approach
**System-Based Approach - Material Design**
This enterprise security platform requires a professional, data-dense interface that prioritizes functionality and trust. Material Design provides the structured components and clear visual hierarchy needed for complex security workflows.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary (Default)**
- Primary: 219 91% 60% (Security Blue)
- Background: 222 84% 5% (Deep Charcoal)
- Surface: 217 33% 17% (Dark Surface)
- Text Primary: 210 40% 98%
- Text Secondary: 215 25% 70%

**Light Mode**
- Primary: 219 91% 45%
- Background: 0 0% 100%
- Surface: 210 40% 98%
- Text Primary: 222 84% 5%

**Status Colors**
- Critical: 0 84% 60% (Red)
- High: 25 95% 53% (Orange)
- Medium: 45 93% 47% (Yellow)
- Low: 142 76% 36% (Green)
- Info: 217 91% 60% (Blue)

### B. Typography
**Font Family**: Inter (Google Fonts)
- Headers: Inter 600 (Semibold)
- Body: Inter 400 (Regular)
- Code/Technical: JetBrains Mono 400

**Scale**
- H1: 2rem (32px) - Dashboard titles
- H2: 1.5rem (24px) - Section headers
- H3: 1.25rem (20px) - Card titles
- Body: 0.875rem (14px) - Primary text
- Caption: 0.75rem (12px) - Metadata

### C. Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px)
- Section spacing: p-8, m-8 (32px)
- Page margins: p-6, m-6 (24px)

**Grid**: 12-column responsive grid with consistent gutters

### D. Component Library

**Navigation**
- Top navigation bar with org/project context switcher
- Sidebar navigation with role-based menu items
- Breadcrumb navigation for deep pages
- Tab navigation for multi-view pages (Findings/Templates/Exports)

**Data Display**
- Dense data tables with sorting, filtering, and pagination
- Finding cards with severity indicators and status badges
- Evidence galleries with thumbnail previews
- Activity timelines with user avatars and timestamps

**Forms & Input**
- Rich text editors with sanitized HTML toolbar
- File upload areas with drag-and-drop and progress indicators
- CVSS calculator with visual vector breakdown
- Multi-select dropdowns for tags and assets

**Status & Feedback**
- Severity pills with color-coded backgrounds
- Status badges with appropriate semantic colors
- Progress indicators for long-running exports
- Toast notifications for actions and updates

**Overlays**
- Modal dialogs for finding creation/editing
- Slide-over panels for comments and activity
- Dropdown menus for bulk actions
- Confirmation dialogs for destructive actions

### E. Security-Focused Design Patterns

**Trust Indicators**
- Audit trail visibility with timestamps and user attribution
- Version history with clear diff indicators
- Export validation with checksums and metadata
- Template version tracking with change indicators

**Data Hierarchy**
- Critical findings prominently displayed with red indicators
- Evidence thumbnails with hover previews
- Expandable sections for detailed technical content
- Clear separation between draft and submitted content

**Role-Based UI**
- Dynamic navigation based on user permissions
- Contextual action buttons (submit, approve, export)
- Clear visual distinction between read-only and editable content
- Role badges and project access indicators

## Key Pages Layout

**Researcher Dashboard**
- Left sidebar: Project list with search and filters
- Main area: Selected project findings table
- Right panel: Quick actions and recent activity

**Customer Portal**
- Header: Project overview with severity summary cards
- Tabbed interface: Findings | Templates | Exports | Activity
- Findings table with advanced filtering and bulk actions

**Finding Editor**
- Tabbed form: Details | Steps | Impact | Fix | Evidence
- Split view: Form on left, preview on right
- Floating save/submit actions bar

**Template Manager**
- Template library with preview thumbnails
- Side-by-side editor and preview for HTML templates
- Variable reference panel with drag-and-drop placeholders

## Animations
Minimal and purposeful:
- Smooth page transitions (200ms ease-in-out)
- Loading states for data fetching
- Hover states for interactive elements
- No decorative animations to maintain professional focus