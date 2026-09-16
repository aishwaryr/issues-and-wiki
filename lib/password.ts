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
