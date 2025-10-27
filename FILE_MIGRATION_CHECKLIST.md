# SecureReportFlow - File Migration Checklist
**Prototype → Production Refactoring**
**Version:** 2.0
**Last Updated:** October 27, 2024

---

## Migration Strategy

**Core Philosophy:** "Copy Logic, Improve Structure"

- ✅ Preserve prototype as reference (read-only)
- ✅ Copy to production folder
- ✅ Reuse 95% of working logic
- ✅ Reorganize file structure
- ✅ Add PRD compliance features

---

## Phase 1: Copy AS-IS (No Modifications)

### Database & Core
- [ ] `shared/schema.ts` - Perfect database schema
- [ ] `server/db.ts` - Database connection
- [ ] `server/vite.ts` - Vite dev server config
- [ ] `drizzle.config.ts` - Drizzle ORM config

### Frontend UI Components (All Shadcn)
- [ ] `client/src/components/ui/button.tsx`
- [ ] `client/src/components/ui/card.tsx`
- [ ] `client/src/components/ui/input.tsx`
- [ ] `client/src/components/ui/label.tsx`
- [ ] `client/src/components/ui/select.tsx`
- [ ] `client/src/components/ui/dialog.tsx`
- [ ] `client/src/components/ui/dropdown-menu.tsx`
- [ ] `client/src/components/ui/table.tsx`
- [ ] `client/src/components/ui/badge.tsx`
- [ ] `client/src/components/ui/avatar.tsx`
- [ ] `client/src/components/ui/separator.tsx`
- [ ] `client/src/components/ui/toast.tsx`
- [ ] `client/src/components/ui/toaster.tsx`
- [ ] `client/src/components/ui/use-toast.ts`
- [ ] `client/src/components/ui/sidebar.tsx`
- [ ] `client/src/components/ui/tabs.tsx`
- [ ] `client/src/components/ui/textarea.tsx`
- [ ] `client/src/components/ui/checkbox.tsx`
- [ ] `client/src/components/ui/switch.tsx`
- [ ] `client/src/components/ui/radio-group.tsx`
- [ ] `client/src/components/ui/scroll-area.tsx`
- [ ] `client/src/components/ui/skeleton.tsx`
- [ ] `client/src/components/ui/alert.tsx`
- [ ] `client/src/components/ui/alert-dialog.tsx`
- [ ] `client/src/components/ui/breadcrumb.tsx`
- [ ] `client/src/components/ui/command.tsx`
- [ ] `client/src/components/ui/context-menu.tsx`
- [ ] `client/src/components/ui/hover-card.tsx`
- [ ] `client/src/components/ui/menubar.tsx`
- [ ] `client/src/components/ui/navigation-menu.tsx`
- [ ] `client/src/components/ui/popover.tsx`
- [ ] `client/src/components/ui/progress.tsx`
- [ ] `client/src/components/ui/sheet.tsx`
- [ ] `client/src/components/ui/slider.tsx`
- [ ] `client/src/components/ui/toggle.tsx`
- [ ] `client/src/components/ui/toggle-group.tsx`
- [ ] `client/src/components/ui/tooltip.tsx`
- [ ] *(Copy all remaining Shadcn components)*

### Helper Files
- [ ] `client/src/lib/utils.ts` - cn() utility
- [ ] `client/src/hooks/use-toast.tsx` - Toast hook
- [ ] `client/src/hooks/use-mobile.tsx` - Mobile detection
- [ ] `client/src/components/ThemeToggle.tsx` - Dark mode

### Configuration
- [ ] `package.json` - Dependencies
- [ ] `tsconfig.json` - TypeScript config
- [ ] `tailwind.config.ts` - Tailwind CSS
- [ ] `vite.config.ts` - Vite config
- [ ] `.env` - Environment (**UPDATE database name!**)
- [ ] `.gitignore` - Git ignore
- [ ] `postcss.config.js` - PostCSS
- [ ] `components.json` - Shadcn config

---

## Phase 2: Copy & Enhance

### Backend - Auth & Core
- [ ] `server/auth.ts`
  - **Copy** existing logic
  - **Add** portal type validation (~30 lines)
  - **Add** role restrictions by portal

