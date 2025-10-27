# SecureReportFlow - 15-Day Production Refactoring Sprint Plan
**Period:** October 26 - November 10, 2024
**Team:** 2 Developers
**Goal:** Production-ready refactoring with PRD compliance, code quality, modularity, and modern best practices

**Strategy:** Copy prototype → Refactor into production folder → Reuse logic, improve structure

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Production Refactoring Strategy](#production-refactoring-strategy)
3. [PRD Compliance Integration](#prd-compliance-integration)
4. [Current State Analysis](#current-state-analysis)
5. [Detailed Daily Breakdown](#detailed-daily-breakdown)
6. [Work Distribution](#work-distribution)
7. [Success Metrics](#success-metrics)
8. [Risk Management](#risk-management)

---

## Production Refactoring Strategy

### **Core Philosophy: "Copy Logic, Improve Structure"**

**What We're Doing:**
1. **Preserve Prototype** - Keep original SecureReportFlow intact as reference
2. **Copy to Production** - Create new production folder from prototype baseline
3. **Reuse 95% of Logic** - Auth, CVSS, DB queries, business rules all work perfectly
4. **Reorganize Structure** - Apply 3-layer architecture, split monolithic files
5. **Add PRD Features** - Integrate missing requirements during refactoring

**What We're NOT Doing:**
- ❌ Rebuilding from scratch
- ❌ Changing working features
- ❌ Rewriting auth/CVSS/exports
- ❌ Modifying database schema

**Benefits:**
- ✅ Ship in 15 days (vs 3-6 months from scratch)
- ✅ Keep all working features
- ✅ Achieve best practice architecture
- ✅ Increase PRD compliance from 65% → 85%
- ✅ Zero risk of losing functionality

---

## PRD Compliance Integration

### **Critical PRD Requirements Added to Refactoring:**

#### **Integrated into Existing Days (No Extra Time):**
1. **Export Checksums** (Day 2) - +1 hour
   - Calculate SHA-256 hash for all PDF exports
   - Store in existing `reportExports.checksum` field

2. **Field-Level Activity Logging** (Day 1-7) - +2 hours spread
   - Enhance ActivityLog to track individual field changes
   - Store old/new values in metadata jsonb

3. **Portal-Based Authentication** (Day 1) - +2 hours
   - Enforce role restrictions by portal type
   - Client portal: customer_admin, project_user only
   - Internal portal: org_admin, researcher, super_admin only

4. **Private Notes** (Day 12) - +1 hour
   - Expose existing `isPrivate` flag in comments UI
   - Customer-only internal notes

5. **Researcher View Policy** (Day 11) - +2 hours
   - Add org setting: allowResearcherViewAllProjects
   - Enforce in project queries

#### **Replaced Features (Trade-offs for PRD Compliance):**

**Day 9: Replace Search Page → Template Engine + Evidence Security**
- **Lost:** Global search page (basic filtering exists)
- **Gained:**
  - Jinja2-style template variables ({{ }}, {% %})
  - Template preview with real data
  - EXIF stripping for images
  - Pre-signed URLs for evidence
  - **PRD Impact:** +15% compliance

**Day 11: Replace Settings Page → Notification System**
- **Lost:** Settings page (profile/password change)
- **Gained:**
  - Email notification service
  - In-app notification center
  - Notification preferences
  - Real-time event notifications
  - **PRD Impact:** +10% compliance

**Result:**
- **Before:** 65% PRD compliance, Search + Settings pages
- **After:** 85% PRD compliance, Template Engine + Notifications
- **Net Gain:** +20% PRD compliance, better product-market fit

### **PRD Features Deferred (Post-15-Day):**
- DOCX template parsing (8-12 hours) - Complex, low MVP priority
- Jira/Slack integrations (12-16 hours) - Separate sprint
- Bulk CSV import (8-10 hours) - Nice-to-have
- AV/malware scanning (6-8 hours) - Security hardening sprint
- Complete field diff UI (6-8 hours) - Enhancement phase

---

## Executive Summary

### Production Refactoring Strategy
**Approach:** Copy prototype to production folder, reuse 95% of working logic, reorganize structure, add PRD compliance features.

### Critical Issues Identified in Prototype
- **Monolithic routes.ts**: 1,584 lines with 45 endpoints
- **No service layer**: Business logic mixed with routes
- **96 duplicate try-catch blocks**: No error handling pattern
- **Frontend bloat**: Components up to 831 lines
- **3 placeholder pages**: Search, Reports, Settings not implemented
- **Security gaps**: Rate limiting only on login, hardcoded tokens
- **PRD compliance**: ~65% (missing template engine, notifications, field versioning, integrations)

### Production Refactoring Goals
✅ Copy prototype to new production folder (preserve prototype)
✅ Split monolithic files into modular structure
✅ Implement 3-layer architecture (Routes → Services → Repositories)
✅ Extract reusable frontend components and hooks
✅ **Implement critical PRD features** (Template engine, Notifications, Export checksums)
✅ **Replace low-priority pages with high-value PRD features**
✅ Apply security hardening across all endpoints
✅ Reduce code duplication by 60%
✅ **Achieve ~85% PRD compliance** (up from 65%)

### Resource Allocation
- **Developer 1 (Backend Specialist)**: 60 hours backend, 15 hours testing, 5 hours PRD features
- **Developer 2 (Frontend Specialist)**: 50 hours frontend, 15 hours PRD features, 15 hours integration

---

## Current State Analysis

### Backend Issues

#### 1. Monolithic Files
| File | Lines | Issue | Target |
|------|-------|-------|--------|
| `server/routes.ts` | 1,584 | 45 endpoints in one file | Split into 8 route modules |
| `server/storage.ts` | 987 | 57 methods in one class | Split into 4 repositories |
| `server/auth.ts` | 447 | Auth + middleware mixed | Separate concerns |

#### 2. Code Duplication
- **96 try-catch blocks** with identical error handling
- **12+ access control checks** duplicated across routes
- **5+ HTML sanitization** calls inline instead of utility
- **14+ validation patterns** repeated without middleware

#### 3. Missing Architecture Layers
```
Current:  Routes → Storage → Database
Target:   Routes → Controllers → Services → Repositories → Database
```

### Frontend Issues

#### 1. Component Bloat
| Component | Lines | Issue | Target |
|-----------|-------|-------|--------|
| `ProjectDetail.tsx` | 831 | Mock data + complex state | 400 lines, remove mocks |
| `Projects.tsx` | 754 | Form + list + filters mixed | 200 lines, split into 4 |
| `RoleManagement.tsx` | 587 | CRUD + dialogs in one | 150 lines, split into 3 |
| `UserManagement.tsx` | 518 | User + role management | 150 lines, split into 3 |

#### 2. Missing Abstractions
- No API client layer (fetch calls scattered)
- No custom hooks for data fetching
- Form logic duplicated across 6+ components
- No centralized form schemas

#### 3. Placeholder Pages
- `/search` - Not implemented
- `/reports` - Not implemented
- `/settings` - Not implemented

### Security Issues
- Rate limiting only on login endpoint
- Hardcoded signup token: `"Q7emI3Z3tOo6b2xc70"`
- No CORS configuration
- No structured logging for audit trail
- No API versioning (`/api/v1/`)

---

## Detailed Daily Breakdown

### **SETUP: Day 0 (Before Day 1)**
**Theme:** Production Folder Setup & Baseline

#### Both Developers - 2 hours
**Setup Tasks:**
- [ ] Create production folder structure:
  ```bash
  cd "C:\OLD D DRIVE"
  cp -r SecureReportFlow SecureReportFlow-Prototype    # Backup
  cp -r SecureReportFlow SecureReportFlow-Production   # Working copy
  ```
- [ ] Initialize Git in production folder
  ```bash
  cd SecureReportFlow-Production
  git init
  git add .
  git commit -m "Initial production baseline from prototype"
  git checkout -b refactor/production-ready
  ```
- [ ] Create new production database
  ```bash
  # Update .env with new database name
  DATABASE_URL=postgresql://...production-db
  npm install
  npm run db:push
  ```
- [ ] Verify prototype still works (don't touch it)
- [ ] Test production baseline works (before refactoring)

**Files to Keep AS-IS (Don't Modify Yet):**
- ✅ `shared/schema.ts` - Database schema is perfect
- ✅ `server/db.ts` - Connection logic works
- ✅ All `client/src/components/ui/*` - Shadcn components
- ✅ `package.json` - Dependencies are good

---

### **Week 1: Foundation & Authentication** (Oct 26 - Nov 1)

---

### **Day 1 (Oct 26) - Saturday**
**Theme:** Database Setup & Portal-Based Authentication

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Database Schema & Authentication Enhancement**
- [ ] **COPY from prototype:** `shared/schema.ts` → already in production folder
- [ ] **COPY from prototype:** `server/auth.ts` → keep existing logic
- [ ] **ENHANCE:** Add portal type validation to login
  ```typescript
  // In server/auth.ts or new server/routes/auth.ts
  // Add portalType to login request body
  // Validate: client portal → customer_admin/project_user only
  // Validate: internal portal → org_admin/researcher/super_admin only
  ```
- [ ] Add `portalType` to session storage
- [ ] Test login with portal restrictions
- [ ] **PRD Enhancement:** Add field-level activity logging structure
  - Update ActivityLog to track field changes
  - Store old/new values in metadata jsonb

**Afternoon (4h): Service Layer Foundation**
- [ ] Create folder structure:
  ```
  server/
  ├── services/
  │   ├── BaseService.ts
  │   └── ProjectService.ts
  ```
- [ ] Implement `BaseService.ts` (50 lines)
  - Constructor with dependency injection
  - Common utility methods
  - Error handling helpers
- [ ] **COPY logic from prototype:** `routes.ts` lines 142-205 (project creation)
- [ ] Create `ProjectService.createProject()` method
- [ ] Add validation and sanitization in service

**Deliverables:**
- ✅ Portal-based authentication working
- ✅ 1 service file created (BaseService)
- ✅ ProjectService with reused logic from prototype
- ✅ Field-level activity logging foundation

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Portal Selection & Login Pages**
- [ ] **COPY from prototype AS-IS:**
  ```
  client/src/pages/Landing.tsx
  client/src/pages/PortalSelection.tsx
  client/src/pages/Login.tsx
  client/src/hooks/useAuth.ts
  client/src/lib/queryClient.ts
  client/src/components/ThemeToggle.tsx
  client/src/components/ui/* (all Shadcn components)
  ```
- [ ] **ENHANCE:** Modify `Login.tsx` to send `portalType` in login request
  ```typescript
  // Line 36 - add portalType to request body
  const response = await apiRequest("POST", "/api/login", {
    ...data,
    portalType
  });
  ```
- [ ] Test full login flow:
  - Portal selection works
  - Client portal login enforces correct roles
  - Internal portal login enforces correct roles
  - Wrong role shows proper error

**Afternoon (4h): Dashboard Foundation & Navigation**
- [ ] **COPY from prototype:** `client/src/pages/Dashboard.tsx`
- [ ] **SIMPLIFY:** Remove mock data, keep only:
  - Welcome message
  - Basic stats (projects, findings count)
  - Recent activity list
- [ ] **COPY & MODIFY:** `client/src/components/AppSidebar.tsx`
- [ ] **SPLIT navigation by portal type:**
  - Client portal menu: Dashboard, My Projects, Logout
  - Internal portal menu: Dashboard, All Projects, Findings, Users, Roles, Templates, Reports, Logout
- [ ] Test navigation works for both portal types

**Deliverables:**
- ✅ Portal selection + login working with role enforcement
- ✅ Client dashboard (simplified)
- ✅ Internal dashboard (simplified)
- ✅ Role-based sidebar navigation

---

### **Day 2 (Oct 27) - Sunday**
**Theme:** Service Layer Completion & API Client Foundation

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Finding & User Services**
- [ ] Create `FindingService.ts` (120 lines)
- [ ] **COPY logic from prototype:** `routes.ts` lines 259-360 (finding CRUD)
- [ ] Implement `createFinding()`, `updateFinding()` with validation
- [ ] **COPY CVSS calculation logic** from prototype AS-IS
- [ ] Create `UserService.ts` (100 lines)
- [ ] **COPY logic from prototype:** `routes.ts` lines 950-1020 (user creation)
- [ ] Keep password hashing logic from prototype

**Afternoon (4h): Template & Export Services**
- [ ] Create `TemplateService.ts` (80 lines)
- [ ] **COPY logic from prototype:** `routes.ts` lines 1289-1440 (template CRUD)
- [ ] Create `ExportService.ts` (100 lines)
- [ ] **COPY PDF generation logic from prototype:** `routes.ts` lines 709-786
- [ ] **PRD Enhancement:** Add SHA-256 checksum calculation for exports
  ```typescript
  // Calculate checksum after PDF generation
  const checksum = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  // Store in reportExports.checksum field
  ```
- [ ] Keep Puppeteer logic from prototype (it works!)

**Deliverables:**
- ✅ 4 service files created (Finding, User, Template, Export)
- ✅ ~500 lines of working logic reused from prototype
- ✅ Export checksums implemented (PRD requirement)
- ✅ All major business logic in services

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): API Client Layer**
- [ ] Create folder structure:
  ```
  client/src/lib/api/
  ├── index.ts
  ├── baseApi.ts
  ├── projectApi.ts
  ├── findingApi.ts
  └── userApi.ts
  ```
- [ ] **COPY & ENHANCE:** `queryClient.ts` from prototype
- [ ] Create `baseApi.ts` with standard fetch wrapper
- [ ] Create `projectApi.ts` - **copy endpoint URLs from prototype**
- [ ] Create `findingApi.ts` - **copy endpoint URLs from prototype**
- [ ] Create `userApi.ts` - **copy endpoint URLs from prototype**

**Afternoon (4h): Custom Data Hooks**
- [ ] Create folder: `client/src/hooks/data/`
- [ ] Create `useProjects.ts` (30 lines)
  - **Reference prototype** for data fetching patterns
  - List, create, update, delete with React Query
- [ ] Create `useFindings.ts` (30 lines)
  - Similar pattern to projects
- [ ] Create `useUsers.ts` (30 lines)
- [ ] Create `useRoles.ts` (30 lines)
- [ ] **PRD Enhancement:** Add `useNotifications.ts` (30 lines) for future use

**Deliverables:**
- ✅ API client layer with all endpoints
- ✅ 5 custom data hooks
- ✅ Centralized API error handling
- ✅ Type-safe API calls

---

### **Day 3 (Oct 28) - Monday**
**Theme:** Middleware Layer

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Error Handling Middleware**
- [ ] Create `server/middleware/errorHandler.ts` (100 lines)
- [ ] Create `AppError` class with error codes
- [ ] Implement global error handler middleware
- [ ] Create error response standardization
- [ ] Add structured error logging

**Afternoon (4h): Validation Middleware**
- [ ] Create `server/middleware/validation.ts` (80 lines)
- [ ] Create `validateBody()` middleware factory
- [ ] Create `validateParams()` middleware
- [ ] Create `validateQuery()` middleware
- [ ] Add Zod schema validation helpers

**Deliverables:**
- ✅ 2 middleware files created
- ✅ Standard error handling pattern
- ✅ Reusable validation middleware

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Form Schemas Consolidation**
- [ ] Create `client/src/lib/formSchemas.ts` (100 lines)
- [ ] Extract all Zod schemas from components:
  - `createProjectSchema`
  - `createUserSchema`
  - `createRoleSchema`
  - `createFindingSchema`
  - `createTemplateSchema`
- [ ] Add shared validation rules

**Afternoon (4h): Form State Hook**
- [ ] Create `useFormState.ts` (50 lines)
- [ ] Handle dialog open/close state
- [ ] Handle form submission state
- [ ] Handle success/error toast notifications
- [ ] Update 2-3 components to use new hook

**Deliverables:**
- ✅ Centralized form schemas
- ✅ Reusable form state management
- ✅ Reduced form logic duplication

---

### **Day 4 (Oct 29) - Tuesday**
**Theme:** Middleware Completion & Component Splitting

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Logging & Rate Limiting**
- [ ] Create `server/middleware/logging.ts` (100 lines)
- [ ] Implement structured JSON logging
- [ ] Add request/response logging
- [ ] Create `server/middleware/rateLimiter.ts` (150 lines)
- [ ] Extend rate limiting to all sensitive endpoints:
  - POST `/api/users` (user creation)
  - POST `/api/invitations` (invitations)
  - POST `/api/projects/:id/export-report` (PDF generation)
  - POST `/api/users/:id/reset-password` (password reset)

**Afternoon (4h): Security Middleware**
- [ ] Create `server/middleware/security.ts` (80 lines)
- [ ] Add CORS middleware with proper configuration
- [ ] Add security headers (CSP, HSTS, X-Frame-Options)
- [ ] Move hardcoded token to environment variable
- [ ] Create `server/middleware/audit.ts` (80 lines)
- [ ] Add audit logging for sensitive operations

**Deliverables:**
- ✅ 4 middleware files completed
- ✅ Rate limiting on 5+ endpoints
- ✅ Security headers applied
- ✅ Audit logging implemented

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Split Projects Component**
- [ ] Create `client/src/components/projects/` folder
- [ ] Split `Projects.tsx` (754 lines) into:
  - `Projects.tsx` (200 lines) - Main page container
  - `ProjectsList.tsx` (200 lines) - Project cards/table
  - `ProjectForm.tsx` (200 lines) - Create/edit form
  - `ProjectFilters.tsx` (154 lines) - Filter controls

**Afternoon (4h): Split UserManagement Component**
- [ ] Create `client/src/components/users/` folder
- [ ] Split `UserManagement.tsx` (518 lines) into:
  - `UserManagement.tsx` (150 lines) - Main container
  - `UserList.tsx` (200 lines) - User table
  - `UserForm.tsx` (168 lines) - Create/edit dialog
- [ ] Test all user operations still work

**Deliverables:**
- ✅ Projects component modularized
- ✅ UserManagement component modularized
- ✅ 7 new focused components created

---

### **Day 5 (Oct 30) - Wednesday**
**Theme:** Repository Pattern & Component Splitting Continued

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Base Repository**
- [ ] Create `server/repositories/` folder
- [ ] Create `BaseRepository.ts` (50 lines)
  - Generic CRUD methods
  - Transaction support
  - Query builder helpers
- [ ] Create `ProjectRepository.ts` (80 lines)
- [ ] Move project database queries from storage.ts

**Afternoon (4h): Additional Repositories**
- [ ] Create `FindingRepository.ts` (80 lines)
- [ ] Create `UserRepository.ts` (80 lines)
- [ ] Update services to use repositories instead of storage
- [ ] Test all operations still work

**Deliverables:**
- ✅ 4 repository files created
- ✅ Repository pattern implemented
- ✅ ~250 lines moved from storage.ts

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Split RoleManagement Component**
- [ ] Create `client/src/components/roles/` folder
- [ ] Split `RoleManagement.tsx` (587 lines) into:
  - `RoleManagement.tsx` (150 lines) - Main container
  - `RoleList.tsx` (200 lines) - Roles table
  - `RoleForm.tsx` (237 lines) - Role creation/editing

**Afternoon (4h): Split Findings Components**
- [ ] Create `client/src/components/findings/` folder
- [ ] Split `MyFindings.tsx` (276 lines) into:
  - `MyFindings.tsx` (150 lines) - Main container
  - `FindingsList.tsx` (180 lines) - Findings table
  - `FindingStatusBadge.tsx` (50 lines) - Status display
- [ ] Update `FindingDetail.tsx` to remove mock data (831 → 400 lines)

**Deliverables:**
- ✅ RoleManagement modularized
- ✅ Findings components split
- ✅ Mock data removed from FindingDetail

---

### **Week 2: Route Refactoring & Frontend Features** (Nov 2 - 8)

---

### **Day 6 (Oct 31) - Thursday**
**Theme:** Route Splitting Begins

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Split Routes - Part 1**
- [ ] Create `server/routes/` folder
- [ ] Create `projects.ts` (200 lines)
  - Move project routes from routes.ts (lines 109-205)
  - Use ProjectService for all operations
  - Apply validation middleware
  - Apply error handling middleware
- [ ] Create `findings.ts` (200 lines)
  - Move finding routes (lines 208-400)
  - Use FindingService

**Afternoon (4h): Split Routes - Part 2**
- [ ] Create `users.ts` (200 lines)
  - Move user routes (lines 950-1100)
  - Use UserService
- [ ] Create `roles.ts` (150 lines)
  - Move role routes (lines 790-940)
  - Apply permission middleware

**Deliverables:**
- ✅ 4 route modules created
- ✅ ~750 lines moved from routes.ts
- ✅ Services integrated with routes

#### Developer 2 (Frontend) - 8 hours
**Full Day: Dashboard Refactoring**
- [ ] Remove mock data from `Dashboard.tsx`
- [ ] Implement real statistics queries:
  - Total projects count
  - Total findings count
  - Findings by severity breakdown
  - Recent activity feed
- [ ] Create `StatCard.tsx` component (50 lines)
- [ ] Create `ActivityFeed.tsx` component (80 lines)
- [ ] Add loading states and error handling
- [ ] Reduce Dashboard.tsx from 273 → 150 lines

**Deliverables:**
- ✅ Dashboard with real data
- ✅ 2 new reusable components
- ✅ Improved user experience

---

### **Day 7 (Nov 1) - Friday**
**Theme:** Route Splitting Completion

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Split Routes - Part 3**
- [ ] Create `templates.ts` (100 lines)
  - Move template routes (lines 1289-1440)
  - Use TemplateService
- [ ] Create `exports.ts` (150 lines)
  - Move export routes (lines 690-786)
  - Use ExportService
  - Apply rate limiting to PDF generation

**Afternoon (4h): Split Routes - Part 4**
- [ ] Create `invitations.ts` (100 lines)
  - Move invitation routes (lines 1440-1580)
- [ ] Create `bootstrap.ts` (80 lines)
  - Move bootstrap routes (lines 49-107)
- [ ] Update `server/routes.ts` to import all route modules
- [ ] Delete old monolithic routes.ts

**Deliverables:**
- ✅ All 8 route modules created
- ✅ Monolithic routes.ts eliminated
- ✅ 1,584 lines reorganized into modules

#### Developer 2 (Frontend) - 8 hours
**Full Day: ProjectDetail Refactoring**
- [ ] Remove all mock data from `ProjectDetail.tsx` (831 lines)
- [ ] Implement real data fetching:
  - Project details
  - Team members
  - Credentials
  - Postman collections
  - Activity timeline
- [ ] Create sub-components:
  - `ProjectTeam.tsx` (80 lines)
  - `ProjectCredentials.tsx` (100 lines)
  - `ProjectCollections.tsx` (80 lines)
- [ ] Reduce ProjectDetail.tsx to ~400 lines

**Deliverables:**
- ✅ ProjectDetail with real data
- ✅ 3 new sub-components
- ✅ Better code organization

---

### **Day 8 (Nov 2) - Saturday**
**Theme:** Testing & Code Review

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Integration Testing**
- [ ] Test all refactored routes:
  - Projects CRUD
  - Findings CRUD
  - Users CRUD
  - Roles CRUD
  - Templates CRUD
- [ ] Fix any bugs discovered
- [ ] Ensure error handling works correctly

**Afternoon (4h): Code Review & Optimization**
- [ ] Review all service files
- [ ] Review all middleware files
- [ ] Review all repository files
- [ ] Optimize database queries
- [ ] Add missing error cases

**Deliverables:**
- ✅ All routes tested and working
- ✅ Bugs fixed
- ✅ Code quality improved

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Component Testing**
- [ ] Test all split components:
  - Projects page
  - UserManagement page
  - RoleManagement page
  - Dashboard
  - ProjectDetail
- [ ] Fix styling issues
- [ ] Ensure all forms work

**Afternoon (4h): Code Review**
- [ ] Review all API client files
- [ ] Review all custom hooks
- [ ] Review all new components
- [ ] Ensure consistent patterns
- [ ] Fix TypeScript errors

**Deliverables:**
- ✅ All components tested
- ✅ Styling consistent
- ✅ No TypeScript errors

---

### **Week 3: Missing Features & Polish** (Nov 3 - 10)

---

### **Day 9 (Nov 3) - Sunday**
**Theme:** 🎯 PRD PRIORITY - Template Engine & Evidence Security

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Template Engine with Variables**
- [ ] Install `nunjucks` or `handlebars` for template processing
  ```bash
  npm install nunjucks @types/nunjucks
  ```
- [ ] **ENHANCE** `TemplateService.ts` with template rendering:
  ```typescript
  // Add methods:
  - renderTemplate(templateId, projectId) → HTML with variables replaced
  - parseTemplateVariables(templateContent) → list of used variables
  - previewTemplate(templateId, projectId) → preview with real data
  ```
- [ ] Support PRD-required template syntax:
  - Variables: `{{ project.name }}`, `{{ findings | length }}`
  - Loops: `{% for f in findings %} ... {% endfor %}`
  - Conditionals: `{% if findings|count > 0 %} ... {% endif %}`
  - Filters: `{{ findings | by_severity('Critical') }}`
- [ ] Create template helper functions for common patterns
- [ ] Add template validation (check for unknown variables)

**Afternoon (4h): Evidence Security Enhancements**
- [ ] **ENHANCE** evidence upload endpoint with EXIF stripping:
  ```bash
  npm install sharp  # For image processing
  ```
- [ ] Add EXIF data removal for images (JPG, PNG)
  ```typescript
  // In evidence upload handler
  if (isImage(file)) {
    const strippedBuffer = await sharp(file.buffer)
      .rotate() // Auto-rotate based on EXIF
      .withMetadata({ exif: {} }) // Strip EXIF
      .toBuffer();
  }
  ```
- [ ] Implement pre-signed URL generation for evidence access
  ```typescript
  // Generate temporary signed URLs (1 hour expiry)
  - GET /api/evidence/:id/url → returns signed URL
  - Verify user has access before generating URL
  ```
- [ ] Update evidence storage to use private S3/local storage

**Deliverables:**
- ✅ Template engine with Jinja2-style syntax (PRD requirement)
- ✅ Template preview with real project data (PRD requirement)
- ✅ EXIF stripping for security (PRD requirement)
- ✅ Pre-signed URLs for evidence (PRD requirement)
- ✅ +15% PRD compliance

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Template Preview UI**
- [ ] **ENHANCE** existing Template Manager page
- [ ] Add "Preview Template" button to template list
- [ ] Create `TemplatePreview.tsx` component (150 lines):
  - Select project for preview data
  - Live preview pane showing rendered HTML
  - Variable browser showing available variables
  - Split view: template source | rendered output
- [ ] Create `TemplateVariableBrowser.tsx` (80 lines):
  - Tree view of available variables
  - Click to insert into template
  - Examples: `{{ project.* }}`, `{{ findings.* }}`

**Afternoon (4h): Template Editor Enhancement**
- [ ] Add syntax highlighting for template code
- [ ] Add autocomplete for template variables
- [ ] Create template variable documentation panel
- [ ] Add "Insert Variable" dropdown
- [ ] Test template rendering with real project data
- [ ] Add validation errors display (unknown variables)

**Deliverables:**
- ✅ Template preview with real data
- ✅ Variable browser and documentation
- ✅ Enhanced template editor
- ✅ Professional template authoring experience

---

### **Day 10 (Nov 4) - Monday**
**Theme:** Reports Feature Implementation

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Reports API Enhancement**
- [ ] Review existing report export logic
- [ ] Add report templates management:
  - GET `/api/report-templates`
  - POST `/api/report-templates` (custom templates)
- [ ] Add report history:
  - GET `/api/reports/history`
  - GET `/api/reports/:id/download`

**Afternoon (4h): Report Generation Optimization**
- [ ] Optimize Puppeteer PDF generation
- [ ] Add report preview endpoint
- [ ] Add report scheduling (future feature foundation)
- [ ] Improve error handling in PDF generation

**Deliverables:**
- ✅ Enhanced report API
- ✅ Better PDF generation
- ✅ Report history tracking

#### Developer 2 (Frontend) - 8 hours
**Full Day: Reports Page**
- [ ] Create `client/src/pages/Reports.tsx` (250 lines)
- [ ] Implement reports UI:
  - Report generation wizard
  - Template selection
  - Report history table
  - Download/preview buttons
  - Status tracking (generating, completed, failed)
- [ ] Create `ReportWizard.tsx` component (150 lines)
- [ ] Create `ReportHistory.tsx` component (100 lines)
- [ ] Update `App.tsx` to remove placeholder

**Deliverables:**
- ✅ Reports page fully functional
- ✅ No more placeholder page
- ✅ Report generation UI complete

---

### **Day 11 (Nov 5) - Tuesday**
**Theme:** 🎯 PRD PRIORITY - Notification System & Security Hardening

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Email Notification Service**
- [ ] Install email service dependency:
  ```bash
  npm install nodemailer @types/nodemailer
  # OR use SendGrid: npm install @sendgrid/mail
  ```
- [ ] Create `NotificationService.ts` (150 lines)
  ```typescript
  // Methods:
  - sendEmail(to, subject, htmlContent)
  - sendFindingNotification(findingId, eventType, recipientIds)
  - sendMentionNotification(commentId, mentionedUserIds)
  - sendStatusChangeNotification(findingId, oldStatus, newStatus, watchers)
  - sendAssignmentNotification(findingId, assigneeId)
  ```
- [ ] Create email templates:
  ```
  server/templates/emails/
  ├── finding-created.html
  ├── finding-status-changed.html
  ├── finding-assigned.html
  ├── mention-notification.html
  └── export-complete.html
  ```
- [ ] Add notification preferences to user settings:
  - Store in `users.settings` jsonb field
  - Default: all notifications enabled

**Afternoon (4h): In-App Notifications & Security**
- [ ] Add notifications table to schema (if not exists):
  ```typescript
  // shared/schema.ts
  export const notifications = pgTable("notifications", {
    id, userId, title, message, type,
    isRead, relatedEntityType, relatedEntityId, createdAt
  });
  ```
- [ ] Run migration: `npm run db:push`
- [ ] Create notification routes:
  - GET `/api/notifications` - List user's notifications
  - PUT `/api/notifications/:id/read` - Mark as read
  - PUT `/api/notifications/mark-all-read` - Mark all as read
- [ ] **PRD Enhancement:** Researcher view policy
  - Add `allowResearcherViewAllProjects` to organization settings
  - Enforce in project query filters
- [ ] **Security Hardening:**
  - Add API versioning: `/api/v1/` (prefix all routes)
  - Add CORS whitelist from environment
  - Add helmet.js for security headers
  - Review all authentication flows

**Deliverables:**
- ✅ Email notification service working (PRD requirement)
- ✅ In-app notifications database & API (PRD requirement)
- ✅ Notification preferences system
- ✅ Researcher view policy (PRD requirement)
- ✅ API versioning & security hardening
- ✅ +10% PRD compliance

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Notification Bell UI**
- [ ] Create `NotificationBell.tsx` component (100 lines)
  - Bell icon in top nav with unread count badge
  - Dropdown showing recent notifications
  - "Mark all as read" button
  - Click notification → navigate to related entity
  - Real-time polling (every 30s) or WebSocket (future)
- [ ] Create `useNotifications.ts` hook (60 lines)
  - Fetch notifications with React Query
  - Mark as read mutation
  - Unread count query
  - Auto-refresh logic
- [ ] Add notification bell to `AppSidebar.tsx` header
- [ ] Test notification flow:
  - Create finding → notification appears
  - Mention user → they get notification
  - Status change → watchers notified

**Afternoon (4h): Notification Center Page & Settings**
- [ ] Create `client/src/pages/Notifications.tsx` (150 lines)
  - Full list of all notifications (paginated)
  - Filter by type (mentions, assignments, status changes)
  - Mark individual as read
  - Clear all notifications option
- [ ] Create `NotificationPreferences.tsx` component (120 lines)
  - Toggle email notifications per event type:
    - [ ] Finding assigned to me
    - [ ] Mentioned in comment
    - [ ] Finding status changed
    - [ ] Export completed
    - [ ] Project invitation
  - Toggle in-app notifications
  - Save preferences button
- [ ] Add "Notifications" to sidebar navigation
- [ ] **PRD Enhancement:** Private notes UI
  - Add `isPrivate` checkbox to comment form
  - Show lock icon on private comments
  - Filter private comments for client users

**Deliverables:**
- ✅ Notification bell with unread count
- ✅ Notification center page
- ✅ Email notification preferences
- ✅ Private notes UI (PRD requirement)
- ✅ Professional notification experience

---

### **Day 12 (Nov 6) - Wednesday**
**Theme:** Error Handling Standardization

#### Developer 1 (Backend) - 8 hours
**Full Day: Error Handling Cleanup**
- [ ] Replace all `res.status().json()` with error middleware
- [ ] Update all services to throw typed errors:
  ```typescript
  throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
  ```
- [ ] Create error code constants file
- [ ] Update all route handlers to use `next(error)`
- [ ] Test error handling across all endpoints
- [ ] Create error documentation

**Files to update:**
- [ ] All route files (8 files)
- [ ] All service files (7 files)
- [ ] Error handler middleware

**Deliverables:**
- ✅ Consistent error handling
- ✅ Typed error responses
- ✅ Error codes documented

#### Developer 2 (Frontend) - 8 hours
**Full Day: Error Handling & Toast Notifications**
- [ ] Create `ErrorBoundary.tsx` component (80 lines)
- [ ] Wrap app with error boundary
- [ ] Standardize toast notifications:
  - Success toasts (green)
  - Error toasts (red)
  - Warning toasts (yellow)
  - Info toasts (blue)
- [ ] Update all mutations to use consistent error handling
- [ ] Create `useErrorHandler.ts` hook (50 lines)
- [ ] Map backend error codes to user-friendly messages

**Files to update:**
- [ ] All page components (15+ files)
- [ ] All custom hooks (5 files)

**Deliverables:**
- ✅ Error boundary implemented
- ✅ Consistent error messages
- ✅ Better user experience

---

### **Day 13 (Nov 7) - Thursday**
**Theme:** Performance Optimization & Caching

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Database Optimization**
- [ ] Review all database queries
- [ ] Add indexes to frequently queried columns:
  - `findings.projectId`
  - `findings.severity`
  - `findings.status`
  - `projects.organizationId`
  - `users.email`
- [ ] Optimize N+1 query issues
- [ ] Add database query logging

**Afternoon (4h): Caching Strategy**
- [ ] Install `node-cache` or Redis client
- [ ] Add caching to:
  - User permissions (already has memoization)
  - Project lists (5 minute TTL)
  - Role permissions (10 minute TTL)
- [ ] Implement cache invalidation on updates
- [ ] Add cache hit/miss logging

**Deliverables:**
- ✅ Database indexes added
- ✅ Caching implemented
- ✅ Query performance improved

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Performance Optimization**
- [ ] Add React.memo to heavy components:
  - FindingCard
  - ProjectCard
  - Table rows
- [ ] Implement virtual scrolling for long lists
- [ ] Add pagination to findings list
- [ ] Optimize image loading (lazy loading)
- [ ] Add loading skeletons

**Afternoon (4h): Bundle Optimization**
- [ ] Analyze bundle size with `vite-bundle-visualizer`
- [ ] Implement code splitting for heavy pages
- [ ] Lazy load heavy components:
  - RichTextEditor
  - CVSSCalculator
- [ ] Remove unused dependencies
- [ ] Optimize imports

**Deliverables:**
- ✅ Component performance improved
- ✅ Bundle size reduced
- ✅ Faster page loads

---

### **Day 14 (Nov 8) - Friday**
**Theme:** Testing & Documentation

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Integration Testing**
- [ ] Install testing framework (Vitest or Jest)
- [ ] Write integration tests for critical flows:
  - User signup/login
  - Project creation
  - Finding creation
  - Report generation
  - Role assignment
- [ ] Test error handling
- [ ] Test rate limiting

**Afternoon (4h): Documentation**
- [ ] Create `ARCHITECTURE.md`:
  - System architecture diagram
  - Layer descriptions
  - Data flow
- [ ] Create `API.md`:
  - All API endpoints documented
  - Request/response examples
  - Error codes
- [ ] Update README.md with:
  - Setup instructions
  - Environment variables
  - Running tests

**Deliverables:**
- ✅ Critical paths tested
- ✅ Architecture documented
- ✅ API documented

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Component Testing**
- [ ] Install testing library (@testing-library/react)
- [ ] Write tests for critical components:
  - Login form
  - Project creation form
  - Finding creation form
  - Role assignment
- [ ] Test custom hooks:
  - useProjects
  - useFindings
  - useAuth

**Afternoon (4h): Documentation**
- [ ] Create `COMPONENTS.md`:
  - Component hierarchy
  - Props documentation
  - Usage examples
- [ ] Create `CONTRIBUTING.md`:
  - Code style guide
  - Component patterns
  - State management patterns
- [ ] Add JSDoc comments to key functions

**Deliverables:**
- ✅ Component tests written
- ✅ Frontend documented
- ✅ Contribution guide created

---

### **Day 15 (Nov 9) - Saturday**
**Theme:** Final Review & Polish

#### Developer 1 (Backend) - 8 hours
**Morning (4h): Code Review**
- [ ] Review all backend code:
  - Services (7 files)
  - Repositories (4 files)
  - Middleware (6 files)
  - Routes (8 files)
- [ ] Check for:
  - Consistent error handling
  - Proper validation
  - Security issues
  - Performance issues
- [ ] Run linter and fix issues

**Afternoon (4h): Final Cleanup**
- [ ] Remove unused code
- [ ] Remove console.log statements
- [ ] Update dependencies to latest versions
- [ ] Run security audit (`npm audit`)
- [ ] Fix any critical vulnerabilities
- [ ] Create production build and test

**Deliverables:**
- ✅ Code reviewed and cleaned
- ✅ Security issues resolved
- ✅ Production-ready backend

#### Developer 2 (Frontend) - 8 hours
**Morning (4h): Code Review**
- [ ] Review all frontend code:
  - Pages (15 files)
  - Components (30+ files)
  - Hooks (10 files)
  - API clients (5 files)
- [ ] Check for:
  - Consistent patterns
  - Accessibility issues
  - Performance issues
  - TypeScript errors
- [ ] Run linter and fix issues

**Afternoon (4h): Final Polish**
- [ ] Fix any UI inconsistencies
- [ ] Test all user flows end-to-end
- [ ] Check mobile responsiveness
- [ ] Update dependencies
- [ ] Run security audit
- [ ] Create production build and test

**Deliverables:**
- ✅ Code reviewed and polished
- ✅ All features tested
- ✅ Production-ready frontend

---

### **Day 16 (Nov 10) - Sunday - DEADLINE**
**Theme:** Final Testing & Deployment

#### Both Developers - 4 hours each

**Morning (2h): Final Testing**
- [ ] Developer 1: Backend smoke tests
  - Test all API endpoints
  - Test authentication
  - Test permissions
  - Test rate limiting
- [ ] Developer 2: Frontend smoke tests
  - Test all pages
  - Test all forms
  - Test all workflows

**Afternoon (2h): Deployment & Handoff**
- [ ] Create deployment checklist
- [ ] Deploy to staging environment
- [ ] Run final tests on staging
- [ ] Create deployment documentation
- [ ] Prepare handoff documentation
- [ ] DONE! 🎉

**Deliverables:**
- ✅ Application deployed
- ✅ All features working
- ✅ Documentation complete
- ✅ Ready for production

---

## Work Distribution Summary

### Developer 1 (Backend Specialist) - Total: 116 hours

| Task Category | Hours | Days |
|--------------|-------|------|
| Service layer creation | 16 | 1-2 |
| Middleware development | 16 | 3-4 |
| Repository pattern | 8 | 5 |
| Route splitting | 16 | 6-7 |
| Testing & review | 8 | 8 |
| Search API | 8 | 9 |
| Reports API | 8 | 10 |
| Settings & security | 8 | 11 |
| Error handling | 8 | 12 |
| Performance & caching | 8 | 13 |
| Testing & docs | 8 | 14 |
| Final review | 8 | 15 |
| Deployment | 4 | 16 |

**Primary Responsibilities:**
- ✅ Break down monolithic routes.ts (1,584 lines)
- ✅ Implement service layer (7 services)
- ✅ Create middleware layer (6 middleware files)
- ✅ Implement repository pattern (4 repositories)
- ✅ Split routes into modules (8 route files)
- ✅ Implement missing APIs (Search, Reports, Settings)
- ✅ Security hardening
- ✅ Performance optimization

### Developer 2 (Frontend Specialist) - Total: 116 hours

| Task Category | Hours | Days |
|--------------|-------|------|
| API client layer | 16 | 1-2 |
| Custom hooks | 16 | 2-3 |
| Form consolidation | 8 | 3 |
| Component splitting | 24 | 4-5, 7 |
| Dashboard refactor | 8 | 6 |
| Search page | 8 | 9 |
| Reports page | 8 | 10 |
| Settings page | 8 | 11 |
| Error handling | 8 | 12 |
| Performance | 8 | 13 |
| Testing & docs | 8 | 14 |
| Final review | 8 | 15 |
| Deployment | 4 | 16 |

**Primary Responsibilities:**
- ✅ Create API client layer (5 API files)
- ✅ Extract custom hooks (5+ hooks)
- ✅ Split large components (7 components split into 20+)
- ✅ Implement missing pages (Search, Reports, Settings)
- ✅ Remove all mock data
- ✅ Consolidate form schemas
- ✅ Performance optimization
- ✅ Component testing

---

## Success Metrics

### Code Quality Metrics
- [ ] **Line count reduction**: 1,584 lines routes.ts → 8 files ~200 lines each
- [ ] **Code duplication**: Reduce 96 try-catch blocks → 1 error middleware
- [ ] **Component size**: Reduce average component size by 50%
- [ ] **Type coverage**: 100% TypeScript coverage (no `any` types)

### Feature Completion
- [ ] **Placeholder pages**: 3 → 0 (all implemented)
- [ ] **TODO comments**: Remove all TODOs
- [ ] **Mock data**: Remove all mock data from components

### Architecture
- [ ] **Service layer**: 7 services created
- [ ] **Middleware**: 6 middleware files created
- [ ] **Repository pattern**: 4 repositories created
- [ ] **Route modules**: 8 route files created

### Security
- [ ] **Rate limiting**: 5+ endpoints protected
- [ ] **API versioning**: `/api/v1/` implemented
- [ ] **Security headers**: All headers applied
- [ ] **Audit logging**: Sensitive operations logged

### Testing
- [ ] **Backend tests**: 10+ integration tests
- [ ] **Frontend tests**: 10+ component tests
- [ ] **Test coverage**: 50%+ critical paths

### Performance
- [ ] **Database indexes**: 5+ indexes added
- [ ] **Caching**: 3+ cached queries
- [ ] **Bundle size**: Reduce by 20%
- [ ] **Page load**: Improve by 30%

---

## Risk Management

### High-Risk Areas

#### 1. Breaking Changes in Route Refactoring
**Risk Level:** HIGH
**Impact:** Application stops working
**Mitigation:**
- Create feature branch for all changes
- Test each route after refactoring
- Keep old routes.ts until all routes tested
- Use Git tags before major changes

#### 2. Data Migration Issues
**Risk Level:** MEDIUM
**Impact:** Data loss or corruption
**Mitigation:**
- Backup database before Day 1
- No database schema changes planned
- Test with production data clone
- Have rollback plan ready

#### 3. Performance Regression
**Risk Level:** MEDIUM
**Impact:** Slower application
**Mitigation:**
- Benchmark before refactoring
- Monitor query performance
- Load test after caching implemented
- Rollback if degradation > 20%

#### 4. User-Facing Bugs
**Risk Level:** MEDIUM
**Impact:** Bad user experience
**Mitigation:**
- Thorough testing on Day 8, 14, 15
- QA checklist for all features
- Bug tracking spreadsheet
- Quick-fix time buffer built in

#### 5. Time Overrun
**Risk Level:** MEDIUM
**Impact:** Missing deadline
**Mitigation:**
- Daily standups at 9 AM
- Track actual vs estimated hours
- Prioritize MVP features first
- Buffer day built into schedule (Day 16)

### Risk Response Plan

| If This Happens | Do This |
|-----------------|---------|
| Critical bug found on Day 14 | Skip Day 15 polish, focus on fixing |
| 1 developer unavailable 1 day | Other developer picks up critical tasks |
| Feature taking 2x expected time | Cut scope, move to "nice-to-have" list |
| Major refactor breaks everything | Revert to last Git tag, restart module |
| Performance drops > 30% | Rollback caching, investigate queries |

---

## Daily Standup Template

**Time:** 9:00 AM daily
**Duration:** 15 minutes

### Format:
1. **Developer 1 Reports:**
   - ✅ Completed yesterday
   - 🎯 Working on today
   - ⚠️ Blockers/concerns

2. **Developer 2 Reports:**
   - ✅ Completed yesterday
   - 🎯 Working on today
   - ⚠️ Blockers/concerns

3. **Quick Discussion:**
   - Integration points
   - Dependencies
   - Risks

### Communication Channels:
- **Urgent issues:** Phone/SMS
- **Quick questions:** Slack/Discord
- **Code reviews:** GitHub Pull Requests
- **Documentation:** Shared Google Doc

---

## Definition of Done

### For Each Task:
- [ ] Code written and tested
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Code committed to Git
- [ ] Pull request created (if applicable)

### For Each Day:
- [ ] All tasks completed or moved to next day
- [ ] Code pushed to repository
- [ ] Standup notes documented
- [ ] Tomorrow's tasks prepared

### For Sprint Completion (Nov 10):
- [ ] All success metrics met
- [ ] All placeholder pages removed
- [ ] All TODOs removed
- [ ] All mock data removed
- [ ] Documentation complete
- [ ] Tests passing
- [ ] Production build successful
- [ ] Deployed to staging
- [ ] Client approval received

---

## Appendix A: File Structure (After Refactoring)

```
SecureReportFlow/
├── server/
│   ├── services/              [NEW - 7 files]
│   │   ├── BaseService.ts
│   │   ├── ProjectService.ts
│   │   ├── FindingService.ts
│   │   ├── UserService.ts
│   │   ├── TemplateService.ts
│   │   ├── ExportService.ts
│   │   ├── AuthService.ts
│   │   └── SearchService.ts
│   ├── repositories/          [NEW - 4 files]
│   │   ├── BaseRepository.ts
│   │   ├── ProjectRepository.ts
│   │   ├── FindingRepository.ts
│   │   └── UserRepository.ts
│   ├── middleware/            [NEW - 6 files]
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   ├── logging.ts
│   │   ├── rateLimiter.ts
│   │   ├── security.ts
│   │   └── audit.ts
│   ├── routes/                [NEW - 9 files, replaces routes.ts]
│   │   ├── index.ts
│   │   ├── projects.ts
│   │   ├── findings.ts
│   │   ├── users.ts
│   │   ├── roles.ts
│   │   ├── templates.ts
│   │   ├── exports.ts
│   │   ├── invitations.ts
│   │   ├── bootstrap.ts
│   │   └── search.ts
│   ├── types/                 [NEW - 3 files]
│   │   ├── errors.ts
│   │   ├── responses.ts
│   │   └── services.ts
│   ├── utils/                 [NEW - 3 files]
│   │   ├── sanitizer.ts
│   │   ├── validators.ts
│   │   └── logger.ts
│   ├── auth.ts               [REFACTORED]
│   ├── storage.ts            [REFACTORED - reduced from 987 lines]
│   ├── db.ts
│   ├── vite.ts
│   └── index.ts              [REFACTORED - middleware chain]
├── client/
│   └── src/
│       ├── lib/
│       │   ├── api/           [NEW - 6 files]
│       │   │   ├── index.ts
│       │   │   ├── baseApi.ts
│       │   │   ├── projectApi.ts
│       │   │   ├── findingApi.ts
│       │   │   ├── userApi.ts
│       │   │   ├── roleApi.ts
│       │   │   └── templateApi.ts
│       │   ├── formSchemas.ts [NEW]
│       │   └── queryClient.ts
│       ├── hooks/
│       │   ├── data/          [NEW - 5 files]
│       │   │   ├── useProjects.ts
│       │   │   ├── useFindings.ts
│       │   │   ├── useUsers.ts
│       │   │   ├── useRoles.ts
│       │   │   └── useTemplates.ts
│       │   ├── useFormState.ts [NEW]
│       │   ├── useErrorHandler.ts [NEW]
│       │   ├── useSearch.ts   [NEW]
│       │   ├── useAuth.ts
│       │   └── use-mobile.tsx
│       ├── components/
│       │   ├── projects/      [NEW - 4 files]
│       │   │   ├── ProjectsList.tsx
│       │   │   ├── ProjectForm.tsx
│       │   │   ├── ProjectFilters.tsx
│       │   │   └── ProjectTeam.tsx
│       │   ├── users/         [NEW - 3 files]
│       │   │   ├── UserList.tsx
│       │   │   ├── UserForm.tsx
│       │   │   └── UserRoleAssignment.tsx
│       │   ├── roles/         [NEW - 2 files]
│       │   │   ├── RoleList.tsx
│       │   │   └── RoleForm.tsx
│       │   ├── findings/      [NEW - 2 files]
│       │   │   ├── FindingsList.tsx
│       │   │   └── FindingStatusBadge.tsx
│       │   ├── reports/       [NEW - 2 files]
│       │   │   ├── ReportWizard.tsx
│       │   │   └── ReportHistory.tsx
│       │   ├── settings/      [NEW - 3 files]
│       │   │   ├── ProfileSettings.tsx
│       │   │   ├── PasswordSettings.tsx
│       │   │   └── OrganizationSettings.tsx
│       │   ├── search/        [NEW - 1 file]
│       │   │   └── SearchResults.tsx
│       │   ├── ui/            [EXISTING - 50+ Shadcn components]
│       │   ├── AppSidebar.tsx
│       │   ├── ErrorBoundary.tsx [NEW]
│       │   └── ... (other existing components)
│       ├── pages/
│       │   ├── Dashboard.tsx     [REFACTORED - 273 → 150 lines]
│       │   ├── Projects.tsx      [REFACTORED - 754 → 200 lines]
│       │   ├── ProjectDetail.tsx [REFACTORED - 831 → 400 lines]
│       │   ├── UserManagement.tsx [REFACTORED - 518 → 150 lines]
│       │   ├── RoleManagement.tsx [REFACTORED - 587 → 150 lines]
│       │   ├── MyFindings.tsx     [REFACTORED - 276 → 150 lines]
│       │   ├── Search.tsx         [NEW - 200 lines]
│       │   ├── Reports.tsx        [NEW - 250 lines]
│       │   ├── Settings.tsx       [NEW - 200 lines]
│       │   └── ... (other pages)
│       └── App.tsx           [REFACTORED - removed placeholders]
├── shared/
│   └── schema.ts
├── docs/                      [NEW]
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── COMPONENTS.md
│   └── CONTRIBUTING.md
├── tests/                     [NEW]
│   ├── backend/
│   │   ├── services/
│   │   └── routes/
│   └── frontend/
│       ├── components/
│       └── hooks/
├── REFACTORING_PLAN.md       [THIS FILE]
└── README.md                  [UPDATED]
```

---

## Appendix B: Before/After Comparison

### Backend Architecture

#### Before:
```
routes.ts (1,584 lines)
  ├── 45 endpoints
  ├── 96 try-catch blocks
  ├── Business logic mixed with routes
  ├── No validation middleware
  └── No error handling pattern

storage.ts (987 lines)
  ├── 57 methods
  └── Direct database queries

auth.ts (447 lines)
  ├── Authentication
  └── Authorization middleware
```

#### After:
```
routes/ (8 modules, ~1,200 lines total)
  ├── projects.ts (200 lines)
  ├── findings.ts (200 lines)
  ├── users.ts (200 lines)
  ├── roles.ts (150 lines)
  ├── templates.ts (100 lines)
  ├── exports.ts (150 lines)
  ├── invitations.ts (100 lines)
  └── bootstrap.ts (80 lines)

services/ (7 files, ~680 lines)
  ├── ProjectService.ts (150 lines)
  ├── FindingService.ts (120 lines)
  ├── UserService.ts (100 lines)
  ├── TemplateService.ts (80 lines)
  ├── ExportService.ts (100 lines)
  ├── AuthService.ts (80 lines)
  └── SearchService.ts (150 lines)

repositories/ (4 files, ~290 lines)
  ├── ProjectRepository.ts (80 lines)
  ├── FindingRepository.ts (80 lines)
  ├── UserRepository.ts (80 lines)
  └── BaseRepository.ts (50 lines)

middleware/ (6 files, ~590 lines)
  ├── errorHandler.ts (100 lines)
  ├── validation.ts (80 lines)
  ├── logging.ts (100 lines)
  ├── rateLimiter.ts (150 lines)
  ├── security.ts (80 lines)
  └── audit.ts (80 lines)
```

### Frontend Architecture

#### Before:
```
pages/
  ├── Dashboard.tsx (273 lines)
  ├── Projects.tsx (754 lines)
  ├── ProjectDetail.tsx (831 lines)
  ├── UserManagement.tsx (518 lines)
  ├── RoleManagement.tsx (587 lines)
  ├── MyFindings.tsx (276 lines)
  └── ... (15 pages total)

components/
  └── ... (30+ mixed components)

hooks/
  ├── useAuth.ts
  └── use-mobile.tsx

No API client layer
Form schemas scattered in components
No custom data hooks
```

#### After:
```
pages/
  ├── Dashboard.tsx (150 lines - refactored)
  ├── Projects.tsx (200 lines - refactored)
  ├── ProjectDetail.tsx (400 lines - refactored)
  ├── UserManagement.tsx (150 lines - refactored)
  ├── RoleManagement.tsx (150 lines - refactored)
  ├── MyFindings.tsx (150 lines - refactored)
  ├── Search.tsx (200 lines - NEW)
  ├── Reports.tsx (250 lines - NEW)
  ├── Settings.tsx (200 lines - NEW)
  └── ... (18 pages total)

components/
  ├── projects/ (4 components)
  ├── users/ (3 components)
  ├── roles/ (2 components)
  ├── findings/ (2 components)
  ├── reports/ (2 components)
  ├── settings/ (3 components)
  ├── search/ (1 component)
  └── ui/ (50+ Shadcn components)

hooks/
  ├── data/
  │   ├── useProjects.ts (NEW)
  │   ├── useFindings.ts (NEW)
  │   ├── useUsers.ts (NEW)
  │   ├── useRoles.ts (NEW)
  │   └── useTemplates.ts (NEW)
  ├── useFormState.ts (NEW)
  ├── useErrorHandler.ts (NEW)
  ├── useSearch.ts (NEW)
  ├── useAuth.ts
  └── use-mobile.tsx

lib/
  ├── api/
  │   ├── baseApi.ts (NEW)
  │   ├── projectApi.ts (NEW)
  │   ├── findingApi.ts (NEW)
  │   ├── userApi.ts (NEW)
  │   ├── roleApi.ts (NEW)
  │   └── templateApi.ts (NEW)
  └── formSchemas.ts (NEW - consolidated)
```

---

## Appendix C: Git Workflow

### Branch Strategy

```
main (production)
  ├── develop (staging)
  │   ├── feature/backend-services (Day 1-2)
  │   ├── feature/backend-middleware (Day 3-4)
  │   ├── feature/backend-repositories (Day 5)
  │   ├── feature/backend-routes (Day 6-7)
  │   ├── feature/frontend-api-client (Day 1-2)
  │   ├── feature/frontend-hooks (Day 2-3)
  │   ├── feature/frontend-components (Day 4-5)
  │   ├── feature/search-page (Day 9)
  │   ├── feature/reports-page (Day 10)
  │   ├── feature/settings-page (Day 11)
  │   └── feature/final-polish (Day 14-15)
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Testing
- `chore`: Maintenance

**Examples:**
```
feat(backend): add ProjectService with business logic

- Extract project creation from routes.ts
- Add validation and sanitization
- Implement error handling
- Add JSDoc comments

Closes #123
```

```
refactor(frontend): split Projects component into modules

- Create ProjectsList component
- Create ProjectForm component
- Create ProjectFilters component
- Reduce main component from 754 to 200 lines

Related to #124
```

### Daily Commit Requirements

**Minimum commits per developer per day:** 2-3
**Commit frequency:** Every 2-3 hours of work
**Push frequency:** End of day (minimum)

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Tested locally
- [ ] Updated documentation

## Screenshots (if applicable)

## Related Issues
Closes #123
```

---

## Appendix D: Environment Setup Checklist

### Development Environment

#### Prerequisites
- [ ] Node.js v20+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] PostgreSQL client (optional, for database inspection)

#### VS Code Extensions (Recommended)
- [ ] ESLint
- [ ] Prettier
- [ ] Tailwind CSS IntelliSense
- [ ] TypeScript Error Translator
- [ ] GitLens
- [ ] Thunder Client (API testing)

#### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Session
SESSION_SECRET=random_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# Optional
SENDGRID_API_KEY=...
```

#### Initial Setup Commands
```bash
# Clone repository
git clone <repo-url>
cd SecureReportFlow

# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

---

## Appendix E: Code Style Guidelines

### TypeScript

#### Naming Conventions
```typescript
// Classes: PascalCase
class ProjectService {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IProjectRepository {}

// Types: PascalCase
type ProjectStatus = 'active' | 'inactive';

// Variables/Functions: camelCase
const projectName = 'test';
function createProject() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Files: kebab-case or PascalCase
project-service.ts
ProjectService.ts
```

#### File Organization
```typescript
// 1. Imports
import { type Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';

// 2. Types/Interfaces
interface CreateProjectDto {
  name: string;
  description: string;
}

// 3. Constants
const DEFAULT_PAGE_SIZE = 20;

// 4. Main code
export class ProjectController {
  // ...
}

// 5. Exports
export default ProjectController;
```

#### TypeScript Preferences
```typescript
// ✅ DO: Use type inference
const name = 'test'; // type inferred as string

// ✅ DO: Use interfaces for objects
interface User {
  id: string;
  name: string;
}

// ✅ DO: Use types for unions/aliases
type Status = 'active' | 'inactive';

// ❌ DON'T: Use 'any'
const data: any = {}; // Avoid!

// ✅ DO: Use 'unknown' if type is truly unknown
const data: unknown = {};
```

### React

#### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
}

// 3. Component
export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  // 3a. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  // 3b. Handlers
  const handleEdit = () => {
    onEdit(project.id);
  };

  // 3c. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3d. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

#### Naming Conventions
```typescript
// Components: PascalCase
function ProjectCard() {}

// Hooks: camelCase with 'use' prefix
function useProjects() {}

// Event handlers: camelCase with 'handle' prefix
const handleClick = () => {};

// Boolean props/state: 'is', 'has', 'should' prefix
const [isOpen, setIsOpen] = useState(false);
const hasPermission = true;
```

---

## Appendix F: Testing Strategy

### Backend Testing

#### Unit Tests (Services)
```typescript
// ProjectService.test.ts
describe('ProjectService', () => {
  describe('createProject', () => {
    it('should create project with valid data', async () => {
      // Arrange
      const projectData = {
        name: 'Test Project',
        description: 'Test Description'
      };

      // Act
      const result = await projectService.createProject(userId, projectData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Project');
    });

    it('should throw error with invalid data', async () => {
      // Arrange
      const invalidData = { name: '' };

      // Act & Assert
      await expect(
        projectService.createProject(userId, invalidData)
      ).rejects.toThrow();
    });
  });
});
```

#### Integration Tests (Routes)
```typescript
// projects.routes.test.ts
describe('POST /api/projects', () => {
  it('should create project when authenticated', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Cookie', authCookie)
      .send({
        name: 'Test Project',
        description: 'Test Description'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: 'Test Project'
      });

    expect(response.status).toBe(401);
  });
});
```

### Frontend Testing

#### Component Tests
```typescript
// ProjectCard.test.tsx
describe('ProjectCard', () => {
  it('should render project name', () => {
    const project = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description'
    };

    render(<ProjectCard project={project} onEdit={jest.fn()} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    const project = { id: '1', name: 'Test' };

    render(<ProjectCard project={project} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

#### Hook Tests
```typescript
// useProjects.test.tsx
describe('useProjects', () => {
  it('should fetch projects on mount', async () => {
    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(2);
    });
  });

  it('should create project', async () => {
    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.create({ name: 'New Project' });
    });

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(3);
    });
  });
});
```

---

## Appendix G: Deployment Checklist

### Pre-Deployment

#### Code Quality
- [ ] All linting errors fixed
- [ ] All TypeScript errors fixed
- [ ] All tests passing
- [ ] Code reviewed by peer
- [ ] No console.log in production code
- [ ] No commented-out code
- [ ] Dependencies updated

#### Security
- [ ] Environment variables set
- [ ] Secrets not in code
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Security headers applied
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled

#### Performance
- [ ] Database indexes added
- [ ] Caching implemented
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented

#### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Architecture documented
- [ ] Setup guide updated
- [ ] Changelog updated

### Deployment Steps

#### 1. Backup
- [ ] Backup production database
- [ ] Backup environment variables
- [ ] Backup current deployment

#### 2. Build
```bash
# Backend
npm run build

