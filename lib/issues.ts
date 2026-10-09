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
export function formatIssueKey(number: number) {
  return `${ISSUE_KEY_PREFIX}-${number}`;
}

// Form

/** Validates the create/edit issue form; shared by createIssue and updateIssue. */
export const IssueSchema = z.object({
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

/** Type: parsed issue form values, as returned by `IssueSchema.parse`. */
export type IssueInput = z.infer<typeof IssueSchema>;
