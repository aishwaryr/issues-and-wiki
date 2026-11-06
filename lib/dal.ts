import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNull,
  notInArray,
  type SQL,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  issueComments,
  issueWikiLinks,
  issues,
  users,
  wikiPages,
} from "@/db/schema";
import { lastDays } from "@/lib/dates";
import {
  ASSIGNEE_ME,
  type IssueFiltersInput,
  parseIssueKey,
  UNASSIGNED,
} from "@/lib/issues";
import { getSession } from "@/lib/session";

// Users

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
});

// Only place that selects passwordHash — auth actions only. Never return this to the client.
export async function getUserByEmail(
  email: string,
): Promise<{ id: string; email: string; passwordHash: string } | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin");
  }
  return user;
}

/** All users, sorted by name, for the assignee picker. */
export async function listUsers() {
  await requireUser();

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .orderBy(asc(users.name));
}

// Issues

/** The WHERE condition for the assignee filter ("me", unassigned, or one user). */
function assigneeCondition(
  assignee: IssueFiltersInput["assignee"],
  userId: string,
): SQL | undefined {
  if (assignee === undefined) {
    return undefined;
  }
  if (assignee === UNASSIGNED) {
    return isNull(issues.assigneeId);
  }
  return eq(issues.assigneeId, assignee === ASSIGNEE_ME ? userId : assignee);
}

/**
 * Postgres full-text search over title + description. websearch_to_tsquery takes what
 * people type ("cart -guest", "checkout OR login", "exact phrase") and never throws on
 * odd input. English stemming: "crashes" finds "crash". No GIN index yet: fine at this
 * size; an expression index on the same to_tsvector is the next step.
 */
function searchCondition(q: string | undefined): SQL | undefined {
  if (q === undefined) {
    return undefined;
  }
  return sql`to_tsvector('english', ${issues.title} || ' ' || coalesce(${issues.description}, ''))
    @@ websearch_to_tsquery('english', ${q})`;
}

/** All issues, newest first, filtered by status, priority, assignee and search words. */
export async function listIssues(filters: IssueFiltersInput = {}) {
  const user = await requireUser();

  // LEFT join keeps unassigned issues (assigneeName is null); one query, no N+1.
  return db
    .select({
      id: issues.id,
      number: issues.number,
      title: issues.title,
      status: issues.status,
      priority: issues.priority,
      createdAt: issues.createdAt,
      assigneeName: users.name,
    })
    .from(issues)
    .leftJoin(users, eq(issues.assigneeId, users.id))
    .where(
      and(
        filters.status ? eq(issues.status, filters.status) : undefined,
        filters.priority ? eq(issues.priority, filters.priority) : undefined,
        assigneeCondition(filters.assignee, user.id),
        searchCondition(filters.q),
      ),
    )
    .orderBy(desc(issues.createdAt));
}

/** One issue by its human-readable number (ISS-12 → 12), or null if missing. */
export const getIssue = cache(async (issueNumber: number) => {
  await requireUser();

  const [issue] = await db
    .select({
      id: issues.id,
      number: issues.number,
      title: issues.title,
      description: issues.description,
      status: issues.status,
      priority: issues.priority,
      assigneeId: issues.assigneeId,
      assigneeName: users.name,
      createdAt: issues.createdAt,
      updatedAt: issues.updatedAt,
    })
    .from(issues)
    .leftJoin(users, eq(issues.assigneeId, users.id))
    .where(eq(issues.number, issueNumber))
    .limit(1);

  return issue ?? null;
});

/** One issue by its URL key ("ISS-10"), or null if the key is invalid or no issue matches. */
export async function getIssueByKey(issueKey: string) {
  const issueNumber = parseIssueKey(issueKey);
  if (issueNumber === null) {
    return null;
  }
  return getIssue(issueNumber);
}

/** Comments on an issue, oldest first, with the author's name (null if the author was deleted). */
export async function listComments(issueId: string) {
  await requireUser();

  return db
    .select({
      id: issueComments.id,
      body: issueComments.body,
      createdAt: issueComments.createdAt,
      authorName: users.name,
    })
    .from(issueComments)
    .leftJoin(users, eq(issueComments.authorId, users.id))
    .where(eq(issueComments.issueId, issueId))
    .orderBy(asc(issueComments.createdAt));
}

