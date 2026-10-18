import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteWikiPages, insertWikiPage } from "./support/wiki";

const TITLE_PREFIX = "E2E wiki edit";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteWikiPages(TITLE_PREFIX);
});

test("edits a page and keeps its URL", async ({ page }) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX, { body: "Old text" });
  const newTitle = `${wikiPage.title} renamed`;

  await page.goto(wikiPage.url);
  await page.getByRole("link", { name: "Edit" }).click();
  await expectPath(page, `${wikiPage.url}/edit`);
  await expect(page).toHaveTitle(new RegExp(`Edit ${wikiPage.title}`));

  await expect(page.getByLabel("Title")).toHaveValue(wikiPage.title);
  await expect(page.getByLabel("Content")).toHaveValue("Old text");
  await page.getByLabel("Title").fill(newTitle);
  await page.getByLabel("Content").fill("## New section\n\nNew text");
  await page.getByRole("button", { name: "Save changes" }).click();

  // Same slug after a rename, so links to the page keep working.
  await expectPath(page, wikiPage.url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(newTitle);
  await expect(
    page.getByRole("heading", { level: 2, name: "New section" }),
  ).toBeVisible();
  await expect(page.getByText("Old text")).toHaveCount(0);
});

test("shows a field error and does not save", async ({ page }) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX);

  await page.goto(`${wikiPage.url}/edit`);
  await page.getByLabel("Title").fill("   ");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("Title is required")).toBeVisible();
  await expectPath(page, `${wikiPage.url}/edit`);

  await page.goto(wikiPage.url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    wikiPage.title,
  );
});

test("shows the not-found page when editing a missing slug", async ({
  page,
}) => {
  await page.goto("/wiki/no-such-page-e2e/edit");

  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
