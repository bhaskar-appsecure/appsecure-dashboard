import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertFindingSchema,
  insertProjectSchema,
  insertCredentialSchema, 
  insertPostmanCollectionSchema, 
  insertReportExportSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Configure DOMPurify with a safe allowlist
const sanitizeHtml = (html: string | undefined | null): string => {
  if (!html) return '';
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link', 'meta', 'style'],
    FORBID_ATTR: ['style', 'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
            email: req.user.claims.email,
            firstName: req.user.claims.first_name,
            lastName: req.user.claims.last_name,
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
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Finding routes
  app.get('/api/projects/:projectId/findings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const findings = await storage.getFindingsByUser(userId);
      res.json(findings);
    } catch (error) {
      console.error("Error fetching user findings:", error);
      res.status(500).json({ message: "Failed to fetch findings" });
    }
  });

  app.post('/api/projects/:projectId/findings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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

  const httpServer = createServer(app);

  return httpServer;
}
