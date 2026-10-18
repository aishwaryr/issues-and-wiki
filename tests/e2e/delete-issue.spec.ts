import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E delete";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("keeps the issue when the confirm dialog is canceled", async ({
  page,
}) => {
  const issue = await insertIssue(TITLE_PREFIX);
  await page.goto(issue.url);

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Delete" }).click();

  await expectPath(page, issue.url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(issue.title);
});

test("deletes the issue after confirming", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);
  await page.goto(issue.url);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();

  await expectPath(page, "/issues");
  await expect(page.getByRole("heading", { name: "Issues" })).toBeVisible();
  // Scoped to list rows: Next streams metadata into <body>, and the detail
  // page's <title> element can linger there (hidden) after the redirect.
  await expect(
    page.getByRole("listitem").filter({ hasText: issue.title }),
  ).toHaveCount(0);

  await page.goto(issue.url);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
