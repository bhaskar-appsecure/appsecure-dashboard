import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  real,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "researcher",
  "project_user",
  "customer_admin",
  "org_admin",
  "super_admin",
]);

export const permissionEnum = pgEnum("permission", [
  "view_assigned_projects",
  "submit_finding",
  "view_finding",
  "edit_finding",
  "edit_comment",
  "view_comment",
  "invite_users",
  "create_projects",
  "edit_projects",
  "export_reports",
  "view_all_projects",
  "manage_users",
  "manage_roles",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planned",
  "in_progress",
  "complete",
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "draft",
  "submitted",
  "company_review",
  "remediation_in_progress",
  "ready_for_retest",
  "verified_fixed",
  "risk_accepted",
  "closed",
]);

export const severityEnum = pgEnum("severity", [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
]);

export const templateTypeEnum = pgEnum("template_type", [
  "html",
  "docx", 
  "markdown",
]);

export const credentialTypeEnum = pgEnum("credential_type", [
  "user",
  "admin", 
  "service",
]);

export const reportTemplateTypeEnum = pgEnum("report_template_type", [
  "web",
  "mobile",
  "network",
  "cloud",
  "api",
]);

// Core entities
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  domain: text("domain"),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  organizationId: varchar("organization_id").references(() => organizations.id),
  role: userRoleEnum("role").notNull().default("researcher"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  customerName: text("customer_name").notNull(),
  scope: text("scope"),
  methodology: text("methodology"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: projectStatusEnum("status").notNull().default("planned"),
  organizationId: varchar("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectMembers = pgTable("project_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  canEdit: boolean("can_edit").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const findings = pgTable("findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  descriptionHtml: text("description_html"),
  stepsHtml: text("steps_html"),
  impactHtml: text("impact_html"),
  fixHtml: text("fix_html"),
  references: text("references").array().default([]),
  affectedAssets: text("affected_assets").array().default([]),
  tags: text("tags").array().default([]),
  cvssVector: text("cvss_vector"),
  cvssScore: real("cvss_score"),
  severity: severityEnum("severity"),
  manualSeverityOverride: text("manual_severity_override"),
  status: findingStatusEnum("status").notNull().default("draft"),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  isDuplicate: boolean("is_duplicate").default(false),
  duplicateOf: varchar("duplicate_of"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const evidenceAttachments = pgTable("evidence_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  findingId: varchar("finding_id")
    .references(() => findings.id, { onDelete: "cascade" })
    .notNull(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  fileHash: text("file_hash").notNull(),
  caption: text("caption"),
  description: text("description"),
  uploadedBy: varchar("uploaded_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  findingId: varchar("finding_id")
    .references(() => findings.id, { onDelete: "cascade" })
    .notNull(),
  authorId: varchar("author_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").default(false),
  mentions: text("mentions").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportTemplates = pgTable("report_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: templateTypeEnum("type").notNull(),
  content: text("content").notNull(),
  variables: jsonb("variables").default([]),
  organizationId: varchar("organization_id").references(() => organizations.id),
  customerId: varchar("customer_id"),
  isDefault: boolean("is_default").default(false),
  version: integer("version").default(1),
  createdBy: varchar("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectCredentials = pgTable("project_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  type: credentialTypeEnum("type").notNull(),
  username: text("username"),
  password: text("password"),
  environment: text("environment").notNull(),
  description: text("description"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const postmanCollections = pgTable("postman_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reportExports = pgTable("report_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id")
    .references(() => projects.id)
    .notNull(),
  templateId: varchar("template_id")
    .references(() => reportTemplates.id)
    .notNull(),
  reportName: text("report_name").notNull(),
  reportScope: text("report_scope"),
  templateType: reportTemplateTypeEnum("template_type").notNull(),
  executiveSummary: text("executive_summary"),
  format: text("format").notNull(),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  checksum: text("checksum").notNull(),
  metadata: jsonb("metadata").default({}),
  exportedBy: varchar("exported_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id")
    .references(() => users.id)
    .notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role and Permission Management
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  organizationId: varchar("organization_id")
    .references(() => organizations.id)
    .notNull(),
  isSystemRole: boolean("is_system_role").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  permission: permissionEnum("permission").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  roleId: varchar("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userInvitations = pgTable("user_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  organizationId: varchar("organization_id")
    .references(() => organizations.id)
    .notNull(),
  roleId: varchar("role_id")
    .references(() => roles.id)
    .notNull(),
  invitedBy: varchar("invited_by")
    .references(() => users.id)
    .notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  templates: many(reportTemplates),
  roles: many(roles),
  invitations: many(userInvitations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  createdProjects: many(projects),
  projectMemberships: many(projectMembers),
  findings: many(findings),
  comments: many(comments),
  uploads: many(evidenceAttachments),
  templates: many(reportTemplates),
  exports: many(reportExports),
  activities: many(activityLogs),
  roleAssignments: many(userRoles),
  sentInvitations: many(userInvitations),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  members: many(projectMembers),
  findings: many(findings),
  exports: many(reportExports),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const findingsRelations = relations(findings, ({ one, many }) => ({
  project: one(projects, {
    fields: [findings.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [findings.createdBy],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [findings.assignedTo],
    references: [users.id],
  }),
  duplicateOf: one(findings, {
    fields: [findings.duplicateOf],
    references: [findings.id],
  }),
  evidence: many(evidenceAttachments),
  comments: many(comments),
}));

export const evidenceAttachmentsRelations = relations(
  evidenceAttachments,
  ({ one }) => ({
    finding: one(findings, {
      fields: [evidenceAttachments.findingId],
      references: [findings.id],
    }),
    uploadedBy: one(users, {
      fields: [evidenceAttachments.uploadedBy],
      references: [users.id],
    }),
  })
);

export const commentsRelations = relations(comments, ({ one }) => ({
  finding: one(findings, {
    fields: [comments.findingId],
    references: [findings.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const reportTemplatesRelations = relations(
  reportTemplates,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [reportTemplates.organizationId],
      references: [organizations.id],
    }),
    createdBy: one(users, {
      fields: [reportTemplates.createdBy],
      references: [users.id],
    }),
    exports: many(reportExports),
  })
);

export const reportExportsRelations = relations(reportExports, ({ one }) => ({
  project: one(projects, {
    fields: [reportExports.projectId],
    references: [projects.id],
  }),
  template: one(reportTemplates, {
    fields: [reportExports.templateId],
    references: [reportTemplates.id],
  }),
  exportedBy: one(users, {
    fields: [reportExports.exportedBy],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  actor: one(users, {
    fields: [activityLogs.actorId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  permissions: many(rolePermissions),
  userAssignments: many(userRoles),
  invitations: many(userInvitations),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedBy: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

export const userInvitationsRelations = relations(userInvitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [userInvitations.organizationId],
    references: [organizations.id],
  }),
  role: one(roles, {
    fields: [userInvitations.roleId],
    references: [roles.id],
  }),
  invitedBy: one(users, {
    fields: [userInvitations.invitedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects, {
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFindingSchema = createInsertSchema(findings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEvidenceSchema = createInsertSchema(evidenceAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCredentialSchema = createInsertSchema(projectCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostmanCollectionSchema = createInsertSchema(postmanCollections).omit({
  id: true,
  createdAt: true,
});

export const insertReportExportSchema = createInsertSchema(reportExports).omit({
  id: true,
  createdAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertUserInvitationSchema = createInsertSchema(userInvitations).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type Finding = typeof findings.$inferSelect;
export type EvidenceAttachment = typeof evidenceAttachments.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type ReportExport = typeof reportExports.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type ProjectCredential = typeof projectCredentials.$inferSelect;
export type PostmanCollection = typeof postmanCollections.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type UserInvitation = typeof userInvitations.$inferSelect;

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertFinding = z.infer<typeof insertFindingSchema>;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type InsertPostmanCollection = z.infer<typeof insertPostmanCollectionSchema>;
export type InsertReportExport = z.infer<typeof insertReportExportSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type InsertUserInvitation = z.infer<typeof insertUserInvitationSchema>;

// Enum value types for frontend
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type FindingStatus = (typeof findingStatusEnum.enumValues)[number];
export type Severity = (typeof severityEnum.enumValues)[number];
export type CredentialType = (typeof credentialTypeEnum.enumValues)[number];
export type ReportTemplateType = (typeof reportTemplateTypeEnum.enumValues)[number];
export type UserRoleType = (typeof userRoleEnum.enumValues)[number];
export type Permission = (typeof permissionEnum.enumValues)[number];
