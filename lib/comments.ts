import { z } from "zod";

/** Validates the new-comment form. */
export const CommentFormSchema = z.object({
  body: z
    .string({ error: "Write a comment" })
    .trim()
    .max(5_000, { error: "Comment is too long" })
    .min(1, { error: "Write a comment" }),
});

/** Type: parsed comment form values. */
export type CommentFormInput = z.infer<typeof CommentFormSchema>;

/** Form field names read from FormData by addComment. */
export const COMMENT_FIELDS = ["body"] as const;

/** Type: one comment form field name. */
export type CommentField = keyof CommentFormInput;

/** Type: addComment result for useActionState — errors, a message, and the body to refill. */
export type CommentFormState = {
  errors?: Partial<Record<CommentField, string[]>>;
  message?: string;
  values?: Record<CommentField, string>;
};
