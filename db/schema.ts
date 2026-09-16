import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const issueStatus = pgEnum("issue_status", [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
]);

export const issuePriority = pgEnum("issue_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const issues = pgTable("issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  status: issueStatus("status").default("backlog").notNull(),
  priority: issuePriority("priority").default("medium").notNull(),
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

export const usersRelations = relations(users, ({ many }) => ({
  assignedIssues: many(issues),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const issuesRelations = relations(issues, ({ one }) => ({
  assignee: one(users, {
    fields: [issues.assigneeId],
    references: [users.id],
  }),
}));
