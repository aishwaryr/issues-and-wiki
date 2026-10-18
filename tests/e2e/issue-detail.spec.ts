import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, detailField, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E detail";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("shows the issue's key, title, description and fields", async ({
  page,
}) => {
  const issue = await insertIssue(TITLE_PREFIX, {
    status: "in_progress",
    priority: "urgent",
    description: "Steps to reproduce",
  });

  await page.goto(issue.url);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(issue.title);
  await expect(page.getByText(issue.key, { exact: true })).toBeVisible();
  await expect(page.getByText("Steps to reproduce")).toBeVisible();
  await expect(detailField(page, "Status")).toContainText("In progress");
  await expect(detailField(page, "Priority")).toContainText("Urgent");
  await expect(detailField(page, "Assignee")).toHaveText("Unassigned");
  await expect(page).toHaveTitle(
    `${issue.key} · ${issue.title} · Issues + Wiki`,
  );
});

test("shows a placeholder when there is no description", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);

  await page.goto(issue.url);

  await expect(page.getByText("No description")).toBeVisible();
});

test("redirects a lowercase key to the canonical URL", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);

  await page.goto(issue.url.toLowerCase());

  await expectPath(page, issue.url);
});

test("shows the not-found page for a bad or missing key", async ({ page }) => {
  for (const url of ["/issues/ISS-999999999", "/issues/banana"]) {
    await page.goto(url);
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  }
});
