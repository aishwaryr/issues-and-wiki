"use server";

import { redirect } from "next/navigation";
import { flattenError, z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserByEmail } from "@/lib/dal";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

// Bounds match the column widths in db/schema.ts — varchar(120) and varchar(255).
// Without them Postgres rejects the insert instead of the form showing a field error.
const SignUpSchema = z
  .object({
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
      // bcrypt truncates past 72 BYTES, so measure bytes, not characters.
      .refine(
        (v) => Buffer.byteLength(v, "utf8") <= 72,
        "Password is too long (max 72 bytes)",
      ),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpField = keyof z.infer<typeof SignUpSchema>;

export type SignUpState = {
  errors?: Partial<Record<SignUpField, string[]>>;
  values?: { name: string; email: string };
};

export async function signUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  // formData.get returns string | File | null. Coerce here so a missing or non-text
  // field fails our own rules instead of zod's "expected string, received null".
  const field = (name: SignUpField) => String(formData.get(name) ?? "");

  const payload = {
    name: field("name"),
    email: field("email"),
    password: field("password"),
    confirmPassword: field("confirmPassword"),
  };

  const values = { name: payload.name, email: payload.email };

  const result = SignUpSchema.safeParse(payload);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  const { name, email, password } = result.data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      errors: { email: ["An account with this email already exists"] },
      values,
    };
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id });

  await createSession(newUser.id);
  redirect("/");
}
