import { expect, type Page, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E dashboard";

/** The row of count tiles at the top of the dashboard. */
const summary = (page: Page) => page.getByRole("list", { name: "Summary" });

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("shows counts, the created chart and recent issues", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX, { status: "in_progress" });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();
  await expect(
    summary(page).getByRole("link", { name: /^In progress \d+$/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Issues created" }),
  ).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Issues created per day" }),
  ).toBeAttached();

  const recent = page.getByRole("region", { name: "Recently updated" });
  await recent.getByRole("link", { name: new RegExp(issue.title) }).click();
  await expectPath(page, issue.url);
});

test("a status tile opens the filtered issue list", async ({ page }) => {
  await summary(page)
    .getByRole("link", { name: /^Done \d+$/ })
    .click();
  await expect(page).toHaveURL(/\/issues\?status=done$/);
});
