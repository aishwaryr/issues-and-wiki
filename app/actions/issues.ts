"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
