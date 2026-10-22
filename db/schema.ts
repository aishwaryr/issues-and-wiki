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

// Users

export const users = pgTable("users", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  name: varchar("name", { length: 120 })
    .notNull(),
  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),
  passwordHash: varchar("password_hash", { length: 60 })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  wikiPages: many(wikiPages),
}));

// Issues

export const issuePriority = pgEnum("issue_priority", [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);

export const issueStatus = pgEnum("issue_status", [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
]);

// Sessions

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: varchar("token_hash", { length: 64 })
      .primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("sessions_user_id_idx")
    .on(table.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ---------- Not part of the rebuild ----------
// Wiki tables still exist in Neon. They stay here so `db:generate` sees them
// and does not write DROP TABLE. No wiki code uses them on this branch.
// TODO: add `issueWikiLinks` here once the `issues` table exists.

export const wikiPages = pgTable("wiki_pages", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  title: varchar("title", { length: 180 })
    .notNull(),
  slug: varchar("slug", { length: 200 })
    .notNull()
    .unique(),
  body: text("body")
    .default("")
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id, {
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
