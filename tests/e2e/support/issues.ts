import type { Page } from "@playwright/test";

import { sql } from "./db";

type Status = "backlog" | "todo" | "in_progress" | "done" | "canceled";
type Priority = "none" | "low" | "medium" | "high" | "urgent";

/** Type: a test issue as the UI sees it — its title, key and detail URL. */
export type TestIssue = { title: string; key: string; url: string };

/**
 * Inserts an issue straight into the database, so specs that test one feature
 * (edit, delete, filters…) don't depend on the create form.
 * Each spec passes its own title prefix and deletes only those rows; specs run
 * in parallel, so a shared prefix would let one spec's cleanup break another.
 */
export async function insertIssue(
  titlePrefix: string,
  values: { status?: Status; priority?: Priority; description?: string } = {},
): Promise<TestIssue> {
  const title = `${titlePrefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const [row] = await sql`
    insert into issues (title, description, status, priority)
    values (${title}, ${values.description ?? null}, ${values.status ?? "backlog"}, ${values.priority ?? "none"})
    returning number`;
  const key = `ISS-${row.number}`;
  return { title, key, url: `/issues/${key}` };
}

/** Deletes every issue whose title starts with the prefix. */
export async function deleteIssues(titlePrefix: string) {
  await sql`delete from issues where title like ${`${titlePrefix}%`}`;
}

/**
 * The value cell (`<dd>`) next to a label (`<dt>`) on the issue detail page.
 * Use toContainText for Status/Priority: the icon's SVG `<title>` is part of the text.
 */
export function detailField(
  page: Page,
  label: "Status" | "Priority" | "Assignee",
) {
  return page.locator(`dt:text-is("${label}") + dd`);
}

/** Opens a Status or Priority select and picks an option. */
export async function choose(
  page: Page,
  field: "Status" | "Priority",
  option: string,
) {
  await page.getByLabel(field).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
