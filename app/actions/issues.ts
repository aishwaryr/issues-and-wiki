"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import { issues } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { readForm } from "@/lib/form-data";
import { formatIssueKey, IssueSchema, type IssueInput } from "@/lib/issues";

const ISSUE_FIELDS = ["title", "description", "status", "priority"] as const;

type IssueField = keyof IssueInput;

/** Type: createIssue/updateIssue result for useActionState — errors, plus raw values to refill the form. */
export type IssueFormState = {
  errors?: Partial<Record<IssueField, string[]>>;
  message?: string;
  values?: Record<IssueField, string>;
};

/** Validates the new-issue form and creates the issue. */
export async function createIssue(
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  await requireUser();

  const values = readForm(formData, ISSUE_FIELDS);
  const result = IssueSchema.safeParse(values);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  let created: { issueNumber: number } | undefined;
  try {
    [created] = await db
      .insert(issues)
      .values(result.data)
      .returning({ issueNumber: issues.number });
  } catch (error) {
    console.error("createIssue failed", error);
    return { message: "Could not create the issue. Try again.", values };
  }

  if (!created) {
    return { message: "Could not create the issue. Try again.", values };
  }

  revalidatePath("/issues");
  redirect(`/issues/${formatIssueKey(created.issueNumber)}`);
}

/** Validates the edit-issue form and saves the changes. */
export async function updateIssue(
  id: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  await requireUser();

  const values = readForm(formData, ISSUE_FIELDS);

  const result = IssueSchema.safeParse(values);
  if (!result.success) {
    return {
      errors: flattenError(result.error).fieldErrors,
      values,
    };
  }

  const data = result.data;

  let updated: { issueNumber: number } | undefined;
  try {
    [updated] = await db
      .update(issues)
      .set({
        ...data,
        // .set() skips undefined keys; null clears an emptied description.
        description: data.description ?? null,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning({ issueNumber: issues.number });
  } catch (error) {
    console.error("updateIssue failed", error);
    return { message: "Could not save the issue. Try again.", values };
  }

  if (!updated) {
    return { message: "This issue no longer exists.", values };
  }
  revalidatePath("/issues");
  revalidatePath(`/issues/${formatIssueKey(updated.issueNumber)}`);
  revalidatePath("/");

  redirect(`/issues/${formatIssueKey(updated.issueNumber)}`);
}

/** Deletes an issue and returns to the list. */
export async function deleteIssue(id: string): Promise<void> {
  await requireUser();

  try {
    await db.delete(issues).where(eq(issues.id, id));
  } catch (error) {
    console.error("deleteIssue failed", error);
    throw new Error("Could not delete the issue. Try again.");
  }

  revalidatePath("/issues");
  revalidatePath("/");
  redirect("/issues");
}
