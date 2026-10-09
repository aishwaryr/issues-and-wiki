import { expect, test, type Page } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { sql } from "./support/db";

// Every issue this spec creates starts with this, so cleanup can't touch real data.
const TITLE_PREFIX = "E2E issue";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
  await page.goto("/issues/new");
});

test.afterAll(async () => {
  await sql`delete from issues where title like ${`${TITLE_PREFIX}%`}`;
});

async function choose(
  page: Page,
  field: "Status" | "Priority",
  option: string,
) {
  await page.getByLabel(field).click();
  await page.getByRole("option", { name: option }).click();
}

test("creates an issue and shows it in the list", async ({ page }) => {
  const title = `${TITLE_PREFIX} ${Date.now().toString(36)}`;

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("Created by Playwright");
  await choose(page, "Status", "Todo");
  await choose(page, "Priority", "High");
  await page.getByRole("button", { name: "Create issue" }).click();

  await expectPath(page, "/issues");
  await expect(page.getByText(title)).toBeVisible();
});

test("shows a field error and keeps the input", async ({ page }) => {
  const title = page.getByLabel("Title");
  const description = page.getByLabel("Description");

  // Spaces pass the browser's `required` check, so only the server can reject them.
  await title.fill("   ");
  await description.fill("Keep me");
  await choose(page, "Status", "Todo");
  await choose(page, "Priority", "High");
  await page.getByRole("button", { name: "Create issue" }).click();

  // Not getByRole("alert"): Next's route announcer is an alert too.
  await expect(title).toHaveAccessibleDescription("Title is required");
  await expect(title).toHaveAttribute("aria-invalid", "true");
  await expectPath(page, "/issues/new");

  await expect(description).toHaveValue("Keep me");
  await expect(page.getByLabel("Status")).toContainText("Todo");
  await expect(page.getByLabel("Priority")).toContainText("High");
});
