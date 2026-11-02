"use server";

import { revalidatePath } from "next/cache";
import { flattenError } from "zod";

import { db } from "@/db";
import { issueComments } from "@/db/schema";
import {
  COMMENT_FIELDS,
  CommentFormSchema,
  type CommentFormState,
} from "@/lib/comments";
import { requireUser } from "@/lib/dal";
import { readForm } from "@/lib/form-data";

/** Validates the comment form and adds the comment to the issue. */
export async function addComment(
  issueId: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const user = await requireUser();

  const values = readForm(formData, COMMENT_FIELDS);
  const result = CommentFormSchema.safeParse(values);

  if (!result.success) {
    return { errors: flattenError(result.error).fieldErrors, values };
  }

  try {
    await db
      .insert(issueComments)
      .values({ issueId, authorId: user.id, body: result.data.body });
  } catch (error) {
    console.error("addComment failed", error);
    return { message: "Could not add the comment. Try again.", values };
  }
  revalidatePath("/issues/[issueKey]", "page");
  return {};
}
