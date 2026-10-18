import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteWikiPages } from "./support/wiki";

// Every page this spec creates starts with this, so cleanup can't touch real data.
const TITLE_PREFIX = "E2E wiki create";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
  await page.goto("/wiki/new");
});

test.afterAll(async () => {
  await deleteWikiPages(TITLE_PREFIX);
});

test("creates a page, opens it, and shows it in the list", async ({ page }) => {
  const title = `${TITLE_PREFIX} ${Date.now().toString(36)}`;
  const slug = title.toLowerCase().replace(/ /g, "-");

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill("## Overview\n\nCreated by Playwright");
  await page.getByRole("button", { name: "Create page" }).click();

  await expectPath(page, `/wiki/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(
    page.getByRole("heading", { level: 2, name: "Overview" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "← All pages" }).click();
  await expectPath(page, "/wiki");
  await expect(
    page.getByRole("listitem").filter({ hasText: title }),
  ).toBeVisible();
});

test("gives a repeated title the next free slug", async ({ page }) => {
  const title = `${TITLE_PREFIX} ${Date.now().toString(36)}`;
  const slug = title.toLowerCase().replace(/ /g, "-");

  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Create page" }).click();
  await expectPath(page, `/wiki/${slug}`);

  await page.goto("/wiki/new");
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Create page" }).click();
  await expectPath(page, `/wiki/${slug}-2`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
});

test("shows a field error and keeps the input", async ({ page }) => {
  const title = page.getByLabel("Title");
  const content = page.getByLabel("Content");

  // Spaces pass the browser's `required` check but not the server's trim.
  await title.fill("   ");
  await content.fill("Draft text");
  await page.getByRole("button", { name: "Create page" }).click();

  await expect(page.getByText("Title is required")).toBeVisible();
  await expectPath(page, "/wiki/new");
  await expect(content).toHaveValue("Draft text");
});
