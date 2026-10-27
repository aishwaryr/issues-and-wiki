"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import { issues } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { readForm } from "@/lib/form-data";
import {
  ISSUE_FIELDS,
  IssueFormSchema,
  type IssueFormState,
} from "@/lib/issues";

export async function createIssue(
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  await requireUser();

  const values = readForm(formData, ISSUE_FIELDS);
  const result = IssueFormSchema.safeParse(values);

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
    return {
      message: "Could not create the issue. Try again.",
      values,
    };
  }

  if (!created) {
    return { message: "Could not create the issue. Try again.", values };
  }

  revalidatePath("/issues");
  redirect(`/issues/${created.issueNumber}`);
}

export async function updateIssue(
  id: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  await requireUser();

  const values = readForm(formData, ISSUE_FIELDS);
  const result = IssueFormSchema.safeParse(values);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  let updated: { issueNumber: number } | undefined;
  try {
    [updated] = await db
      .update(issues)
      .set({
        ...result.data,
        description: result.data.description ?? null,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning({ issueNumber: issues.number });
  } catch (error) {
    console.error("updateIssue failed", error);
    return {
      message: "Could not update the issue. Try again.",
      values,
    };
  }

  if (!updated) {
    return { message: "This issue no longer exists.", values };
  }

  revalidatePath("/issues");
  revalidatePath(`/issues/${updated.issueNumber}`);
  redirect(`/issues/${updated.issueNumber}`);
}

export async function deleteIssue(id: string): Promise<void> {
  await requireUser();

  try {
    await db.delete(issues).where(eq(issues.id, id));
  } catch (error) {
    console.error("deleteIssue failed", error);
    throw new Error("Could not delete the issue. Try again.");
  }

  revalidatePath("/issues");
  redirect("/issues");
}
