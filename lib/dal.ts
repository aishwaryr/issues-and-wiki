import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { issues, users } from "@/db/schema";
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

export async function listIssues() {
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
    .orderBy(desc(issues.createdAt));
}
