import { expect, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, insertIssue } from "./support/issues";
import { deleteWikiPages } from "./support/wiki";

// One user journey across the whole wiki module, through the UI only (except
// the issue, which the issue specs already cover).
const TITLE_PREFIX = "E2E wiki smoke";

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
  await deleteWikiPages(TITLE_PREFIX);
});

test("create → list → view → edit → link to an issue → delete", async ({
  page,
}) => {
  const issue = await insertIssue(TITLE_PREFIX);
  const title = `${TITLE_PREFIX} ${Date.now().toString(36)}`;
  const slug = title.toLowerCase().replace(/ /g, "-");
  const url = `/wiki/${slug}`;

  await signIn(page, alice);
  await expectPath(page, "/");

  // Create from the list page
  await page.getByRole("link", { name: "Wiki", exact: true }).click();
  await expectPath(page, "/wiki");
  await page.getByRole("link", { name: "New page" }).first().click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Content").fill("First **draft**");
  await page.getByRole("button", { name: "Create page" }).click();
  await expectPath(page, url);
  await expect(page.locator("article strong")).toHaveText("draft");

  // Listed
  await page.getByRole("link", { name: "← All pages" }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: title }),
  ).toBeVisible();

  // View → edit
  await page.getByRole("link", { name: title }).click();
  await expectPath(page, url);
  await page.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Content").fill("## Final\n\nReviewed");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expectPath(page, url);
  await expect(
    page.getByRole("heading", { level: 2, name: "Final" }),
  ).toBeVisible();

  // Link from the issue, then follow the link back
  await page.goto(issue.url);
  await page.getByLabel("Link a page").click();
  await page.getByRole("option", { name: title, exact: true }).click();
  await page.getByRole("button", { name: "Link", exact: true }).click();
  await page
    .getByRole("region", { name: "Wiki pages" })
    .getByRole("link", { name: title })
    .click();
  await expectPath(page, url);
  await expect(
    page.getByRole("region", { name: "Linked issues" }),
  ).toContainText(issue.key);

  // Delete
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expectPath(page, "/wiki");
  await page.goto(url);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
