import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import {
  choose,
  deleteIssues,
  detailField,
  insertIssue,
} from "./support/issues";

const TITLE_PREFIX = "E2E edit";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("edits an issue and shows the saved values", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX, { description: "Old text" });
  const newTitle = `${issue.title} edited`;

  await page.goto(issue.url);
  await page.getByRole("link", { name: "Edit" }).click();
  await expectPath(page, `${issue.url}/edit`);

  await expect(page.getByLabel("Title")).toHaveValue(issue.title);
  await page.getByLabel("Title").fill(newTitle);
  await page.getByLabel("Description").fill("");
  await choose(page, "Status", "Done");
  await choose(page, "Priority", "Low");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expectPath(page, issue.url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(newTitle);
  await expect(page.getByText("No description")).toBeVisible();
  await expect(detailField(page, "Status")).toContainText("Done");
  await expect(detailField(page, "Priority")).toContainText("Low");
});

test("shows a field error and does not save", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);

  await page.goto(`${issue.url}/edit`);
  await page.getByLabel("Title").fill("   ");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByLabel("Title")).toHaveAccessibleDescription(
    "Title is required",
  );
  await expectPath(page, `${issue.url}/edit`);

  await page.getByRole("link", { name: "Cancel" }).click();
  await expectPath(page, issue.url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(issue.title);
});
