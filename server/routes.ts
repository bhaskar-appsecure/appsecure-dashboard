import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertFindingSchema, 
  insertCredentialSchema, 
  insertPostmanCollectionSchema, 
  insertReportExportSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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
      if (project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Finding routes
  app.get('/api/projects/:projectId/findings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
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
      const project = await storage.getProject(finding.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(finding);
    } catch (error) {
      console.error("Error fetching finding:", error);
      res.status(500).json({ message: "Failed to fetch finding" });
    }
  });

  app.post('/api/projects/:projectId/findings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify user has access to this project first
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.createdBy !== userId) {
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
      
      const finding = await storage.createFinding(result.data);
      res.status(201).json(finding);
    } catch (error) {
      console.error("Error creating finding:", error);
      res.status(500).json({ message: "Failed to create finding" });
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
