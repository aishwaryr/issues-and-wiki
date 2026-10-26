import { z } from "zod";

import { issuePriority, issueStatus } from "@/db/schema";

// Status

export const ISSUE_STATUSES = issueStatus.enumValues;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

// Priority

export const ISSUE_PRIORITIES = issuePriority.enumValues;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

// Form

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

export type IssueFormInput = z.infer<typeof IssueFormSchema>;

// Filters

export const IssueFiltersSchema = z.object({
  status: z.enum(ISSUE_STATUSES).optional().catch(undefined),
  priority: z.enum(ISSUE_PRIORITIES).optional().catch(undefined),
});

export type IssueFiltersInput = z.infer<typeof IssueFiltersSchema>;
