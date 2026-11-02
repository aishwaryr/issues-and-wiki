import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E comments";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

// Deleting the issues deletes their comments too (on delete cascade).
test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("adds a comment and shows it with its author", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);
  await page.goto(issue.url);

  const comments = page.getByRole("region", { name: "Comments" });
  await expect(comments.getByText("No comments yet")).toBeVisible();

  await page.getByLabel("Add a comment").fill("First comment");
  await page.getByRole("button", { name: "Comment", exact: true }).click();

  const items = comments.getByRole("listitem");
  await expect(items).toHaveCount(1);
  await expect(items).toContainText(alice.name);
  await expect(items).toContainText("First comment");
  await expect(page.getByLabel("Add a comment")).toHaveValue("");
});

test("shows a field error for a blank comment", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);
  await page.goto(issue.url);

  // Spaces pass the browser's `required` check, so only the server rejects them.
  await page.getByLabel("Add a comment").fill("   ");
  await page.getByRole("button", { name: "Comment", exact: true }).click();

  await expect(page.getByLabel("Add a comment")).toHaveAccessibleDescription(
    "Write a comment",
  );
  await expect(
    page.getByRole("region", { name: "Comments" }).getByText("No comments yet"),
  ).toBeVisible();
});
