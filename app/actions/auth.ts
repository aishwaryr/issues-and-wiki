"use server";

import { redirect } from "next/navigation";
import { flattenError, z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserByEmail } from "@/lib/dal";
import { readForm } from "@/lib/form-data";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

// ---------- sign-up ----------

// Keep max lengths in sync with db/schema.ts (varchar 120 / 255) — otherwise Postgres
// throws instead of the form showing a field error.
const SignUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email"))
    .refine((v) => v.length <= 255, "Email is too long"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    // bytes, not chars — bcrypt truncates past 72 bytes (1 emoji = 4)
    .refine(
      (v) => Buffer.byteLength(v, "utf8") <= 72,
      "Password is too long (max 72 bytes)",
    ),
});

type SignUpField = keyof z.infer<typeof SignUpSchema>;

export type SignUpState = {
  errors?: Partial<Record<SignUpField, string[]>>;
  // form-level error, for anything that isn't tied to one field
  message?: string;
  values?: { name: string; email: string };
};

export async function signUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const payload = readForm(formData, ["name", "email", "password"]);

  const values = { name: payload.name, email: payload.email };

  const result = SignUpSchema.safeParse(payload);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  const { name, email, password } = result.data;

  const emailTaken = {
    errors: { email: ["An account with this email already exists"] },
    values,
  };

  // Fast path, not the guarantee: nicer message + skips the ~370ms hash below.
  // Two requests can both pass this before either inserts (check-then-act race).
  if (await getUserByEmail(email)) {
    return emailTaken;
  }

  const passwordHash = await hashPassword(password);

  // This is the actual guarantee — the unique index decides, so the race can't slip past.
  // onConflictDoNothing = skip the row instead of throwing, so `returning` comes back
  // empty and empty means "email taken".
  // Keep `target: users.email`. Bare onConflictDoNothing() swallows EVERY unique conflict,
  // so a future constraint would get mislabelled as "email taken" instead of throwing.
  // Empty result can only mean an email conflict; anything else (not null, too long, fk)
  // still throws.
  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (!newUser) {
    return emailTaken;
  }

  await createSession(newUser.id);
  redirect("/");
}

// ---------- sign-in ----------

const SignInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Password is required"),
});

type SignInField = keyof z.infer<typeof SignInSchema>;

export type SignInState = {
  errors?: Partial<Record<SignInField, string[]>>;
  message?: string;
  values?: { email: string };
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const payload = readForm(formData, ["email", "password"]);
  const values = { email: payload.email };

  const result = SignInSchema.safeParse(payload);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }
  const { email, password } = result.data;

  const invalidEmailPassword = {
    message: "Invalid email or password",
    values,
  };

  const user = await getUserByEmail(email);
  if (!user) return invalidEmailPassword;

  const passwordCheck = await verifyPassword(password, user.passwordHash);
  if (!passwordCheck) return invalidEmailPassword;

  await createSession(user.id);
  redirect("/");
}

// ---------- sign-out ----------

export async function signOut() {
  await deleteSession();
  redirect("/signin");
}
