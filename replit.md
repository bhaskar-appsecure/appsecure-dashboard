# Replit.md - PenTest Pro

## Overview

PenTest Pro is a modern enterprise-grade penetration testing platform designed to streamline security assessment workflows. The application provides comprehensive tools for managing security findings, generating professional reports, and facilitating collaboration between security researchers and client teams. Built with a focus on data-dense interfaces and professional trust, the platform supports multi-role access with specialized portals for researchers, project users, customer admins, and organization admins.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, utilizing Wouter for client-side routing
- **UI Design System**: Material Design principles with Shadcn/ui components and Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens supporting both light and dark themes
- **State Management**: TanStack Query for server state management and data fetching
- **Rich Text Editing**: TipTap editor with support for tables, images, links, and custom formatting

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with role-based access control and comprehensive error handling
- **Database Layer**: Drizzle ORM with PostgreSQL database using Neon serverless
- **Authentication**: Replit Auth integration with OpenID Connect and session management
- **File Structure**: Monorepo with shared schema definitions between client and server

### Database Design
- **ORM**: Drizzle with type-safe schema definitions
- **Schema**: Comprehensive data model including users, organizations, projects, findings, evidence attachments, comments, and audit logs
- **Enums**: Strongly typed status and role enumerations for findings, projects, and users
- **Relationships**: Proper foreign key relationships with cascading operations

### Authentication & Authorization
- **Auth Provider**: Replit Auth with OpenID Connect flow
- **Session Management**: PostgreSQL-backed sessions with configurable TTL
- **Role-Based Access**: Multi-level permissions (researcher, project_user, customer_admin, org_admin)
- **Security**: HTTP-only cookies, CSRF protection, and secure session handling

### Component Architecture
- **Design System**: Custom component library built on Radix UI primitives
- **Reusable Components**: Specialized components for severity badges, status indicators, CVSS calculators, and rich text editing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **File Uploads**: Drag-and-drop file upload zones with progress tracking and metadata capture

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **@neondatabase/serverless**: Neon's serverless database driver for optimal performance

### Authentication Services
- **Replit Auth**: Identity provider with OpenID Connect protocol
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Libraries
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Lucide React**: Icon library providing consistent iconography
- **TipTap**: Rich text editor with extensible plugin architecture

### Development Tools
- **Vite**: Fast build tool with HMR and optimized bundling
- **TypeScript**: Type safety across the entire application stack
- **Drizzle Kit**: Database migration and schema management tools

### Utility Libraries
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **date-fns**: Date manipulation and formatting utilities