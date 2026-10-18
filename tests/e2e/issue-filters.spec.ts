import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { choose, deleteIssues, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E filter";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("filters the list by status and priority through the URL", async ({
  page,
}) => {
  const todoHigh = await insertIssue(TITLE_PREFIX, {
    status: "todo",
    priority: "high",
  });
  const todoLow = await insertIssue(TITLE_PREFIX, {
    status: "todo",
    priority: "low",
  });
  const doneHigh = await insertIssue(TITLE_PREFIX, {
    status: "done",
    priority: "high",
  });

  await page.goto("/issues");
  await choose(page, "Status", "Todo");
  await expect(page).toHaveURL(/\?status=todo$/);
  await expect(page.getByText(todoHigh.title)).toBeVisible();
  await expect(page.getByText(todoLow.title)).toBeVisible();
  await expect(page.getByText(doneHigh.title)).toHaveCount(0);

  await choose(page, "Priority", "High");
  await expect(page).toHaveURL(/\?status=todo&priority=high$/);
  await expect(page.getByText(todoHigh.title)).toBeVisible();
  await expect(page.getByText(todoLow.title)).toHaveCount(0);

  // A reload keeps the filters: they live in the URL, not in component state.
  await page.reload();
  await expect(page.getByLabel("Status")).toContainText("Todo");
  await expect(page.getByLabel("Priority")).toContainText("High");
  await expect(page.getByText(todoLow.title)).toHaveCount(0);

  await page.getByRole("button", { name: "Reset" }).click();
  await expectPath(page, "/issues");
  await expect(page).toHaveURL(/\/issues$/);
  await expect(page.getByText(doneHigh.title)).toBeVisible();
});

test("ignores invalid filter values", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);

  await page.goto("/issues?status=banana&priority=urgent!");

  await expect(page.getByText(issue.title)).toBeVisible();
});

test("shows a no-match state with a reset link", async ({ page }) => {
  // No spec creates canceled issues, so this filter matches nothing unless
  // real data does; the title filter below would still catch a regression.
  await page.goto("/issues?status=canceled&priority=urgent");

  const empty = page.getByText("No issues match these filters");
  test.skip(
    (await page.getByRole("listitem").count()) > 0,
    "Database already has a canceled + urgent issue",
  );
  await expect(empty).toBeVisible();

  await page.getByRole("link", { name: "Reset filters" }).click();
  await expectPath(page, "/issues");
  await expect(empty).toHaveCount(0);
});
