import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteWikiPages, insertWikiPage } from "./support/wiki";

const TITLE_PREFIX = "E2E wiki list";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteWikiPages(TITLE_PREFIX);
});

test("lists pages with their author and opens one", async ({ page }) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX);

  await page.getByRole("link", { name: "Wiki", exact: true }).click();
  await expectPath(page, "/wiki");
  await expect(page.getByRole("heading", { name: "Wiki" })).toBeVisible();
  await expect(page.getByText(/^\d+ pages?$/)).toBeVisible();

  const row = page.getByRole("listitem").filter({ hasText: wikiPage.title });
  await expect(row).toContainText(alice.name);

  await row.getByRole("link").click();
  await expectPath(page, wikiPage.url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    wikiPage.title,
  );
});

test("links to the new-page form", async ({ page }) => {
  await page.goto("/wiki");
  await page.getByRole("link", { name: "New page" }).first().click();
  await expectPath(page, "/wiki/new");
});
