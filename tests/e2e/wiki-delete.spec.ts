import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteWikiPages, insertWikiPage } from "./support/wiki";

const TITLE_PREFIX = "E2E wiki delete";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteWikiPages(TITLE_PREFIX);
});

test("keeps the page when the confirm dialog is canceled", async ({ page }) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX);
  await page.goto(wikiPage.url);

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Delete" }).click();

  await expectPath(page, wikiPage.url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    wikiPage.title,
  );
});

test("deletes the page after confirming", async ({ page }) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX);
  await page.goto(wikiPage.url);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();

  await expectPath(page, "/wiki");
  await expect(page.getByRole("heading", { name: "Wiki" })).toBeVisible();
  // Scoped to list rows: the old page's streamed <title> can linger in <body>.
  await expect(
    page.getByRole("listitem").filter({ hasText: wikiPage.title }),
  ).toHaveCount(0);

  await page.goto(wikiPage.url);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
