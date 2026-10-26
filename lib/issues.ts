import { z } from "zod";

import { issuePriority, issueStatus } from "@/db/schema";

// Status

export const ISSUE_STATUSES = issueStatus.enumValues;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

// Priority

export const ISSUE_PRIORITIES = issuePriority.enumValues;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

// Form

/** Checks the create/edit form on the server, where the check can't be skipped. */
export const IssueFormSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .max(180, { error: "Title is too long" })
    .min(1, { error: "Title is required" }),
  description: z
    .string()
    .trim()
    .max(10_000, { error: "Description is too long" })
    .transform((value) => value || undefined),
  status: z.enum(ISSUE_STATUSES, { error: "Choose a valid status" }),
  priority: z.enum(ISSUE_PRIORITIES, { error: "Choose a valid priority" }),
});

/** Type: the clean form data after trim/transform, ready for the db insert/update. */
export type IssueFormInput = z.infer<typeof IssueFormSchema>;

/** The FormData keys readForm reads; `as const` keeps the exact names for the types. */
export const ISSUE_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
] as const;

/** Type: the form field names, so errors and values use only real fields. */
type IssueField = keyof IssueFormInput;

/** Type: create/update's result for useActionState — errors, plus the raw input to refill the form. */
export type IssueFormState = {
  errors?: Partial<Record<IssueField, string[]>>;
  message?: string;
  values?: Record<IssueField, string>;
};

// Filters

/** Checks the ?status=&priority= URL params; a bad or missing value becomes "no filter". */
export const IssueFiltersSchema = z.object({
  status: z.enum(ISSUE_STATUSES).optional().catch(undefined),
  priority: z.enum(ISSUE_PRIORITIES).optional().catch(undefined),
});

/** Type: the parsed filters the list page passes to the DAL. */
export type IssueFiltersInput = z.infer<typeof IssueFiltersSchema>;
