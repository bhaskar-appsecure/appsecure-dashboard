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
  roles,
  rolePermissions,
  userRoles,
  userInvitations,
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
  type Role,
  type RolePermission,
  type UserRole,
  type UserInvitation,
  type InsertOrganization,
  type InsertProject,
  type InsertFinding,
  type InsertEvidence,
  type InsertComment,
  type InsertTemplate,
  type InsertCredential,
  type InsertPostmanCollection,
  type InsertReportExport,
  type InsertRole,
  type InsertRolePermission,
  type InsertUserRole,
  type InsertUserInvitation,
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
  getFindingsByUser(userId: string): Promise<(Finding & { project: { name: string; id: string }; reporter: { firstName: string; lastName: string } })[]>;
  updateFinding(id: string, updates: Partial<InsertFinding>): Promise<Finding>;
  
  // Activity log operations
  createActivityLog(log: any): Promise<ActivityLog>;
  getActivityLogsByFinding(findingId: string): Promise<ActivityLog[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByFinding(findingId: string): Promise<(Comment & { author: { firstName: string; lastName: string } })[]>;
  
  // Evidence operations
  addEvidence(evidence: InsertEvidence): Promise<EvidenceAttachment>;
  getEvidenceByFinding(findingId: string): Promise<EvidenceAttachment[]>;
  
  // Template operations
  createTemplate(template: InsertTemplate): Promise<ReportTemplate>;
  getTemplatesByOrganization(orgId: string): Promise<ReportTemplate[]>;
  
  // Project membership check
  hasProjectAccess(userId: string, projectId: string): Promise<boolean>;
  
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

  // Role management operations
  createRole(role: InsertRole): Promise<Role>;
  getRole(id: string): Promise<Role | undefined>;
  getRolesByOrganization(orgId: string): Promise<Role[]>;
  updateRole(id: string, updates: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  
  // Role permission operations
  addRolePermission(rolePermission: InsertRolePermission): Promise<RolePermission>;
  removeRolePermission(roleId: string, permission: string): Promise<void>;
  getRolePermissions(roleId: string): Promise<string[]>;
  
  // User role operations
  assignUserRole(userRole: InsertUserRole): Promise<UserRole>;
  removeUserRole(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<(UserRole & { role: Role })[]>;
  getUsersByRole(roleId: string): Promise<(UserRole & { user: User })[]>;
  
  // User invitation operations
  createUserInvitation(invitation: InsertUserInvitation): Promise<UserInvitation>;
  getUserInvitations(organizationId: string): Promise<(UserInvitation & { role: Role; invitedByUser: User })[]>;
  getInvitationByToken(token: string): Promise<UserInvitation | undefined>;
  acceptInvitation(token: string, userId: string): Promise<UserRole>;
  
  // User management operations
  getUsersByOrganization(organizationId: string): Promise<(User & { roles: Role[] })[]>;
  updateUserRole(userId: string, organizationId: string, newRole: string): Promise<UserRole>;
  removeUserFromOrganization(userId: string, organizationId: string): Promise<void>;
  
  // Performance optimization - get all user permissions in one query
  getUserPermissions(userId: string): Promise<Set<string>>;
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
    const results = await db
      .select()
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));
    
    return results.map(r => r.projects);
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

  async getFinding(id: string): Promise<(Finding & { project: { name: string; id: string }; reporter: { firstName: string; lastName: string } }) | undefined> {
    const result = await db
      .select({
        // Finding fields
        id: findings.id,
        projectId: findings.projectId,
        title: findings.title,
        descriptionHtml: findings.descriptionHtml,
        stepsHtml: findings.stepsHtml,
        impactHtml: findings.impactHtml,
        fixHtml: findings.fixHtml,
        references: findings.references,
        affectedAssets: findings.affectedAssets,
        tags: findings.tags,
        cvssVector: findings.cvssVector,
        cvssScore: findings.cvssScore,
        severity: findings.severity,
        manualSeverityOverride: findings.manualSeverityOverride,
        status: findings.status,
        createdBy: findings.createdBy,
        assignedTo: findings.assignedTo,
        isDuplicate: findings.isDuplicate,
        duplicateOf: findings.duplicateOf,
        createdAt: findings.createdAt,
        updatedAt: findings.updatedAt,
        // Project info
        projectName: projects.name,
        projectIdRef: projects.id,
        // Reporter info
        reporterFirstName: users.firstName,
        reporterLastName: users.lastName,
      })
      .from(findings)
      .innerJoin(projects, eq(findings.projectId, projects.id))
      .innerJoin(users, eq(findings.createdBy, users.id))
      .where(eq(findings.id, id))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    const row = result[0];
    return {
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      descriptionHtml: row.descriptionHtml,
      stepsHtml: row.stepsHtml,
      impactHtml: row.impactHtml,
      fixHtml: row.fixHtml,
      references: row.references,
      affectedAssets: row.affectedAssets,
      tags: row.tags,
      cvssVector: row.cvssVector,
      cvssScore: row.cvssScore,
      severity: row.severity,
      manualSeverityOverride: row.manualSeverityOverride,
      status: row.status,
      createdBy: row.createdBy,
      assignedTo: row.assignedTo,
      isDuplicate: row.isDuplicate,
      duplicateOf: row.duplicateOf,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      project: {
        name: row.projectName || '',
        id: row.projectIdRef || '',
      },
      reporter: {
        firstName: row.reporterFirstName || '',
        lastName: row.reporterLastName || '',
      },
    };
  }

  async getFindingsByProject(projectId: string): Promise<Finding[]> {
    return await db
      .select()
      .from(findings)
      .where(eq(findings.projectId, projectId))
      .orderBy(desc(findings.createdAt));
  }

  async getFindingsByUser(userId: string): Promise<(Finding & { project: { name: string; id: string }; reporter: { firstName: string; lastName: string } })[]> {
    const result = await db
      .select({
        // Finding fields
        id: findings.id,
        projectId: findings.projectId,
        title: findings.title,
        descriptionHtml: findings.descriptionHtml,
        stepsHtml: findings.stepsHtml,
        impactHtml: findings.impactHtml,
        fixHtml: findings.fixHtml,
        references: findings.references,
        affectedAssets: findings.affectedAssets,
        tags: findings.tags,
        cvssVector: findings.cvssVector,
        cvssScore: findings.cvssScore,
        severity: findings.severity,
        manualSeverityOverride: findings.manualSeverityOverride,
        status: findings.status,
        createdBy: findings.createdBy,
        assignedTo: findings.assignedTo,
        isDuplicate: findings.isDuplicate,
        duplicateOf: findings.duplicateOf,
        createdAt: findings.createdAt,
        updatedAt: findings.updatedAt,
        // Project info
        projectName: projects.name,
        projectIdRef: projects.id,
        // Reporter info
        reporterFirstName: users.firstName,
        reporterLastName: users.lastName,
      })
      .from(findings)
      .innerJoin(projects, eq(findings.projectId, projects.id))
      .innerJoin(users, eq(findings.createdBy, users.id))
      .where(eq(findings.createdBy, userId))
      .orderBy(desc(findings.createdAt));

    return result.map(row => ({
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      descriptionHtml: row.descriptionHtml,
      stepsHtml: row.stepsHtml,
      impactHtml: row.impactHtml,
      fixHtml: row.fixHtml,
      references: row.references,
      affectedAssets: row.affectedAssets,
      tags: row.tags,
      cvssVector: row.cvssVector,
      cvssScore: row.cvssScore,
      severity: row.severity,
      manualSeverityOverride: row.manualSeverityOverride,
      status: row.status,
      createdBy: row.createdBy,
      assignedTo: row.assignedTo,
      isDuplicate: row.isDuplicate,
      duplicateOf: row.duplicateOf,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      project: {
        name: row.projectName || '',
        id: row.projectIdRef || '',
      },
      reporter: {
        firstName: row.reporterFirstName || '',
        lastName: row.reporterLastName || '',
      },
    }));
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

  // Activity log operations
  async createActivityLog(log: any): Promise<ActivityLog> {
    const [activity] = await db.insert(activityLogs).values(log).returning();
    return activity;
  }

  async getActivityLogsByFinding(findingId: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.targetId, findingId))
      .orderBy(desc(activityLogs.createdAt));
  }

  // Comment operations
  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async getCommentsByFinding(findingId: string): Promise<(Comment & { author: { firstName: string; lastName: string } })[]> {
    const result = await db
      .select({
        id: comments.id,
        findingId: comments.findingId,
        authorId: comments.authorId,
        content: comments.content,
        isPrivate: comments.isPrivate,
        mentions: comments.mentions,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.findingId, findingId))
      .orderBy(desc(comments.createdAt));

    return result.map(row => ({
      id: row.id,
      findingId: row.findingId,
      authorId: row.authorId,
      content: row.content,
      isPrivate: row.isPrivate,
      mentions: row.mentions,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        firstName: row.authorFirstName || '',
        lastName: row.authorLastName || '',
      },
    }));
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

  // Project membership check
  async hasProjectAccess(userId: string, projectId: string): Promise<boolean> {
    // Check if user is the project creator
    const project = await db
      .select({ createdBy: projects.createdBy })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    
    if (project.length > 0 && project[0].createdBy === userId) {
      return true;
    }
    
    // Check if user is a project member
    const membership = await db
      .select()
      .from(projectMembers)
      .where(and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      ))
      .limit(1);
    
    return membership.length > 0;
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

  // Role management operations
  async createRole(roleData: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(roleData).returning();
    return role;
  }

  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRolesByOrganization(orgId: string): Promise<Role[]> {
    return await db.select().from(roles).where(eq(roles.organizationId, orgId));
  }

  async updateRole(id: string, updates: Partial<InsertRole>): Promise<Role> {
    const [role] = await db
      .update(roles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Role permission operations
  async addRolePermission(rolePermissionData: InsertRolePermission): Promise<RolePermission> {
    const [rolePermission] = await db.insert(rolePermissions).values(rolePermissionData).returning();
    return rolePermission;
  }

  async removeRolePermission(roleId: string, permission: string): Promise<void> {
    await db.delete(rolePermissions).where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permission, permission as any)
      )
    );
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const permissions = await db
      .select({ permission: rolePermissions.permission })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
    return permissions.map(p => p.permission);
  }

  // User role operations
  async assignUserRole(userRoleData: InsertUserRole): Promise<UserRole> {
    const [userRole] = await db.insert(userRoles).values(userRoleData).returning();
    return userRole;
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await db.delete(userRoles).where(
      and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId)
      )
    );
  }

  async getUserRoles(userId: string): Promise<(UserRole & { role: Role })[]> {
    const results = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    
    return results.map(row => ({
      ...row.user_roles,
      role: row.roles
    }));
  }

  async getUsersByRole(roleId: string): Promise<(UserRole & { user: User })[]> {
    const results = await db
      .select()
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .where(eq(userRoles.roleId, roleId));
    
    return results.map(row => ({
      ...row.user_roles,
      user: row.users
    }));
  }

  // User invitation operations
  async createUserInvitation(invitationData: InsertUserInvitation): Promise<UserInvitation> {
    const [invitation] = await db.insert(userInvitations).values(invitationData).returning();
    return invitation;
  }

  async getUserInvitations(organizationId: string): Promise<(UserInvitation & { role: Role; invitedByUser: User })[]> {
    const results = await db
      .select()
      .from(userInvitations)
      .innerJoin(roles, eq(userInvitations.roleId, roles.id))
      .innerJoin(users, eq(userInvitations.invitedBy, users.id))
      .where(eq(userInvitations.organizationId, organizationId));
    
    return results.map(row => ({
      ...row.user_invitations,
      role: row.roles,
      invitedByUser: row.users
    }));
  }

  async getInvitationByToken(token: string): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.token, token));
    return invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<UserRole> {
    // Get the invitation
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    // Create the user role assignment
    const userRole = await this.assignUserRole({
      userId,
      roleId: invitation.roleId,
      assignedBy: invitation.invitedBy,
    });

    // Delete the invitation
    await db.delete(userInvitations).where(eq(userInvitations.token, token));

    return userRole;
  }

  // User management operations
  async getUsersByOrganization(organizationId: string): Promise<(User & { roles: Role[] })[]> {
    const usersWithRoles = await db
      .select()
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.organizationId, organizationId));

    // Group users with their roles
    const userMap = new Map<string, User & { roles: Role[] }>();
    
    for (const row of usersWithRoles) {
      const user = row.users;
      const role = row.roles;
      
      if (!userMap.has(user.id)) {
        userMap.set(user.id, { ...user, roles: [] });
      }
      
      if (role) {
        userMap.get(user.id)!.roles.push(role);
      }
    }
    
    return Array.from(userMap.values());
  }

  async updateUserRole(userId: string, organizationId: string, newRoleId: string): Promise<UserRole> {
    // Remove existing roles for this organization
    await db.delete(userRoles).where(
      and(
        eq(userRoles.userId, userId),
        eq(roles.organizationId, organizationId)
      )
    );

    // Add new role
    return await this.assignUserRole({
      userId,
      roleId: newRoleId,
      assignedBy: userId, // For now, assuming self-assignment
    });
  }

  async removeUserFromOrganization(userId: string, organizationId: string): Promise<void> {
    // Remove all role assignments for this user in this organization
    await db.delete(userRoles).where(
      and(
        eq(userRoles.userId, userId),
        eq(roles.organizationId, organizationId)
      )
    );
  }

  // Performance optimization - get all user permissions in one query
  async getUserPermissions(userId: string): Promise<Set<string>> {
    const results = await db
      .select({ permission: rolePermissions.permission })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
      .where(eq(userRoles.userId, userId));
    
    return new Set(results.map(row => row.permission));
  }

  // Bootstrap and utility methods for super admin setup
  async bootstrapSuperAdmin(userId: string, orgId: string): Promise<void> {
    // Get the user and verify they exist
    let user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found for bootstrap");
    }

    // Security check: Verify user either has no organization or belongs to the target org
    if (user.organizationId && user.organizationId !== orgId) {
      throw new Error("User already belongs to a different organization");
    }

    // Security check: Ensure organization has no existing super admins
    const existingSuperAdmins = await db.select()
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(users.organizationId, orgId),
        eq(roles.name, "Super Admin")
      ));

    if (existingSuperAdmins.length > 0) {
      throw new Error("Organization already has a super admin. Bootstrap not allowed.");
    }

    // Security check: Ensure organization has minimal users (new org protection)
    const orgUsers = await db.select().from(users).where(eq(users.organizationId, orgId));
    if (orgUsers.length > 2) {
      throw new Error("Bootstrap only allowed for new organizations with minimal users");
    }

    // Assign user to organization if not already assigned
    if (!user.organizationId) {
      await db.update(users).set({ organizationId: orgId }).where(eq(users.id, userId));
    }

    // Create or get the "Super Admin" role for this organization
    let superAdminRole = await db.select()
      .from(roles)
      .where(and(eq(roles.name, "Super Admin"), eq(roles.organizationId, orgId)))
      .limit(1);

    if (superAdminRole.length === 0) {
      // Create the Super Admin role
      const [newRole] = await db.insert(roles).values({
        name: "Super Admin",
        description: "Full system administrator with all permissions",
        organizationId: orgId
      }).returning();
      superAdminRole = [newRole];

      // Grant all permissions to the Super Admin role
      const allPermissions = await db.select().from(permissions);
      const rolePermissions = allPermissions.map(permission => ({
        roleId: newRole.id,
        permissionId: permission.id
      }));
      
      if (rolePermissions.length > 0) {
        await db.insert(rolePermissions).values(rolePermissions);
      }
    }

    // Assign the Super Admin role to the user if not already assigned
    const existingUserRole = await db.select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, superAdminRole[0].id)))
      .limit(1);

    if (existingUserRole.length === 0) {
      await db.insert(userRoles).values({
        userId: userId,
        roleId: superAdminRole[0].id
      });
    }
  }

  async isSuperAdmin(userId: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    
    // Check if user has manage_users, manage_roles, and manage_system permissions
    const superAdminPermissions = ['manage_users', 'manage_roles', 'manage_system'];
    return superAdminPermissions.every(permission => permissions.has(permission));
  }

  // Additional RBAC query methods for API endpoints

  async getAllPermissions(): Promise<{ name: string }[]> {
    // Return all available permissions from the enum
    const allPermissions = [
      'view_assigned_projects',
      'submit_finding',
      'view_finding', 
      'edit_finding',
      'edit_comment',
      'view_comment',
      'invite_users',
      'create_projects',
      'edit_projects',
      'export_reports',
      'view_all_projects',
      'manage_users',
      'manage_roles'
    ];
    
    return allPermissions.map(permission => ({ name: permission }));
  }

  async getRolePermissionsByOrganization(organizationId: string): Promise<any[]> {
    const results = await db.select()
      .from(rolePermissions)
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .where(eq(roles.organizationId, organizationId));
    
    return results.map(result => ({
      roleId: result.role_permissions.roleId,
      permission: result.role_permissions.permission
    }));
  }

  async getUserRolesByOrganization(organizationId: string): Promise<any[]> {
    const results = await db.select()
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(users.organizationId, organizationId),
        eq(roles.organizationId, organizationId)
      ));
    
    return results.map(result => ({
      userId: result.user_roles.userId,
      roleId: result.user_roles.roleId,
      assignedAt: result.user_roles.assignedAt,
      role: result.roles
    }));
  }
}

export const storage = new DatabaseStorage();