# Frontend (included in build)
# Creates dist/ folder
```

#### 3. Test Build
```bash
# Run production build locally
NODE_ENV=production node dist/index.js

# Test critical flows:
- [ ] Login
- [ ] Create project
- [ ] Create finding
- [ ] Generate report
- [ ] User management
```

#### 4. Deploy
```bash
# Push to repository
git push origin main

# Deploy to hosting (Replit/Vercel/etc.)
# Follow platform-specific steps
```

#### 5. Post-Deployment
- [ ] Smoke test all endpoints
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify database connections
- [ ] Test email delivery (if applicable)

#### 6. Rollback Plan
If critical issues found:
```bash
# Revert to previous version
git revert HEAD
git push origin main

# OR restore from backup
# Follow platform-specific restore steps
```

---

## Conclusion

This 15-day refactoring plan transforms SecureReportFlow from a monolithic codebase into a modern, maintainable, production-ready application. By following this plan day by day, the 2-person team will achieve:

✅ **60% reduction in code duplication**
✅ **Modern 3-layer architecture** (Routes → Services → Repositories)
✅ **All placeholder pages implemented** (Search, Reports, Settings)
✅ **Enhanced security** (rate limiting, API versioning, audit logging)
✅ **Improved performance** (caching, database indexes, bundle optimization)
✅ **Comprehensive documentation** (architecture, API, components)
✅ **Test coverage** (backend integration tests, frontend component tests)

**Key Success Factors:**
1. **Communication:** Daily standups keep team aligned
2. **Parallel work:** Backend and frontend developers work independently
3. **Incremental progress:** Small, testable changes each day
4. **Testing:** Regular testing prevents regression
5. **Documentation:** Continuous documentation prevents knowledge loss

**Deadline: November 10, 2024 - Achievable! 🎯**

---

## Appendix H: Issue Tracking System Feature (Jira-like)

### Feature Overview
Add a complete issue tracking system to SecureReportFlow where organizations and users can:
- Raise issues/tickets for various concerns
- Communicate through threaded comments
- Track issue status changes with full audit trail
- Assign issues to team members
- Set priorities and categorize by type
- Get notifications on updates
- View issue history and activity timeline

### User Stories

**As an Organization Admin, I want to:**
- Create issues for project concerns, bugs, or feature requests
- Assign issues to specific team members
- Track the status of all issues in my organization
- Receive notifications when issues are updated or commented on
- Filter and search issues by status, priority, assignee, etc.

**As a Researcher/Team Member, I want to:**
- View issues assigned to me
- Comment on issues to provide updates or ask questions
- Change issue status as I work on them
- Mention other users in comments using @mentions
- Attach files/evidence to issues
- Subscribe to issues I'm interested in

**As a Client/Customer, I want to:**
- View issues related to my projects
- Comment on issues to provide feedback
- See status updates and resolution progress
- Create support tickets for questions

### Database Schema Requirements

#### New Tables to Add:

**1. `issues` Table**
- `id` (UUID, primary key)
- `title` (text, required) - Issue title/summary
- `description` (text) - Detailed description (supports HTML/markdown)
- `type` (enum: bug, feature_request, question, support, security_concern, other)
- `status` (enum: open, in_progress, pending_review, resolved, closed, on_hold)
- `priority` (enum: critical, high, medium, low)
- `organizationId` (references organizations)
- `projectId` (references projects, optional - can be org-wide)
- `createdBy` (references users)
- `assignedTo` (references users, optional)
- `dueDate` (timestamp, optional)
- `resolvedAt` (timestamp, optional)
- `closedAt` (timestamp, optional)
- `tags` (text array)
- `metadata` (jsonb - for custom fields)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**2. `issue_comments` Table**
- `id` (UUID, primary key)
- `issueId` (references issues, cascade delete)
- `authorId` (references users)
- `content` (text, required) - Comment content (HTML/markdown)
- `mentions` (text array) - User IDs mentioned in comment
- `isInternal` (boolean) - Internal notes vs public comments
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `editedAt` (timestamp, optional)

**3. `issue_attachments` Table**
- `id` (UUID, primary key)
- `issueId` (references issues, cascade delete)
- `filename` (text)
- `originalFilename` (text)
- `mimeType` (text)
- `fileSize` (integer)
- `filePath` (text)
- `uploadedBy` (references users)
- `createdAt` (timestamp)

**4. `issue_watchers` Table**
- `id` (UUID, primary key)
- `issueId` (references issues, cascade delete)
- `userId` (references users, cascade delete)
- `createdAt` (timestamp)

**5. `issue_status_history` Table**
- `id` (UUID, primary key)
- `issueId` (references issues, cascade delete)
- `fromStatus` (issue_status enum)
- `toStatus` (issue_status enum)
- `changedBy` (references users)
- `comment` (text, optional)
- `createdAt` (timestamp)

**6. `issue_activity` Table**
- `id` (UUID, primary key)
- `issueId` (references issues, cascade delete)
- `actorId` (references users)
- `activityType` (enum: created, commented, status_changed, assigned, priority_changed, etc.)
- `activityData` (jsonb) - Stores old/new values
- `createdAt` (timestamp)

### Backend Implementation Steps

#### Day X: Database Schema & Models (4-6 hours)
- [ ] Add new enums to `shared/schema.ts`:
  - `issueStatusEnum`
  - `issuePriorityEnum`
  - `issueTypeEnum`
  - `issueActivityTypeEnum`
- [ ] Create `issues` table with all fields
- [ ] Create `issue_comments` table
- [ ] Create `issue_attachments` table
- [ ] Create `issue_watchers` table
- [ ] Create `issue_status_history` table
- [ ] Create `issue_activity` table
- [ ] Add relations for all new tables
- [ ] Create insert schemas for validation
- [ ] Run database migration (`npm run db:push`)

#### Day X+1: Backend Services (6-8 hours)

**Morning: Issue Service**
- [ ] Create `server/services/IssueService.ts` (200 lines)
- [ ] Implement `createIssue()` method
  - Validate input
  - Create issue record
  - Auto-assign creator as watcher
  - Log activity
  - Send notifications
- [ ] Implement `updateIssue()` method
  - Update issue fields
  - Track what changed
  - Log activity
  - Notify watchers
- [ ] Implement `assignIssue()` method
  - Assign to user
  - Add assignee as watcher
  - Log activity
  - Send notification
- [ ] Implement `changeStatus()` method
  - Update status
  - Record in status history
  - Set resolvedAt/closedAt timestamps
  - Log activity
  - Notify watchers
- [ ] Implement `getIssue()` method with full details
- [ ] Implement `listIssues()` with filters and pagination

**Afternoon: Comment & Activity Services**
- [ ] Create `server/services/IssueCommentService.ts` (150 lines)
- [ ] Implement `addComment()` method
  - Validate content
  - Parse @mentions
  - Add mentioned users as watchers
  - Log activity
  - Send notifications to watchers and mentioned users
- [ ] Implement `updateComment()` method
  - Check permissions (only author can edit)
  - Update content
  - Set editedAt timestamp
- [ ] Implement `deleteComment()` method
  - Soft delete or hard delete
  - Check permissions
- [ ] Implement `getComments()` method with pagination
- [ ] Add helper methods for @mention parsing

#### Day X+2: Backend Routes & Middleware (6-8 hours)

**Morning: Issue Routes**
- [ ] Create `server/routes/issues.ts` (250 lines)
- [ ] `POST /api/issues` - Create new issue
  - Validate request body
  - Check permissions (can create issues)
  - Call IssueService.createIssue()
  - Return created issue with 201 status
- [ ] `GET /api/issues` - List issues with filters
  - Query params: status, priority, assignedTo, createdBy, projectId, tags, search
  - Pagination support
  - Sort options
  - Call IssueService.listIssues()
- [ ] `GET /api/issues/:id` - Get issue details
  - Check permissions (can view issue)
  - Include comments, attachments, activity
  - Call IssueService.getIssue()
- [ ] `PATCH /api/issues/:id` - Update issue
  - Check permissions (assigned user, creator, or admin)
  - Validate updates
  - Call IssueService.updateIssue()
- [ ] `POST /api/issues/:id/assign` - Assign issue
  - Check permissions (admin or project lead)
  - Validate assignee exists
  - Call IssueService.assignIssue()
- [ ] `POST /api/issues/:id/status` - Change status
  - Check permissions
  - Validate status transition
  - Call IssueService.changeStatus()
- [ ] `DELETE /api/issues/:id` - Delete issue (admin only)

**Afternoon: Comment Routes**
- [ ] Create `server/routes/issue-comments.ts` (150 lines)
- [ ] `POST /api/issues/:issueId/comments` - Add comment
  - Validate content
  - Check permissions (can view issue)
  - Call IssueCommentService.addComment()
- [ ] `GET /api/issues/:issueId/comments` - List comments
  - Pagination support
  - Include author details
  - Call IssueCommentService.getComments()
- [ ] `PATCH /api/issues/:issueId/comments/:commentId` - Update comment
  - Check permissions (author only)
  - Call IssueCommentService.updateComment()
- [ ] `DELETE /api/issues/:issueId/comments/:commentId` - Delete comment
  - Check permissions (author or admin)
  - Call IssueCommentService.deleteComment()
- [ ] Add routes to issue router in `server/routes/index.ts`

#### Day X+3: Permissions & Notifications (4-6 hours)
- [ ] Add issue permissions to `permissionEnum`:
  - `view_issues`
  - `create_issues`
  - `edit_issues`
  - `delete_issues`
  - `assign_issues`
  - `comment_on_issues`
- [ ] Update role permissions for each user role
- [ ] Create notification logic for:
  - New issue created
  - Issue assigned to you
  - Issue status changed
  - New comment on watched issue
  - Mentioned in comment
- [ ] Add email notification templates (optional)
- [ ] Create in-app notification system

### Frontend Implementation Steps

#### Day Y: API Client & Hooks (4-6 hours)

**Morning: API Client**
- [ ] Create `client/src/lib/api/issueApi.ts` (100 lines)
- [ ] Add API methods:
  - `getIssues(filters)` - List issues with filters
  - `getIssue(id)` - Get issue details
  - `createIssue(data)` - Create new issue
  - `updateIssue(id, data)` - Update issue
  - `assignIssue(id, userId)` - Assign issue
  - `changeStatus(id, status, comment)` - Change status
  - `deleteIssue(id)` - Delete issue
  - `addComment(issueId, content)` - Add comment
  - `getComments(issueId, page)` - Get comments
  - `updateComment(issueId, commentId, content)` - Update comment
  - `deleteComment(issueId, commentId)` - Delete comment
  - `watchIssue(issueId)` - Subscribe to issue
  - `unwatchIssue(issueId)` - Unsubscribe from issue

**Afternoon: Custom Hooks**
- [ ] Create `client/src/hooks/data/useIssues.ts` (80 lines)
  - `useIssues(filters)` - List issues with React Query
  - `useCreateIssue()` - Create issue mutation
  - `useUpdateIssue()` - Update issue mutation
  - `useDeleteIssue()` - Delete issue mutation
- [ ] Create `client/src/hooks/data/useIssue.ts` (60 lines)
  - `useIssue(id)` - Get single issue with details
  - `useAssignIssue()` - Assign issue mutation
  - `useChangeIssueStatus()` - Change status mutation
- [ ] Create `client/src/hooks/data/useIssueComments.ts` (60 lines)
  - `useIssueComments(issueId)` - Get comments
  - `useAddComment()` - Add comment mutation
  - `useUpdateComment()` - Update comment mutation
  - `useDeleteComment()` - Delete comment mutation

#### Day Y+1: Issues List Page (6-8 hours)

**Full Day: Issues Page**
- [ ] Create `client/src/pages/Issues.tsx` (250 lines)
- [ ] Implement main layout:
  - Header with "Create Issue" button
  - Filter sidebar (status, priority, assignee, type)
  - Search bar
  - Issue list/table view toggle
- [ ] Create `client/src/components/issues/IssueList.tsx` (150 lines)
  - Table view with columns: ID, Title, Status, Priority, Assignee, Created
  - Status badges with colors
  - Priority badges with colors
  - Click to open issue detail
  - Pagination controls
- [ ] Create `client/src/components/issues/IssueFilters.tsx` (100 lines)
  - Filter by status (checkboxes)
  - Filter by priority (checkboxes)
  - Filter by assignee (select dropdown)
  - Filter by type (checkboxes)
  - Clear filters button
- [ ] Create `client/src/components/issues/CreateIssueDialog.tsx` (200 lines)
  - Form with fields: title, description, type, priority, assignee, project, tags
  - Rich text editor for description
  - Validation with Zod schema
  - Submit handler

#### Day Y+2: Issue Detail Page (8 hours)

**Full Day: Issue Detail**
- [ ] Create `client/src/pages/IssueDetail.tsx` (300 lines)
- [ ] Implement main layout:
  - Header with issue ID and title
  - Status and priority badges
  - Action buttons (Edit, Assign, Change Status, Watch/Unwatch)
  - Main content area
  - Comments section
  - Activity timeline sidebar
- [ ] Create `client/src/components/issues/IssueHeader.tsx` (100 lines)
  - Issue title (editable inline)
  - Status dropdown (change status)
  - Priority dropdown
  - Assignee with avatar
  - Created date and author
  - Watch/Unwatch button
- [ ] Create `client/src/components/issues/IssueDescription.tsx` (80 lines)
  - Rich text display of description
  - Edit mode with rich text editor
  - Save/Cancel buttons
- [ ] Create `client/src/components/issues/IssueMetadata.tsx` (80 lines)
  - Type, Priority, Status
  - Created by, Assigned to
  - Due date
  - Tags
  - Related project (if any)

#### Day Y+3: Comments System (6-8 hours)

**Morning: Comment Components**
- [ ] Create `client/src/components/issues/CommentSection.tsx` (150 lines)
  - Comment input with rich text editor
  - @mention autocomplete functionality
  - Submit button
  - Comments list
  - Load more pagination
- [ ] Create `client/src/components/issues/CommentItem.tsx` (120 lines)
  - Author avatar and name
  - Comment content (rendered HTML/markdown)
  - Timestamp with "edited" indicator
  - Edit/Delete buttons (for author)
  - @mention highlighting
  - Internal comment indicator

**Afternoon: Activity Timeline**
- [ ] Create `client/src/components/issues/ActivityTimeline.tsx` (150 lines)
  - Timeline of all activities
  - Different icons for different activity types:
    - Issue created
    - Status changed (with from → to)
    - Comment added
    - Assigned to user
    - Priority changed
    - Attachments added
  - Timestamps
  - Actor information
  - Expandable details

#### Day Y+4: Additional Features & Polish (4-6 hours)
- [ ] Create `client/src/components/issues/IssueStatusBadge.tsx` (40 lines)
  - Color-coded status badges
  - Icons for each status
- [ ] Create `client/src/components/issues/IssuePriorityBadge.tsx` (40 lines)
  - Color-coded priority badges
  - Icons for each priority
- [ ] Create `client/src/components/issues/IssueTypeBadge.tsx` (40 lines)
  - Icons for each issue type
- [ ] Create `client/src/components/issues/AssigneeSelect.tsx` (80 lines)
  - Dropdown to select assignee
  - Search users
  - User avatars
- [ ] Create `client/src/components/issues/MentionInput.tsx` (100 lines)
  - Rich text input with @mention support
  - Autocomplete dropdown
  - Highlight mentions
- [ ] Add breadcrumbs to issue pages
- [ ] Add keyboard shortcuts (e.g., 'c' to comment)
- [ ] Add bulk operations (select multiple, change status)

### Form Schemas & Validation

#### Zod Schemas to Create:
- [ ] `createIssueSchema` in `client/src/lib/formSchemas.ts`
  ```
  - title: required, min 5 chars, max 200 chars
  - description: optional, max 5000 chars
  - type: required, one of enum values
  - priority: required, one of enum values
  - assignedTo: optional, valid user ID
  - projectId: optional, valid project ID
  - tags: optional array of strings
  - dueDate: optional date
  ```
- [ ] `updateIssueSchema` - Partial of create schema
- [ ] `changeStatusSchema` - Status + optional comment
- [ ] `createCommentSchema` - Content required, min 1 char

### Permissions Matrix

| User Role | View Issues | Create Issues | Edit Issues | Delete Issues | Assign Issues | Comment |
|-----------|-------------|---------------|-------------|---------------|---------------|---------|
| Researcher | Assigned/Watched | Yes | Own issues | No | No | Yes |
| Project User | Project-related | Yes | Own issues | No | No | Yes |
| Customer Admin | Org issues | Yes | Org issues | Org issues | Yes | Yes |
| Org Admin | All org issues | Yes | All org issues | All org issues | Yes | Yes |
| Super Admin | All issues | Yes | All issues | All issues | Yes | Yes |

### Notification Events

**Email Notifications:**
- [ ] New issue assigned to you
- [ ] Issue status changed on watched issue
- [ ] Mentioned in comment
- [ ] Comment on watched issue
- [ ] Issue resolved
- [ ] Issue closed

**In-App Notifications:**
- [ ] All of the above
- [ ] Issue updated
- [ ] New watcher added
- [ ] Due date approaching

### UI/UX Considerations

**Issue List View:**
- Table view (default) - More data visible
- Card view - Visual, good for scanning
- Kanban board - Grouped by status (bonus feature)

**Filtering & Search:**
- Quick filters (My Issues, Watching, Unassigned, Overdue)
- Advanced filters (Status, Priority, Type, Assignee, Date range)
- Full-text search in title and description
- Save filter presets

**Status Workflow:**
- Visual status flow indicator
- Restrict certain status transitions
- Require comment when closing without resolving
- Auto-close resolved issues after X days

**Comment Features:**
- @mentions with autocomplete
- Rich text formatting (bold, italic, code blocks)
- File attachments
- Quote previous comments
- Emoji reactions (bonus)
- Edit history (show edited indicator)

### Testing Checklist

**Backend Tests:**
- [ ] Test creating issues with different user roles
- [ ] Test permissions for viewing/editing issues
- [ ] Test status transitions and history logging
- [ ] Test comment creation with @mentions
- [ ] Test watcher notifications
- [ ] Test filtering and pagination
- [ ] Test assignment logic

**Frontend Tests:**
- [ ] Test issue list rendering and filtering
- [ ] Test creating new issue with form validation
- [ ] Test editing issue details
- [ ] Test commenting system
- [ ] Test @mention autocomplete
- [ ] Test status change workflow
- [ ] Test assignee selection
- [ ] Test activity timeline display

### Integration Points

**With Existing Features:**
- [ ] Link issues to projects (optional association)
- [ ] Link issues to findings (reference findings in issues)
- [ ] Add "Create Issue" button on project detail page
- [ ] Add "Create Issue" button on finding detail page
- [ ] Show related issues in project dashboard
- [ ] Add issue count to organization dashboard
- [ ] Link from activity logs to issues
- [ ] Add issues to global search results

**With Sidebar Navigation:**
- [ ] Add "Issues" menu item
  - My Issues (badge with count)
  - All Issues
  - Create Issue

### Performance Considerations

- [ ] Add database indexes:
  - `issues.organizationId`
  - `issues.projectId`
  - `issues.assignedTo`
  - `issues.status`
  - `issues.priority`
  - `issues.createdAt`
  - `issue_comments.issueId`
  - `issue_activity.issueId`
- [ ] Implement pagination for issue lists (20 per page)
- [ ] Implement pagination for comments (50 per page)
- [ ] Cache frequently accessed issues
- [ ] Optimize query for issue list with joins
- [ ] Debounce search input
- [ ] Lazy load activity timeline

### Success Metrics

**Functionality:**
- [ ] Users can create, view, edit, delete issues
- [ ] Status workflow works correctly
- [ ] Comments system fully functional
- [ ] @mentions work and send notifications
- [ ] Filters and search work correctly
- [ ] Permissions enforced properly
- [ ] Activity timeline shows all events

**Performance:**
- [ ] Issue list loads in < 1 second
- [ ] Issue detail loads in < 500ms
- [ ] Comment submission < 300ms
- [ ] Search results < 1 second

**User Experience:**
- [ ] Intuitive navigation
- [ ] Clear status indicators
- [ ] Responsive design (mobile-friendly)
- [ ] Helpful error messages
- [ ] Real-time updates (polling or WebSocket)

### Future Enhancements (Post-MVP)

- [ ] Kanban board view
- [ ] Issue templates
- [ ] Custom fields per organization
- [ ] Email integration (create issues via email)
- [ ] Issue dependencies (blocking/blocked by)
- [ ] Time tracking
- [ ] SLA tracking
- [ ] Automated workflows
- [ ] Webhooks for integrations
- [ ] Public issue portal for clients
- [ ] Issue voting/upvoting
- [ ] Saved filters and views
- [ ] Export issues to CSV/Excel

### Estimated Timeline

**Total: 3-4 days (24-32 hours)**

| Phase | Hours | Description |
|-------|-------|-------------|
| Database Schema | 4-6 | Create all tables, enums, relations |
| Backend Services | 8-10 | IssueService, CommentService, logic |
| Backend Routes | 6-8 | API endpoints for issues and comments |
| Permissions & Notifications | 4-6 | Permission system, notification logic |
| Frontend API & Hooks | 4-6 | API client and React Query hooks |
| Issues List Page | 6-8 | List view, filters, create dialog |
| Issue Detail Page | 8 | Detail view, metadata, edit functionality |
| Comments System | 6-8 | Comment section, timeline, mentions |
| Polish & Testing | 4-6 | Styling, testing, bug fixes |

### Resource Allocation

**Developer 1 (Backend Specialist): 16-20 hours**
- Database schema design and migration
- Backend services (IssueService, CommentService)
- API routes and endpoints
- Permissions and authorization
- Notification system
- Backend testing

**Developer 2 (Frontend Specialist): 16-20 hours**
- API client layer
- Custom React hooks
- Issues list page and components
- Issue detail page
- Comments system UI
- Activity timeline
- Form validation
- Frontend testing

**Where to Insert in Main Plan:**

This feature can be implemented:
1. **After Day 11** (Settings complete) - As an additional feature
2. **During Week 3** (Days 9-11) - Replace Search/Reports/Settings OR
3. **As a separate sprint** - After the main 15-day refactoring is complete

---

**Recommendation:** Implement this as **Days 17-20** (Nov 11-14) as a post-refactoring feature sprint, OR integrate into the main plan by replacing one of the lower-priority features.

---

*End of Issue Tracking System Feature Specification*
