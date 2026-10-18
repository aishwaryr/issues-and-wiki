import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Users

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 60 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assignedIssues: many(issues),
  sessions: many(sessions),
  wikiPages: many(wikiPages),
}));

// Issues — the enums must be declared before the table that uses them

export const issueStatus = pgEnum("issue_status", [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
]);

export const issuePriority = pgEnum("issue_priority", [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);

export const issues = pgTable("issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Human-readable key (shown as ISS-12, used in URLs). The UUID stays the
  // primary key and the target of foreign keys. Identity = Postgres assigns
  // the next number on insert; "always" means the app can't set it.
  number: integer("number").generatedAlwaysAsIdentity().notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  status: issueStatus("status").default("backlog").notNull(),
  priority: issuePriority("priority").default("none").notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const issuesRelations = relations(issues, ({ one }) => ({
  assignee: one(users, {
    fields: [issues.assigneeId],
    references: [users.id],
  }),
}));

// Sessions

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Wiki pages

export const wikiPages = pgTable("wiki_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  // URL key (/wiki/getting-started). Unique, so two pages can't share a URL.
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  // Markdown source. Empty string, not null, for a page with no body yet.
  body: text("body").default("").notNull(),
  // Set null, not cascade: deleting a user keeps the pages they wrote.
  authorId: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const wikiPagesRelations = relations(wikiPages, ({ one }) => ({
  author: one(users, {
    fields: [wikiPages.authorId],
    references: [users.id],
  }),
}));
