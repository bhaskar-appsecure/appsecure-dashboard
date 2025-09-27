import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
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
      const findings = await storage.getFindingsByProject(req.params.projectId);
      res.json(findings);
    } catch (error) {
      console.error("Error fetching findings:", error);
      res.status(500).json({ message: "Failed to fetch findings" });
    }
  });

  app.get('/api/findings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const finding = await storage.getFinding(req.params.id);
      if (!finding) {
        return res.status(404).json({ message: "Finding not found" });
      }
      res.json(finding);
    } catch (error) {
      console.error("Error fetching finding:", error);
      res.status(500).json({ message: "Failed to fetch finding" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