- [ ] `server/index.ts`
  - **Copy** Express setup
  - **Add** helmet for security headers
  - **Add** CORS configuration
  - **Add** API versioning `/api/v1/`

### Frontend - Authentication
- [ ] `client/src/pages/Landing.tsx` - Copy as-is
- [ ] `client/src/pages/PortalSelection.tsx` - Copy as-is
- [ ] `client/src/pages/Login.tsx`
  - **Copy** existing
  - **Modify** line 36: add `portalType` to login request

- [ ] `client/src/hooks/useAuth.ts`
  - **Copy** existing
  - **Add** portal type state (~5 lines)

- [ ] `client/src/lib/queryClient.ts`
  - **Copy** existing
  - **Enhance** error handling (~10 lines)

### Frontend - Pages (Copy & Simplify)
- [ ] `client/src/pages/Dashboard.tsx`
  - **Copy** existing
  - **Remove** mock data (~100 lines)
  - **Keep** structure and layout

- [ ] `client/src/components/AppSidebar.tsx`
  - **Copy** existing
  - **Add** portal-based navigation (~50 lines)
  - Client menu: Dashboard, My Projects, Logout
  - Internal menu: Dashboard, Projects, Findings, Users, Roles, Templates

### Frontend - Reference for Refactoring
- [ ] `client/src/pages/Projects.tsx` - Copy for reference (will split later)
- [ ] `client/src/pages/ProjectDetail.tsx` - Copy for reference
- [ ] `client/src/pages/UserManagement.tsx` - Copy for reference
- [ ] `client/src/pages/RoleManagement.tsx` - Copy for reference
- [ ] `client/src/pages/MyFindings.tsx` - Copy for reference
- [ ] `client/src/pages/FindingDetail.tsx` - Copy for reference
- [ ] `client/src/pages/Templates.tsx` - Copy for reference

---

## Phase 3: Extract & Reorganize

### Backend - Services (Extract from routes.ts)

#### Create Services
- [ ] `server/services/BaseService.ts` - New foundation class
- [ ] `server/services/ProjectService.ts`
  - **Extract** lines 142-205 from `routes.ts`
  - **Copy** project creation logic
  - **Copy** project update logic
  - **Copy** project validation

- [ ] `server/services/FindingService.ts`
  - **Extract** lines 259-360 from `routes.ts`
  - **Copy** finding CRUD logic
  - **Copy** CVSS calculation (keep as-is!)

- [ ] `server/services/UserService.ts`
  - **Extract** lines 950-1020 from `routes.ts`
  - **Copy** user creation logic
  - **Copy** password hashing (keep as-is!)

- [ ] `server/services/TemplateService.ts`
  - **Extract** lines 1289-1440 from `routes.ts`
  - **Copy** template CRUD logic
  - **Add** template rendering with nunjucks

- [ ] `server/services/ExportService.ts`
  - **Extract** lines 709-786 from `routes.ts`
  - **Copy** PDF generation logic (keep Puppeteer!)
  - **Add** SHA-256 checksum calculation

- [ ] `server/services/RoleService.ts`
  - **Extract** lines 790-940 from `routes.ts`
  - **Copy** role management logic

### Backend - Repositories (Extract from storage.ts)

#### Create Repositories
- [ ] `server/repositories/BaseRepository.ts` - Generic CRUD
- [ ] `server/repositories/ProjectRepository.ts`
  - **Extract** project queries from `storage.ts`

- [ ] `server/repositories/FindingRepository.ts`
  - **Extract** finding queries from `storage.ts`

- [ ] `server/repositories/UserRepository.ts`
  - **Extract** user queries from `storage.ts`

### Backend - Routes (Split from routes.ts)

#### Create Route Files
- [ ] `server/routes/index.ts` - Route aggregator (new)
- [ ] `server/routes/projects.ts`
  - **Extract** lines 109-205 from `routes.ts`
  - Use ProjectService

- [ ] `server/routes/findings.ts`
  - **Extract** lines 208-400 from `routes.ts`
  - Use FindingService

