import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hasPermission, isSuperAdmin, hashPassword } from "./auth";
import crypto from "crypto";
import { z } from "zod";
import { 
  insertFindingSchema,
  insertProjectSchema,
  insertCredentialSchema, 
  insertPostmanCollectionSchema, 
  insertReportExportSchema,
  insertRoleSchema,
  insertRolePermissionSchema,
  insertUserRoleSchema,
  insertUserInvitationSchema,
  insertUserSchema,
  insertTemplateSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { createDefaultVAPTTemplate } from '../scripts/create-default-template';

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Configure DOMPurify with a safe allowlist
const sanitizeHtml = (html: string | undefined | null): string => {
  if (!html) return '';
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'img', 'style'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link', 'meta'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are now handled in auth.ts

  // Bootstrap route for setting up super admin
  app.post('/api/bootstrap/super-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const { organizationId } = req.body;

      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      // Verify organization exists
      const org = await storage.getOrganization(organizationId);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      await storage.bootstrapSuperAdmin(userId, organizationId);
      
      res.json({ 
        message: "Super admin setup completed successfully",
        userId,
        organizationId 
      });
    } catch (error) {
      console.error("Error bootstrapping super admin:", error);
      res.status(500).json({ message: "Failed to bootstrap super admin" });
    }
  });

  // Bootstrap route for creating default VAPT template
  app.post('/api/bootstrap/default-template', isAuthenticated, hasPermission('export_reports'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      // Check if default template already exists for this organization
      const existingTemplates = await storage.getTemplatesByOrganization(user.organizationId);
      const hasDefaultTemplate = existingTemplates.some(template => template.isDefault);
      
      if (hasDefaultTemplate) {
        return res.status(400).json({ message: "Default template already exists for this organization" });
      }

      const template = await createDefaultVAPTTemplate(user.organizationId, userId);
      
      res.json({ 
        message: "Default VAPT template created successfully",
        templateId: template.id,
        templateName: template.name
      });
    } catch (error) {
      console.error("Error creating default template:", error);
      res.status(500).json({ message: "Failed to create default template" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Verify user has access to this project
      const hasAccess = await storage.hasProjectAccess(userId, req.params.id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create project
  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      console.log("Project creation request body:", JSON.stringify(req.body, null, 2));
      
      // Get user to check organization
      const user = await storage.getUser(userId);
      let organizationId = user?.organizationId;
      
      // If user doesn't have an organization, create a default one
      if (!organizationId) {
        try {
          const defaultOrg = await storage.createOrganization({
            name: "Default Organization",
            domain: "default.local",
            settings: {}
          });
          organizationId = defaultOrg.id;
          
          // Update user with the organization
          await storage.upsertUser({
            id: userId,
            email: (req as any).user.email,
            firstName: (req as any).user.firstName,
            lastName: (req as any).user.lastName,
            organizationId: organizationId,
            role: "researcher"
          });
        } catch (orgError) {
          console.error("Error creating default organization:", orgError);
          return res.status(500).json({ message: "Failed to setup user organization" });
        }
      }
      
      // Validate request data
      const requestData = { ...req.body, organizationId };
      const result = insertProjectSchema.safeParse(requestData);
      if (!result.success) {
        console.log("Validation failed:", result.error);
        const errorMessage = fromZodError(result.error).toString();
        return res.status(400).json({ message: errorMessage });
      }
      
      const projectData = {
        ...result.data,
        createdBy: userId,
        // Sanitize HTML content if present
        description: sanitizeHtml(result.data.description),
        scope: sanitizeHtml(result.data.scope),
        methodology: sanitizeHtml(result.data.methodology)
      };
      
      const project = await storage.createProject(projectData);
      
      // Add the creator as a project member with edit permissions
      await storage.addProjectMember(project.id, userId, true);
      
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Finding routes
  app.get('/api/projects/:projectId/findings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const hasAccess = await storage.hasProjectAccess(userId, req.params.projectId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const findings = await storage.getFindingsByProject(req.params.projectId);
      res.json(findings);
    } catch (error) {
      console.error("Error fetching findings:", error);
      res.status(500).json({ message: "Failed to fetch findings" });
    }
  });

  app.get('/api/findings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const finding = await storage.getFinding(req.params.id);
      if (!finding) {
        return res.status(404).json({ message: "Finding not found" });
      }
      
      // Verify user has access to the parent project
      const hasAccess = await storage.hasProjectAccess(userId, finding.projectId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(finding);
    } catch (error) {
      console.error("Error fetching finding:", error);
      res.status(500).json({ message: "Failed to fetch finding" });
    }
  });

  // Get all findings for a user across all projects
  app.get('/api/findings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const findings = await storage.getFindingsByUser(userId);
      res.json(findings);
    } catch (error) {
      console.error("Error fetching user findings:", error);
      res.status(500).json({ message: "Failed to fetch findings" });
    }
  });

  app.post('/api/projects/:projectId/findings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const hasAccess = await storage.hasProjectAccess(userId, req.params.projectId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const findingData = {
        ...req.body,
        projectId: req.params.projectId,
        createdBy: userId
      };
      
      // Validate request data
      const result = insertFindingSchema.safeParse(findingData);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid finding data",
          errors: validationError.message 
        });
      }
      
      // Sanitize HTML content before storing
      const sanitizedData = {
        ...result.data,
        descriptionHtml: sanitizeHtml(result.data.descriptionHtml),
        stepsHtml: sanitizeHtml(result.data.stepsHtml),
        impactHtml: sanitizeHtml(result.data.impactHtml),
        fixHtml: sanitizeHtml(result.data.fixHtml),
      };
      
      const finding = await storage.createFinding(sanitizedData);
      res.status(201).json(finding);
    } catch (error) {
      console.error("Error creating finding:", error);
      res.status(500).json({ message: "Failed to create finding" });
    }
  });

  // Update finding
  app.patch('/api/findings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const finding = await storage.getFinding(req.params.id);
      if (!finding) {
        return res.status(404).json({ message: "Finding not found" });
      }
      
      // Verify user has access to the parent project
      const hasAccess = await storage.hasProjectAccess(userId, finding.projectId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create activity log for the change
      const oldValues = { 
        title: finding.title, 
        status: finding.status,
        descriptionHtml: finding.descriptionHtml,
        stepsHtml: finding.stepsHtml,
        impactHtml: finding.impactHtml,
        fixHtml: finding.fixHtml,
      };
      
      // Sanitize HTML content in the update data
      const sanitizedUpdateData = { ...req.body };
      if (sanitizedUpdateData.descriptionHtml !== undefined) {
        sanitizedUpdateData.descriptionHtml = sanitizeHtml(sanitizedUpdateData.descriptionHtml);
      }
      if (sanitizedUpdateData.stepsHtml !== undefined) {
        sanitizedUpdateData.stepsHtml = sanitizeHtml(sanitizedUpdateData.stepsHtml);
      }
      if (sanitizedUpdateData.impactHtml !== undefined) {
        sanitizedUpdateData.impactHtml = sanitizeHtml(sanitizedUpdateData.impactHtml);
      }
      if (sanitizedUpdateData.fixHtml !== undefined) {
        sanitizedUpdateData.fixHtml = sanitizeHtml(sanitizedUpdateData.fixHtml);
      }
      
      const updatedFinding = await storage.updateFinding(req.params.id, sanitizedUpdateData);
      
      // Log the activity
      await storage.createActivityLog({
        actorId: userId,
        action: 'updated',
        targetType: 'finding',
        targetId: req.params.id,
        oldValues,
        newValues: sanitizedUpdateData,
      });
      
      res.json(updatedFinding);
    } catch (error) {
      console.error("Error updating finding:", error);
      res.status(500).json({ message: "Failed to update finding" });
    }
  });

  // Get activity logs for a finding
  app.get('/api/findings/:id/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const finding = await storage.getFinding(req.params.id);
      if (!finding) {
        return res.status(404).json({ message: "Finding not found" });
      }
      
      // Verify user has access to the parent project
      const hasAccess = await storage.hasProjectAccess(userId, finding.projectId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const activities = await storage.getActivityLogsByFinding(req.params.id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Get comments for a finding
  app.get('/api/findings/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const finding = await storage.getFinding(req.params.id);
      if (!finding) {
        return res.status(404).json({ message: "Finding not found" });
      }
      
      // Verify user has access to the parent project
      const hasAccess = await storage.hasProjectAccess(userId, finding.projectId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const comments = await storage.getCommentsByFinding(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create comment for a finding
  app.post('/api/findings/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const finding = await storage.getFinding(req.params.id);
      if (!finding) {
        return res.status(404).json({ message: "Finding not found" });
      }
      
      // Verify user has access to the parent project
      const hasAccess = await storage.hasProjectAccess(userId, finding.projectId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const commentData = {
        ...req.body,
        findingId: req.params.id,
        authorId: userId
      };
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Project credentials routes
  app.get('/api/projects/:projectId/credentials', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const credentials = await storage.getCredentialsByProject(req.params.projectId);
      res.json(credentials);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });

  app.post('/api/projects/:projectId/credentials', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const credentialData = {
        ...req.body,
        projectId: req.params.projectId,
        createdBy: userId
      };
      
      // Validate request data
      const result = insertCredentialSchema.safeParse(credentialData);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid credential data",
          errors: validationError.message 
        });
      }
      
      const credential = await storage.createCredential(result.data);
      res.status(201).json(credential);
    } catch (error) {
      console.error("Error creating credential:", error);
      res.status(500).json({ message: "Failed to create credential" });
    }
  });

  // Postman collections routes
  app.get('/api/projects/:projectId/postman-collections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const collections = await storage.getPostmanCollectionsByProject(req.params.projectId);
      res.json(collections);
    } catch (error) {
      console.error("Error fetching postman collections:", error);
      res.status(500).json({ message: "Failed to fetch postman collections" });
    }
  });

  app.post('/api/projects/:projectId/postman-collections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const collectionData = {
        ...req.body,
        projectId: req.params.projectId,
        uploadedBy: userId
      };
      
      // Validate request data
      const result = insertPostmanCollectionSchema.safeParse(collectionData);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid postman collection data",
          errors: validationError.message 
        });
      }
      
      const collection = await storage.createPostmanCollection(result.data);
      res.status(201).json(collection);
    } catch (error) {
      console.error("Error creating postman collection:", error);
      res.status(500).json({ message: "Failed to create postman collection" });
    }
  });

  // Report export routes
  app.get('/api/projects/:projectId/exports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const exports = await storage.getReportExportsByProject(req.params.projectId);
      res.json(exports);
    } catch (error) {
      console.error("Error fetching report exports:", error);
      res.status(500).json({ message: "Failed to fetch report exports" });
    }
  });

  app.post('/api/projects/:projectId/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const exportData = {
        ...req.body,
        projectId: req.params.projectId,
        exportedBy: userId,
        format: 'pdf', // Default format
        filename: `${req.body.reportName || 'report'}.pdf`,
        filePath: `/exports/${req.params.projectId}/${Date.now()}.pdf`,
        checksum: 'pending' // Will be updated after file generation
      };
      
      // Validate request data
      const result = insertReportExportSchema.safeParse(exportData);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid export data",
          errors: validationError.message 
        });
      }
      
      const exportRecord = await storage.createReportExport(result.data);
      res.status(201).json(exportRecord);
    } catch (error) {
      console.error("Error creating report export:", error);
      res.status(500).json({ message: "Failed to create report export" });
    }
  });

  // User Management Routes
  // Role management routes
  app.get('/api/roles', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }
      
      const roles = await storage.getRolesByOrganization(user.organizationId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post('/api/roles', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      const parseResult = insertRoleSchema.safeParse({
        ...req.body,
        organizationId: user.organizationId
      });

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid role data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      const role = await storage.createRole(parseResult.data);
      
      // Add permissions if provided
      if (req.body.permissions && Array.isArray(req.body.permissions)) {
        for (const permission of req.body.permissions) {
          await storage.addRolePermission({
            roleId: role.id,
            permission
          });
        }
      }

      res.json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.put('/api/roles/:id', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      // Verify role belongs to user's organization
      const existingRole = await storage.getRole(req.params.id);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }
      if (existingRole.organizationId !== user.organizationId) {
        return res.status(403).json({ message: "Cannot modify roles from other organizations" });
      }

      // Validate the update data - exclude organizationId to prevent org changes
      const updateSchema = insertRoleSchema.omit({ organizationId: true }).partial();
      const parseResult = updateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid role update data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      const role = await storage.updateRole(req.params.id, parseResult.data);
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete('/api/roles/:id', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      // Verify role belongs to user's organization
      const existingRole = await storage.getRole(req.params.id);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }
      if (existingRole.organizationId !== user.organizationId) {
        return res.status(403).json({ message: "Cannot delete roles from other organizations" });
      }

      await storage.deleteRole(req.params.id);
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Role permissions routes
  app.get('/api/roles/:id/permissions', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const permissions = await storage.getRolePermissions(req.params.id);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post('/api/roles/:id/permissions', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const parseResult = insertRolePermissionSchema.safeParse({
        roleId: req.params.id,
        permission: req.body.permission
      });

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid permission data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      const rolePermission = await storage.addRolePermission(parseResult.data);
      res.json(rolePermission);
    } catch (error) {
      console.error("Error adding role permission:", error);
      res.status(500).json({ message: "Failed to add role permission" });
    }
  });

  app.delete('/api/roles/:id/permissions/:permission', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      await storage.removeRolePermission(req.params.id, req.params.permission);
      res.json({ message: "Permission removed successfully" });
    } catch (error) {
      console.error("Error removing role permission:", error);
      res.status(500).json({ message: "Failed to remove role permission" });
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, hasPermission('manage_users'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }
      
      const users = await storage.getUsersByOrganization(user.organizationId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users/:id/roles', isAuthenticated, hasPermission('manage_users'), async (req: any, res) => {
    try {
      const parseResult = insertUserRoleSchema.safeParse({
        userId: req.params.id,
        roleId: req.body.roleId,
        assignedBy: (req as any).user.id
      });

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid user role data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      const userRole = await storage.assignUserRole(parseResult.data);
      res.json(userRole);
    } catch (error) {
      console.error("Error assigning user role:", error);
      res.status(500).json({ message: "Failed to assign user role" });
    }
  });

  app.delete('/api/users/:userId/roles/:roleId', isAuthenticated, hasPermission('manage_users'), async (req: any, res) => {
    try {
      await storage.removeUserRole(req.params.userId, req.params.roleId);
      res.json({ message: "User role removed successfully" });
    } catch (error) {
      console.error("Error removing user role:", error);
      res.status(500).json({ message: "Failed to remove user role" });
    }
  });

  app.get('/api/users/:id/roles', isAuthenticated, async (req: any, res) => {
    try {
      const userRoles = await storage.getUserRoles(req.params.id);
      res.json(userRoles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  // User listing and management routes
  app.get('/api/users', isAuthenticated, hasPermission('manage_users'), async (req: any, res) => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      const users = await storage.getUsersByOrganization(currentUser.organizationId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create user directly with auto-generated password
  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = (req as any).user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      // Check if user has permission (super admin or manage_users permission)
      if (currentUser?.role !== 'super_admin') {
        const permissions = await storage.getUserPermissions(currentUserId);
        if (!permissions.has('manage_users')) {
          return res.status(403).json({ message: "Insufficient permissions to create users" });
        }
      }

      if (!currentUser?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      // Validate input using Zod schema for user creation with custom role
      const createUserWithRoleSchema = z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.string().min(1), // This will be a role ID
      });

      const validationResult = createUserWithRoleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: validationResult.error.errors 
        });
      }

      const { email, firstName, lastName, role: roleId } = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Verify the role exists and belongs to the organization
      const role = await storage.getRole(roleId);
      if (!role || role.organizationId !== currentUser.organizationId) {
        return res.status(400).json({ message: "Invalid role or role not found in organization" });
      }

      // Generate cryptographically secure random 16-character password
      const generatePassword = async () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const { randomBytes } = await import('crypto');
        const bytes = randomBytes(16);
        let password = '';
        for (let i = 0; i < 16; i++) {
          password += chars.charAt(bytes[i] % chars.length);
        }
        return password;
      };

      const plainPassword = await generatePassword();
      const passwordHash = await hashPassword(plainPassword);

      // Create user data with default base role
      const userData = {
        email,
        firstName,
        lastName,
        passwordHash,
        organizationId: currentUser.organizationId,
        role: 'researcher' as any, // Default base role
        isActive: true,
      };

      // Create the user directly
      const newUser = await storage.upsertUser(userData);

      // Assign the custom role to the user
      await storage.assignUserRole({
        userId: newUser.id,
        roleId: roleId,
        assignedBy: currentUserId,
      });

      // Remove password hash from response and include plain password
      const { passwordHash: _, ...userResponse } = newUser;
      const response = {
        message: "User created successfully",
        user: userResponse,
        password: plainPassword
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/permissions', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.get('/api/role-permissions', isAuthenticated, hasPermission('manage_roles'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      const rolePermissions = await storage.getRolePermissionsByOrganization(user.organizationId);
      res.json(rolePermissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.get('/api/user-roles', isAuthenticated, hasPermission('manage_users'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      const userRoles = await storage.getUserRolesByOrganization(user.organizationId);
      res.json(userRoles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  // Template management routes
  app.get('/api/templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }
      
      const templates = await storage.getTemplatesByOrganization(user.organizationId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post('/api/templates', isAuthenticated, hasPermission('export_reports'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      const parseResult = insertTemplateSchema.safeParse({
        ...req.body,
        organizationId: user.organizationId,
        createdBy: userId
      });

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid template data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      // Sanitize template content to prevent XSS
      const sanitizedData = {
        ...parseResult.data,
        content: sanitizeHtml(parseResult.data.content)
      };

      const template = await storage.createTemplate(sanitizedData);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.get('/api/templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if template belongs to user's organization
      if (template.organizationId !== user.organizationId) {
        return res.status(403).json({ message: "Cannot access templates from other organizations" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.put('/api/templates/:id', isAuthenticated, hasPermission('export_reports'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      // Verify template belongs to user's organization
      const existingTemplate = await storage.getTemplate(req.params.id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      if (existingTemplate.organizationId !== user.organizationId) {
        return res.status(403).json({ message: "Cannot modify templates from other organizations" });
      }

      // Validate the update data - only allow specific fields to be updated
      const updateSchema = insertTemplateSchema.pick({ 
        name: true, 
        description: true, 
        content: true, 
        type: true, 
        isDefault: true, 
        version: true 
      }).partial();
      const parseResult = updateSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid template update data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      // Sanitize template content to prevent XSS if content is being updated
      const sanitizedData = {
        ...parseResult.data,
        ...(parseResult.data.content && { content: sanitizeHtml(parseResult.data.content) })
      };

      const template = await storage.updateTemplate(req.params.id, sanitizedData);
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete('/api/templates/:id', isAuthenticated, hasPermission('export_reports'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      // Verify template belongs to user's organization
      const existingTemplate = await storage.getTemplate(req.params.id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      if (existingTemplate.organizationId !== user.organizationId) {
        return res.status(403).json({ message: "Cannot delete templates from other organizations" });
      }

      await storage.deleteTemplate(req.params.id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // User invitation routes
  app.get('/api/invitations', isAuthenticated, hasPermission('invite_users'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }
      
      const invitations = await storage.getUserInvitations(user.organizationId);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });


  app.post('/api/invitations', isAuthenticated, hasPermission('invite_users'), async (req: any, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "User must belong to an organization" });
      }

      // Generate a unique token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const parseResult = insertUserInvitationSchema.safeParse({
        email: req.body.email,
        organizationId: user.organizationId,
        roleId: req.body.roleId,
        invitedBy: userId,
        token,
        expiresAt
      });

      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid invitation data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      const invitation = await storage.createUserInvitation(parseResult.data);
      res.json({ ...invitation, invitationUrl: `${req.protocol}://${req.get('host')}/accept-invitation?token=${token}` });
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.post('/api/invitations/:token/accept', async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "Email, password, first name, and last name are required" 
        });
      }

      // Get invitation by token
      const invitation = await storage.getInvitationByToken(req.params.token);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found or expired" });
      }

      // Check if invitation has expired
      if (invitation.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invitation has expired" });
      }

      // Check if invitation email matches provided email
      if (invitation.email !== email) {
        return res.status(400).json({ message: "Email does not match invitation" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash the password
      const passwordHash = await hashPassword(password);

      // Create user with invitation data
      const userData = {
        email,
        firstName,
        lastName,
        passwordHash,
        organizationId: invitation.organizationId,
        role: "researcher" as const, // Default role, can be changed by role assignment
        isActive: true,
      };

      // Validate user data
      const parseResult = insertUserSchema.safeParse(userData);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid user data",
          error: fromZodError(parseResult.error).toString()
        });
      }

      // Create the user
      const user = await storage.upsertUser(parseResult.data);

      // Assign the role from invitation
      if (invitation.roleId) {
        await storage.assignUserRole({
          userId: user.id,
          roleId: invitation.roleId,
          assignedBy: invitation.invitedBy,
        });
      }

      // Mark invitation as used
      await storage.markInvitationAsUsed(req.params.token, user.id);

      // Create session for the new user
      (req as any).session.userId = user.id;

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;
      res.status(201).json({
        message: "Account created successfully",
        user: userResponse
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
