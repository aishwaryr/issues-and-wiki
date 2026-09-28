import { issuePriority, issueStatus } from "@/db/schema";

// Enum values come straight from the pgEnums, so the database stays the single
// source of truth. Not server-only: client forms need these for their selects.
// Record<…> forces a label for every value: add one to the schema and
// TypeScript flags the labels map until it has one.

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

// Priority
export const ISSUE_PRIORITIES = issuePriority.enumValues;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
