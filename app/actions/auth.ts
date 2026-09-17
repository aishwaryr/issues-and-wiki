"use server";

import { redirect } from "next/navigation";
import { flattenError, z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserByEmail } from "@/lib/dal";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

const SignUpSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
    password: z.string().min(8, "At least 8 characters").max(72, "Too long"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpState = {
  errors?: Record<string, string[]>;
  values?: { name: string; email: string };
};

export async function signUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const values = {
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
  };

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
