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

export const findings: any = pgTable("findings", {
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

export const reportExports = pgTable("report_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id")
    .references(() => projects.id)
    .notNull(),
  templateId: varchar("template_id")
    .references(() => reportTemplates.id)
    .notNull(),
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

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  templates: many(reportTemplates),
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

export const insertProjectSchema = createInsertSchema(projects).omit({
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

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertFinding = z.infer<typeof insertFindingSchema>;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
