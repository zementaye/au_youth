import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------- Enums (as string unions, enforced in app code) ----------
export const SYSTEM_ROLES = ["SUPER_ADMIN", "DEPT_ADMIN", "POSTER", "MEMBER"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const PROGRAM_TYPES = ["INTERN", "VOLUNTEER", "FELLOW"] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

export const PROFICIENCIES = ["BEGINNER", "INTERMEDIATE", "EXPERT"] as const;
export type Proficiency = (typeof PROFICIENCIES)[number];

export const HELP_STATUSES = ["OPEN", "CLAIMED", "RESOLVED"] as const;
export type HelpStatus = (typeof HELP_STATUSES)[number];

// ---------- Department ----------
export const departments = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  deptAdminId: text("dept_admin_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// ---------- User ----------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  profilePhotoUrl: text("profile_photo_url"),
  departmentId: text("department_id").references(() => departments.id),
  programType: text("program_type").$type<ProgramType>(),
  title: text("title"),
  bio: text("bio"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  github: text("github"),
  portfolio: text("portfolio"),
  systemRole: text("system_role").$type<SystemRole>().notNull().default("MEMBER"),
  isPoster: boolean("is_poster").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  verifyToken: text("verify_token"),
  verifyTokenExpiresAt: timestamp("verify_token_expires_at", { withTimezone: true }),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// ---------- Skill ----------
export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
});

// ---------- UserSkill (join table) ----------
export const userSkills = pgTable(
  "user_skills",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
    proficiency: text("proficiency").$type<Proficiency>().notNull().default("INTERMEDIATE"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.skillId] }),
  })
);

// ---------- Post (Update/Announcement) ----------
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  departmentId: text("department_id").references(() => departments.id), // null = platform-wide
  attachmentUrl: text("attachment_url"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// ---------- HelpRequest ----------
export const helpRequests = pgTable("help_requests", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requestedById: text("requested_by_id").notNull().references(() => users.id),
  departmentId: text("department_id").references(() => departments.id),
  status: text("status").$type<HelpStatus>().notNull().default("OPEN"),
  claimedById: text("claimed_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const helpRequestSkills = pgTable(
  "help_request_skills",
  {
    helpRequestId: text("help_request_id").notNull().references(() => helpRequests.id, { onDelete: "cascade" }),
    skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.helpRequestId, t.skillId] }),
  })
);

// ---------- Notification ----------
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// ---------- Audit Log ----------
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// ---------- Sessions (simple cookie-based auth) ----------
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// ---------- Rate limiting (login/signup abuse guard) ----------
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(), // e.g. "login:1.2.3.4" or "signup:email@x.com"
  count: integer("count").notNull().default(0),
  windowStart: text("window_start").notNull(),
});

// ---------- Dev email outbox (stand-in for Resend/SendGrid) ----------
export const devEmails = pgTable("dev_emails", {
  id: text("id").primaryKey(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// ---------- Relations ----------
export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, { fields: [users.departmentId], references: [departments.id] }),
  userSkills: many(userSkills),
  posts: many(posts),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  members: many(users),
  posts: many(posts),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));

export const helpRequestsRelations = relations(helpRequests, ({ one, many }) => ({
  requestedBy: one(users, { fields: [helpRequests.requestedById], references: [users.id] }),
  claimedBy: one(users, { fields: [helpRequests.claimedById], references: [users.id] }),
  department: one(departments, { fields: [helpRequests.departmentId], references: [departments.id] }),
  requiredSkills: many(helpRequestSkills),
}));
