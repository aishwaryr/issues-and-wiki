import "server-only";

import bcrypt from "bcryptjs";

const COST = 12;

const MAX_PASSWORD_BYTES = 72;

export async function hashPassword(password: string): Promise<string> {
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    throw new Error(`Password exceeds ${MAX_PASSWORD_BYTES} bytes`);
  }
  return bcrypt.hash(password, COST);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

// Real cost-12 hash of a string no account uses. Sign-in compares against this when the
// email doesn't exist, so "no such user" costs the same ~0.3s as "wrong password".
// Without it, response time tells an attacker which emails are registered, even though
// both paths return the same message. Must stay at COST — a cheaper hash reopens the gap.
const NO_SUCH_USER_HASH =
  "$2b$12$CetFccT9Ff2uaeiZSd8xe.v1rl6nI991GLzoHZatMlSCznwFVblVS";

export async function burnPasswordCompare(password: string): Promise<void> {
  await bcrypt.compare(password, NO_SUCH_USER_HASH);
}