- [ ] `server/routes/users.ts`
  - **Extract** lines 950-1100 from `routes.ts`
  - Use UserService

- [ ] `server/routes/roles.ts`
  - **Extract** lines 790-940 from `routes.ts`
  - Use RoleService

- [ ] `server/routes/templates.ts`
  - **Extract** lines 1289-1440 from `routes.ts`
  - Use TemplateService

- [ ] `server/routes/exports.ts`
  - **Extract** lines 690-786 from `routes.ts`
  - Use ExportService

- [ ] `server/routes/invitations.ts`
  - **Extract** lines 1440-1580 from `routes.ts`

- [ ] `server/routes/bootstrap.ts`
  - **Extract** lines 49-107 from `routes.ts`

### Frontend - Component Splitting

#### Projects Components
- [ ] `client/src/pages/Projects.tsx` (200 lines)
  - **Keep** container structure
  - **Remove** inline logic

- [ ] `client/src/components/projects/ProjectsList.tsx` (200 lines)
  - **Extract** from Projects.tsx
  - **Copy** project card/table rendering

- [ ] `client/src/components/projects/ProjectForm.tsx` (200 lines)
  - **Extract** from Projects.tsx
  - **Copy** create/edit form logic

- [ ] `client/src/components/projects/ProjectFilters.tsx` (154 lines)
  - **Extract** from Projects.tsx
  - **Copy** filter controls

#### ProjectDetail Components
- [ ] `client/src/pages/ProjectDetail.tsx` (400 lines)
  - **Keep** main layout
  - **Remove** mock data

- [ ] `client/src/components/projects/ProjectTeam.tsx` (80 lines)
  - **Extract** from ProjectDetail.tsx

- [ ] `client/src/components/projects/ProjectCredentials.tsx` (100 lines)
  - **Extract** from ProjectDetail.tsx

- [ ] `client/src/components/projects/ProjectCollections.tsx` (80 lines)
  - **Extract** from ProjectDetail.tsx

#### User Management Components
- [ ] `client/src/pages/UserManagement.tsx` (150 lines)
  - **Keep** container

- [ ] `client/src/components/users/UserList.tsx` (200 lines)
  - **Extract** from UserManagement.tsx

- [ ] `client/src/components/users/UserForm.tsx` (168 lines)
  - **Extract** from UserManagement.tsx

#### Role Management Components
- [ ] `client/src/pages/RoleManagement.tsx` (150 lines)
  - **Keep** container

- [ ] `client/src/components/roles/RoleList.tsx` (200 lines)
  - **Extract** from RoleManagement.tsx

- [ ] `client/src/components/roles/RoleForm.tsx` (237 lines)
  - **Extract** from RoleManagement.tsx

---

## Phase 4: Create New (PRD & Architecture)

### Backend - Middleware (New)
- [ ] `server/middleware/errorHandler.ts` - Centralized error handling
- [ ] `server/middleware/validation.ts` - Request validation
- [ ] `server/middleware/logging.ts` - Structured logging
- [ ] `server/middleware/rateLimiter.ts` - Rate limiting
- [ ] `server/middleware/security.ts` - Security headers
- [ ] `server/middleware/audit.ts` - Audit logging

### Backend - PRD Features (New)
- [ ] `server/services/NotificationService.ts` - Email & in-app notifications
- [ ] `server/routes/notifications.ts` - Notification endpoints
- [ ] `server/templates/emails/finding-created.html`
- [ ] `server/templates/emails/finding-status-changed.html`
- [ ] `server/templates/emails/finding-assigned.html`
- [ ] `server/templates/emails/mention-notification.html`
- [ ] `server/templates/emails/export-complete.html`

### Frontend - API Layer (New)
- [ ] `client/src/lib/api/baseApi.ts` - API client foundation
- [ ] `client/src/lib/api/projectApi.ts` - Project endpoints
- [ ] `client/src/lib/api/findingApi.ts` - Finding endpoints
- [ ] `client/src/lib/api/userApi.ts` - User endpoints
- [ ] `client/src/lib/api/roleApi.ts` - Role endpoints
- [ ] `client/src/lib/api/templateApi.ts` - Template endpoints
- [ ] `client/src/lib/api/notificationApi.ts` - Notification endpoints
- [ ] `client/src/lib/formSchemas.ts` - Centralized Zod schemas

