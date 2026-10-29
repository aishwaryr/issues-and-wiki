import { z } from "zod";

import { issuePriority, issueStatus } from "@/db/schema";

// Shared

/** Text colors for status/priority icons, named by meaning. */
const ISSUE_COLORS = {
  neutral: "text-zinc-500",
  active: "text-blue-500",
  complete: "text-green-500",
  urgent: "text-orange-600",
} as const;

/**
 * Type: display settings for one status or priority value (`{ label, color }`).
 * Shared by `STATUS_CONFIG` and `PRIORITY_CONFIG` so both maps have the same shape.
 */
type IssueValueConfig = { label: string; color: string };

// Status

/** All statuses, in database enum order. */
export const ISSUE_STATUSES = issueStatus.enumValues;

/**
 * Type: union of all status values (`"backlog" | "todo" | …`).
 * Derived from the database enum, so it updates when the enum changes.
 */
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

/** Label and icon color per status. */
export const STATUS_CONFIG: Record<IssueStatus, IssueValueConfig> = {
  backlog: { label: "Backlog", color: ISSUE_COLORS.neutral },
  todo: { label: "Todo", color: ISSUE_COLORS.neutral },
  in_progress: { label: "In progress", color: ISSUE_COLORS.active },
  done: { label: "Done", color: ISSUE_COLORS.complete },
  canceled: { label: "Canceled", color: ISSUE_COLORS.neutral },
};

/** `{ value, label }` options for status selects and filters. */
export const STATUS_OPTIONS = ISSUE_STATUSES.map((value) => ({
  value,
  label: STATUS_CONFIG[value].label,
}));

// Priority

/** All priorities, in database enum order (lowest to highest). */
export const ISSUE_PRIORITIES = issuePriority.enumValues;

/**
 * Type: union of all priority values (`"none" | "low" | …`).
 * Derived from the database enum, so it updates when the enum changes.
 */
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

/** Label and icon color per priority. */
export const PRIORITY_CONFIG: Record<IssuePriority, IssueValueConfig> = {
  none: { label: "No priority", color: ISSUE_COLORS.neutral },
  low: { label: "Low", color: ISSUE_COLORS.neutral },
  medium: { label: "Medium", color: ISSUE_COLORS.neutral },
  high: { label: "High", color: ISSUE_COLORS.neutral },
  urgent: { label: "Urgent", color: ISSUE_COLORS.urgent },
};

/** `{ value, label }` options for priority selects and filters. */
export const PRIORITY_OPTIONS = ISSUE_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_CONFIG[value].label,
}));

// Key

/** Prefix of the human-readable issue key (`ISS` in `ISS-12`). */
export const ISSUE_KEY_PREFIX = "ISS";

/** Formats an issue number as its key: `12` → `"ISS-12"`. */
export function formatIssueKey(issueNumber: number) {
  return `${ISSUE_KEY_PREFIX}-${issueNumber}`;
}

/** Largest Postgres `integer`; a bigger number can't be an issue number. */
const PG_INT_MAX = 2_147_483_647;

/** Parses an issue key (`"ISS-12"`, any case) to its number, or null if invalid. */
export function parseIssueKey(key: string): number | null {
  const regex = /^ISS-([1-9]\d*)$/i;
  const match = key.match(regex);
  if (match === null) return null;

  const issueNumber = Number(match[1]);
  return issueNumber <= PG_INT_MAX ? issueNumber : null;
}

// Form

/** Validates the create/edit issue form; shared by createIssue and updateIssue. */
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

/** Type: parsed issue form values, as returned by `IssueFormSchema.parse`. */
export type IssueFormInput = z.infer<typeof IssueFormSchema>;

/** Form field names read from FormData by createIssue/updateIssue. */
export const ISSUE_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
] as const;

/** Type: one issue form field name — keys for field errors and refill values. */
export type IssueField = keyof IssueFormInput;

/** Type: createIssue/updateIssue result for useActionState — errors, plus raw values to refill the form. */
export type IssueFormState = {
  errors?: Partial<Record<IssueField, string[]>>;
  message?: string;
  values?: Record<IssueField, string>;
};

// Filters

/** Validates the list filters from the URL; an invalid or missing value becomes undefined. */
export const IssueFiltersSchema = z.object({
  status: z.enum(ISSUE_STATUSES).optional().catch(undefined),
  priority: z.enum(ISSUE_PRIORITIES).optional().catch(undefined),
});

/** Type: parsed list filters (`{ status?, priority? }`). */
export type IssueFiltersInput = z.infer<typeof IssueFiltersSchema>;
