import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sessions } from "@/db/schema";

const COOKIE_NAME = "session";
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

  await db
    .insert(sessions)
    .values({ tokenHash: hashToken(token), userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // document.cookie can't read it, so XSS can't steal it
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod; localhost is http
    sameSite: "lax", // not sent on cross-site POSTs, which blunts CSRF
    path: "/",
    expires: expiresAt, // browser drops it at the same moment the row expires
  });
}

export async function getSession(): Promise<{
  userId: string;
  expiresAt: Date;
} | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const [session] = await db
    .select({ userId: sessions.userId, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  if (!session) return null;

  // Expiry is enforced here, not by the cookie: a cookie is client-side state and can be
  // replayed after its expiry, so the row is the source of truth.
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    return null;
  }

  return session;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // Delete the row first: that is what actually revokes access. Clearing the cookie alone
  // would leave a usable token behind if the user kept a copy.
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }

  cookieStore.delete(COOKIE_NAME);
}
