import { issuePriority, issueStatus } from "@/db/schema";

// Enum values come straight from the pgEnums, so the database stays the single
// source of truth. Not server-only: client forms need these for their selects.
// Record<…> forces a label for every value: add one to the schema and
// TypeScript flags the labels map until it has one.
// *_OPTIONS are for the UI (selects, filters): one import gives { value, label }
// pairs, typed values, and the schema's enum order.
// *_BADGE_CLASSES color the badges: a soft tinted background + colored text,
// darker text in light mode and lighter in dark mode so both stay readable.
// Full class strings (not built from pieces) so Tailwind can find them.

// Status
export const ISSUE_STATUSES = issueStatus.enumValues;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
  canceled: "Canceled",
};
export const STATUS_OPTIONS = ISSUE_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));
export const STATUS_BADGE_CLASSES: Record<IssueStatus, string> = {
  backlog: "border-dashed text-muted-foreground", // not started yet: outline only
  todo: "border-transparent bg-slate-500/15 text-slate-700 dark:text-slate-300",
  in_progress:
    "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-300",
  done: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  canceled: "border-transparent bg-muted text-muted-foreground line-through",
};

// Priority
export const ISSUE_PRIORITIES = issuePriority.enumValues;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
export const PRIORITY_OPTIONS = ISSUE_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));
export const PRIORITY_BADGE_CLASSES: Record<IssuePriority, string> = {
  low: "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  medium:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  high: "border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-300",
  urgent: "border-transparent bg-red-500/15 text-red-700 dark:text-red-300",
};
