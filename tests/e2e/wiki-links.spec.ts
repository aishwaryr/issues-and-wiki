import { expect, type Page, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, insertIssue } from "./support/issues";
import { deleteWikiPages, insertWikiPage } from "./support/wiki";

const TITLE_PREFIX = "E2E wiki link";

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
  await deleteWikiPages(TITLE_PREFIX);
});

/** The "Wiki pages" card on the issue detail page. */
function wikiPagesSection(page: Page) {
  return page.getByRole("region", { name: "Wiki pages" });
}

/** Picks a page in the "Link a page" select and submits it. */
async function linkPage(page: Page, title: string) {
  await page.getByLabel("Link a page").click();
  await page.getByRole("option", { name: title, exact: true }).click();
  await page.getByRole("button", { name: "Link", exact: true }).click();
}

test("links a page to an issue, shows it on both sides, then unlinks it", async ({
  page,
}) => {
  const issue = await insertIssue(TITLE_PREFIX);
  const wikiPage = await insertWikiPage(TITLE_PREFIX);

  await page.goto(issue.url);
  await expect(wikiPagesSection(page)).toContainText("No linked pages");
  await linkPage(page, wikiPage.title);

  const pageLink = wikiPagesSection(page).getByRole("link", {
    name: wikiPage.title,
  });
  await expect(pageLink).toBeVisible();

  await pageLink.click();
  await expectPath(page, wikiPage.url);
  const linkedIssues = page.getByRole("region", { name: "Linked issues" });
  await expect(linkedIssues).toContainText(issue.key);
  await expect(linkedIssues).toContainText(issue.title);

  await linkedIssues.getByRole("link", { name: new RegExp(issue.key) }).click();
  await expectPath(page, issue.url);
  await page.getByRole("button", { name: `Unlink ${wikiPage.title}` }).click();
  await expect(wikiPagesSection(page)).toContainText("No linked pages");
});

test("drops the link when the page is deleted", async ({ page }) => {
  const issue = await insertIssue(TITLE_PREFIX);
  const wikiPage = await insertWikiPage(TITLE_PREFIX);

  await page.goto(issue.url);
  await linkPage(page, wikiPage.title);
  await expect(
    wikiPagesSection(page).getByRole("link", { name: wikiPage.title }),
  ).toBeVisible();

  await page.goto(wikiPage.url);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expectPath(page, "/wiki");

  await page.goto(issue.url);
  await expect(wikiPagesSection(page)).toContainText("No linked pages");
});
