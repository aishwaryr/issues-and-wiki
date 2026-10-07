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
export type IssueValueConfig = { label: string; color: string };

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

/** Badge classes per status, used on issue cards. */
export const STATUS_BADGE_CLASSES: Record<IssueStatus, string> = {
  backlog: "border-dashed text-muted-foreground",
  todo: "border-transparent bg-slate-500/15 text-slate-700 dark:text-slate-300",
  in_progress:
    "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-300",
  done: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  canceled: "border-transparent bg-muted text-muted-foreground line-through",
};

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

/** Badge classes per priority, used on issue cards. */
export const PRIORITY_BADGE_CLASSES: Record<IssuePriority, string> = {
  none: "border-dashed text-muted-foreground",
  low: "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  medium:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  high: "border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-300",
  urgent: "border-transparent bg-red-500/15 text-red-700 dark:text-red-300",
};

// Key

/** Prefix of the human-readable issue key (`ISS` in `ISS-12`). */
export const ISSUE_KEY_PREFIX = "ISS";

/** Formats an issue number as its key: `12` → `"ISS-12"`. */
export function formatIssueKey(number: number) {
  return `${ISSUE_KEY_PREFIX}-${number}`;
}