// Dashboard

/** Issue counts per status, plus the signed-in user's open (not done or canceled) issues. */
export async function getIssueStats() {
  const user = await requireUser();

  // Aggregate in SQL: a handful of rows over the wire, not every issue.
  const [byStatus, [mine]] = await Promise.all([
    db
      .select({ status: issues.status, count: count() })
      .from(issues)
      .groupBy(issues.status),
    db
      .select({ count: count() })
      .from(issues)
      .where(
        and(
          eq(issues.assigneeId, user.id),
          notInArray(issues.status, ["done", "canceled"]),
        ),
      ),
  ]);

  return { byStatus, assignedToMe: mine?.count ?? 0 };
}

/** Issues created per UTC day over the last `days` days, oldest first; days with none are 0. */
export async function countIssuesCreatedPerDay(days: number) {
  await requireUser();

  const range = lastDays(days);
  const day = sql<string>`to_char(${issues.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
  const rows = await db
    .select({ day, count: count() })
    .from(issues)
    .where(gte(issues.createdAt, new Date(`${range[0]}T00:00:00Z`)))
    .groupBy(day);

  const counts = new Map(rows.map((row) => [row.day, row.count]));
  return range.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

/** The most recently updated issues, newest first, with the assignee's name. */
export async function listRecentIssues(limit: number) {
  await requireUser();

  return db
    .select({
      id: issues.id,
      number: issues.number,
      title: issues.title,
      status: issues.status,
      priority: issues.priority,
      updatedAt: issues.updatedAt,
      assigneeName: users.name,
    })
    .from(issues)
    .leftJoin(users, eq(issues.assigneeId, users.id))
    .orderBy(desc(issues.updatedAt))
    .limit(limit);
}

// Wiki pages

/** All wiki pages, most recently updated first, with the author's name. */
export async function listWikiPages() {
  await requireUser();

  // LEFT join keeps pages whose author was deleted (authorName is null).
  return db
    .select({
      id: wikiPages.id,
      title: wikiPages.title,
      slug: wikiPages.slug,
      authorName: users.name,
      updatedAt: wikiPages.updatedAt,
    })
    .from(wikiPages)
    .leftJoin(users, eq(wikiPages.authorId, users.id))
    .orderBy(desc(wikiPages.updatedAt));
}

/** One wiki page by its slug, or null if missing. Cached per request (page + metadata). */
export const getWikiPage = cache(async (slug: string) => {
  await requireUser();

  const [page] = await db
    .select({
      id: wikiPages.id,
      title: wikiPages.title,
      slug: wikiPages.slug,
      body: wikiPages.body,
      authorName: users.name,
      createdAt: wikiPages.createdAt,
      updatedAt: wikiPages.updatedAt,
    })
    .from(wikiPages)
    .leftJoin(users, eq(wikiPages.authorId, users.id))
    .where(eq(wikiPages.slug, slug))
    .limit(1);

  return page ?? null;
});

// Issue ↔ wiki page links

/** Wiki pages linked to an issue, by title. */
export async function listLinkedWikiPages(issueId: string) {
  await requireUser();

  return db
    .select({ id: wikiPages.id, title: wikiPages.title, slug: wikiPages.slug })
    .from(issueWikiLinks)
    .innerJoin(wikiPages, eq(issueWikiLinks.wikiPageId, wikiPages.id))
    .where(eq(issueWikiLinks.issueId, issueId))
    .orderBy(asc(wikiPages.title));
}

/** Issues linked to a wiki page, newest first. */
export async function listLinkedIssues(wikiPageId: string) {
  await requireUser();

  return db
    .select({
      id: issues.id,
      number: issues.number,
      title: issues.title,
      status: issues.status,
    })
    .from(issueWikiLinks)
    .innerJoin(issues, eq(issueWikiLinks.issueId, issues.id))
    .where(eq(issueWikiLinks.wikiPageId, wikiPageId))
    .orderBy(desc(issues.createdAt));
}
