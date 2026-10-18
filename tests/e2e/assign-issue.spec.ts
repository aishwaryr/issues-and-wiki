import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, detailField, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E assign";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("assigns an issue to me, then unassigns it", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);
  await page.goto(issue.url);
  await expect(detailField(page, "Assignee")).toHaveText("Unassigned");

  await page.getByRole("button", { name: "Assign to me" }).click();
  await expect(page.getByRole("button", { name: "Unassign" })).toBeVisible();
  await expect(detailField(page, "Assignee")).toContainText(alice.name);

  await page.goto("/issues");
  await expect(
    page.getByRole("listitem").filter({ hasText: issue.title }),
  ).toContainText(alice.name);

  await page.goto(issue.url);
  await page.getByRole("button", { name: "Unassign" }).click();
  await expect(
    page.getByRole("button", { name: "Assign to me" }),
  ).toBeVisible();
  await expect(detailField(page, "Assignee")).toHaveText("Unassigned");
});
