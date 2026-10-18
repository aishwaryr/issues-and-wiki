import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { issues, users, wikiPages } from "@/db/schema";
import type { IssueFiltersInput } from "@/lib/issues";
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

// Issues

/** All issues, newest first, filtered by status and priority when given. */
export async function listIssues(filters: IssueFiltersInput = {}) {
  await requireUser();

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
