"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { flattenError } from "zod";

import { db } from "@/db";
import { issues } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { readForm } from "@/lib/form-data";
import { IssueSchema, type IssueInput } from "@/lib/issues";

const ISSUE_FIELDS = ["title", "description", "status", "priority"] as const;

type IssueField = keyof IssueInput;

/** Type: createIssue result for useActionState — errors, plus raw values to refill the form. */
export type CreateIssueState = {
  errors?: Partial<Record<IssueField, string[]>>;
  message?: string;
  values?: Record<IssueField, string>;
};

/** Validates the new-issue form and creates the issue. */
export async function createIssue(
  _prevState: CreateIssueState,
  formData: FormData,
): Promise<CreateIssueState> {
  await requireUser();

  const values = readForm(formData, ISSUE_FIELDS);
  const result = IssueSchema.safeParse(values);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  try {
    await db.insert(issues).values(result.data);
  } catch (error) {
    console.error("createIssue failed", error);
    return { message: "Could not create the issue. Try again.", values };
  }

  revalidatePath("/issues");
  redirect("/issues");
}
