import {
  users,
  organizations,
  projects,
  findings,
  projectMembers,
  evidenceAttachments,
  comments,
  reportTemplates,
  reportExports,
  activityLogs,
  projectCredentials,
  postmanCollections,
  type User,
  type UpsertUser,
  type Organization,
  type Project,
  type Finding,
  type ProjectMember,
  type EvidenceAttachment,
  type Comment,
  type ReportTemplate,
  type ReportExport,
  type ActivityLog,
  type ProjectCredential,
  type PostmanCollection,
  type InsertOrganization,
  type InsertProject,
  type InsertFinding,
  type InsertEvidence,
  type InsertComment,
  type InsertTemplate,
  type InsertCredential,
  type InsertPostmanCollection,
  type InsertReportExport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations - following Replit Auth requirements
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organization operations
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByOrganization(orgId: string): Promise<Project[]>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  addProjectMember(projectId: string, userId: string, canEdit?: boolean): Promise<ProjectMember>;
  
  // Project credential operations
  createCredential(credential: InsertCredential): Promise<ProjectCredential>;
  getCredentialsByProject(projectId: string): Promise<ProjectCredential[]>;
  
  // Postman collection operations
  createPostmanCollection(collection: InsertPostmanCollection): Promise<PostmanCollection>;
  getPostmanCollectionsByProject(projectId: string): Promise<PostmanCollection[]>;
  
  // Report export operations
  createReportExport(reportExport: InsertReportExport): Promise<ReportExport>;
  getReportExportsByProject(projectId: string): Promise<ReportExport[]>;
  
  // Finding operations
  createFinding(finding: InsertFinding): Promise<Finding>;
  getFinding(id: string): Promise<Finding | undefined>;
  getFindingsByProject(projectId: string): Promise<Finding[]>;
  updateFinding(id: string, updates: Partial<InsertFinding>): Promise<Finding>;
  
  // Evidence operations
  addEvidence(evidence: InsertEvidence): Promise<EvidenceAttachment>;
  getEvidenceByFinding(findingId: string): Promise<EvidenceAttachment[]>;
  
  // Comment operations
  addComment(comment: InsertComment): Promise<Comment>;
  getCommentsByFinding(findingId: string): Promise<Comment[]>;
  
  // Template operations
  createTemplate(template: InsertTemplate): Promise<ReportTemplate>;
  getTemplatesByOrganization(orgId: string): Promise<ReportTemplate[]>;
  
  // Activity logging
  logActivity(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ): Promise<ActivityLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Organization operations
  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(orgData).returning();
    return org;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  // Project operations
  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByOrganization(orgId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.organizationId, orgId));
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId))
      .then(results => results.map(r => r.projects));
  }

  async addProjectMember(projectId: string, userId: string, canEdit = false): Promise<ProjectMember> {
    const [member] = await db
      .insert(projectMembers)
      .values({ projectId, userId, canEdit })
      .returning();
    return member;
  }

  // Finding operations
  async createFinding(findingData: InsertFinding): Promise<Finding> {
    const [finding] = await db.insert(findings).values(findingData).returning();
    return finding;
  }

  // Project credential operations
  async createCredential(credentialData: InsertCredential): Promise<ProjectCredential> {
    const [credential] = await db.insert(projectCredentials).values(credentialData).returning();
    return credential;
  }

  async getCredentialsByProject(projectId: string): Promise<ProjectCredential[]> {
    return await db
      .select()
      .from(projectCredentials)
      .where(eq(projectCredentials.projectId, projectId));
  }

  // Postman collection operations
  async createPostmanCollection(collectionData: InsertPostmanCollection): Promise<PostmanCollection> {
    const [collection] = await db.insert(postmanCollections).values(collectionData).returning();
    return collection;
  }

  async getPostmanCollectionsByProject(projectId: string): Promise<PostmanCollection[]> {
    return await db
      .select()
      .from(postmanCollections)
      .where(eq(postmanCollections.projectId, projectId));
  }

  // Report export operations
  async createReportExport(reportExportData: InsertReportExport): Promise<ReportExport> {
    const [reportExport] = await db.insert(reportExports).values(reportExportData).returning();
    return reportExport;
  }

  async getReportExportsByProject(projectId: string): Promise<ReportExport[]> {
    return await db
      .select()
      .from(reportExports)
      .where(eq(reportExports.projectId, projectId));
  }

  async getFinding(id: string): Promise<Finding | undefined> {
    const [finding] = await db.select().from(findings).where(eq(findings.id, id));
    return finding;
  }

  async getFindingsByProject(projectId: string): Promise<Finding[]> {
    return await db
      .select()
      .from(findings)
      .where(eq(findings.projectId, projectId))
      .orderBy(desc(findings.createdAt));
  }

  async updateFinding(id: string, updates: Partial<InsertFinding>): Promise<Finding> {
    const [finding] = await db
      .update(findings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(findings.id, id))
      .returning();
    return finding;
  }

  // Evidence operations
  async addEvidence(evidenceData: InsertEvidence): Promise<EvidenceAttachment> {
    const [evidence] = await db.insert(evidenceAttachments).values(evidenceData).returning();
    return evidence;
  }

  async getEvidenceByFinding(findingId: string): Promise<EvidenceAttachment[]> {
    return await db
      .select()
      .from(evidenceAttachments)
      .where(eq(evidenceAttachments.findingId, findingId));
  }

  // Comment operations
  async addComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async getCommentsByFinding(findingId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.findingId, findingId))
      .orderBy(desc(comments.createdAt));
  }

  // Template operations
  async createTemplate(templateData: InsertTemplate): Promise<ReportTemplate> {
    const [template] = await db.insert(reportTemplates).values(templateData).returning();
    return template;
  }

  async getTemplatesByOrganization(orgId: string): Promise<ReportTemplate[]> {
    return await db
      .select()
      .from(reportTemplates)
      .where(eq(reportTemplates.organizationId, orgId));
  }

  // Activity logging
  async logActivity(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values({
        actorId,
        action,
        targetType,
        targetId,
        oldValues,
        newValues,
        metadata,
      })
      .returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