### Frontend - Data Hooks (New)
- [ ] `client/src/hooks/data/useProjects.ts` - Project data hook
- [ ] `client/src/hooks/data/useFindings.ts` - Finding data hook
- [ ] `client/src/hooks/data/useUsers.ts` - User data hook
- [ ] `client/src/hooks/data/useRoles.ts` - Role data hook
- [ ] `client/src/hooks/data/useTemplates.ts` - Template data hook
- [ ] `client/src/hooks/data/useNotifications.ts` - Notification hook
- [ ] `client/src/hooks/useFormState.ts` - Form state management
- [ ] `client/src/hooks/useErrorHandler.ts` - Error handling

### Frontend - PRD Components (New)
- [ ] `client/src/pages/Notifications.tsx` - Notification center
- [ ] `client/src/components/NotificationBell.tsx` - Bell icon + dropdown
- [ ] `client/src/components/NotificationPreferences.tsx` - Settings
- [ ] `client/src/components/TemplatePreview.tsx` - Template preview
- [ ] `client/src/components/TemplateVariableBrowser.tsx` - Variable picker
- [ ] `client/src/pages/Reports.tsx` - Reports page
- [ ] `client/src/components/reports/ReportWizard.tsx`
- [ ] `client/src/components/reports/ReportHistory.tsx`

### Documentation (New)
- [ ] `docs/ARCHITECTURE.md` - System architecture
- [ ] `docs/API.md` - API documentation
- [ ] `docs/COMPONENTS.md` - Component documentation
- [ ] `docs/CONTRIBUTING.md` - Contribution guide

---

## Phase 5: Skip/Don't Copy

- [ ] ❌ `node_modules/` - Fresh npm install
- [ ] ❌ `dist/` - Fresh build
- [ ] ❌ `.replit`, `replit.nix` - Replit-specific
- [ ] ❌ `REFACTORING_PLAN.md` - Keep only in prototype

---

## Migration Verification Checklist

### Day 0 - Setup
- [ ] Prototype folder backed up (read-only)
- [ ] Production folder created
- [ ] `npm install` completed
- [ ] New database created
- [ ] Baseline working (login, basic routes)

### Day 1 - Foundation
- [ ] Portal-based authentication working
- [ ] Client portal login restricts roles correctly
- [ ] Internal portal login restricts roles correctly
- [ ] Dashboard displays for both portals
- [ ] Navigation differs by portal type

### Day 2 - Services
- [ ] All services created (Project, Finding, User, Template, Export)
- [ ] Business logic extracted from routes.ts
- [ ] Export checksums being calculated
- [ ] Services tested and working

### Day 7 - Routes Split
- [ ] Monolithic routes.ts deleted
- [ ] 8 route modules created
- [ ] All endpoints still functional
- [ ] Services integrated with routes

### Day 9 - Template Engine
- [ ] Nunjucks/Handlebars installed
- [ ] Template variables working ({{ }})
- [ ] Template loops working ({% %})
- [ ] Template preview with real data
- [ ] EXIF stripping for images
- [ ] Pre-signed URLs for evidence

### Day 11 - Notifications
- [ ] Email service configured
- [ ] Email notifications sending
- [ ] In-app notifications working
- [ ] Notification bell with unread count
- [ ] Notification preferences working
- [ ] Private notes UI functional

### Day 15 - Complete
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Production build successful
- [ ] Documentation complete
- [ ] Ready for deployment

---

## Summary Statistics

**Total Files:**
- ✅ Copy as-is: ~60 files
- ⚠️ Copy & enhance: ~15 files
- 🔄 Extract & reorganize: ~8 files → ~30 new files
- ➕ Create new: ~40 files

**Net Result:** ~145 well-organized files (vs ~80 monolithic files)

**PRD Compliance:** 65% → 85% (+20%)

**Timeline:** 15 days (2 developers)

---

*Last Updated: October 27, 2024*
*Version: 2.0 - Production Refactoring Edition*
