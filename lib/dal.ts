import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";

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

// The one function allowed to read passwordHash. Only the auth actions call it, and the
// result must never be returned to a client — pass it to verifyPassword and discard it.
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
