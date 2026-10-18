import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteWikiPages, insertWikiPage } from "./support/wiki";

const TITLE_PREFIX = "E2E wiki page";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteWikiPages(TITLE_PREFIX);
});

test("renders the markdown body with the author and actions", async ({
  page,
}) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX, {
    body: "## Setup\n\n- Install Node\n- Run `npm install`\n\n[Issues](/issues)",
  });
  await page.goto(wikiPage.url);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    wikiPage.title,
  );
  await expect(page).toHaveTitle(new RegExp(wikiPage.title));
  // Scoped to the article: the navbar shows the signed-in user's name too.
  const article = page.locator("article");
  await expect(article.locator("header")).toContainText(alice.name);
  await expect(
    page.getByRole("heading", { level: 2, name: "Setup" }),
  ).toBeVisible();
  await expect(article.getByRole("listitem")).toHaveCount(2);
  await expect(article.locator("code")).toHaveText("npm install");
  await expect(article.getByRole("link", { name: "Issues" })).toHaveAttribute(
    "href",
    "/issues",
  );
  await expect(page.getByRole("link", { name: "Edit" })).toHaveAttribute(
    "href",
    `${wikiPage.url}/edit`,
  );
});

test("shows raw HTML as text instead of running it", async ({ page }) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX, {
    body: '<img src="x" onerror="window.xss = true">\n\n[bad](javascript:alert(1))',
  });
  await page.goto(wikiPage.url);

  await expect(page.locator("article img")).toHaveCount(0);
  await expect(page.getByText('<img src="x"')).toBeVisible();
  expect(await page.evaluate(() => "xss" in window)).toBe(false);
  await expect(
    page.locator("article").getByText("bad", { exact: true }),
  ).not.toHaveAttribute("href", /javascript:/);
});

test("shows a placeholder for an empty page", async ({ page }) => {
  const wikiPage = await insertWikiPage(TITLE_PREFIX);
  await page.goto(wikiPage.url);

  await expect(page.getByText("This page is empty.")).toBeVisible();
});

test("shows the not-found page for a missing slug", async ({ page }) => {
  await page.goto("/wiki/no-such-page-e2e");

  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
