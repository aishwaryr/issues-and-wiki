import { expect, type Page, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { sql } from "./support/db";
import { deleteIssues, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E search";

/** A made-up word (letters only, so stemming leaves it alone) that only this run uses. */
function uniqueWord() {
  return `zq${Math.random()
    .toString(36)
    .replace(/[^a-z]/g, "")
    .slice(0, 8)}`;
}

/** Opens the Assignee filter and picks an option. */
async function chooseAssignee(page: Page, option: string) {
  await page.getByLabel("Assignee").click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

test("search finds words in the title or the description", async ({ page }) => {
  const word = uniqueWord();
  const inTitle = await insertIssue(`${TITLE_PREFIX} ${word}`);
  const inDescription = await insertIssue(TITLE_PREFIX, {
    description: `Steps mention ${word} here`,
  });
  const neither = await insertIssue(TITLE_PREFIX);

  await page.goto("/issues");
  await page.getByLabel("Search").fill(word);
  await expect(page).toHaveURL(new RegExp(`\\?q=${word}$`));
  await expect(page.getByText(inTitle.title)).toBeVisible();
  await expect(page.getByText(inDescription.title)).toBeVisible();
  await expect(page.getByText(neither.title)).toHaveCount(0);

  // The URL is the state: a fresh load shows the same results and the same words.
  await page.reload();
  await expect(page.getByLabel("Search")).toHaveValue(word);
  await expect(page.getByText(inTitle.title)).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expectPath(page, "/issues");
  await expect(page.getByLabel("Search")).toHaveValue("");
  await expect(page.getByText(neither.title)).toBeVisible();
});

test("search with no match shows the empty state", async ({ page }) => {
  await page.goto(`/issues?q=${uniqueWord()}`);
  await expect(page.getByText("No issues match these filters")).toBeVisible();
});

test("filters by assignee: me, unassigned", async ({ page }) => {
  const mine = await insertIssue(TITLE_PREFIX);
  const unassigned = await insertIssue(TITLE_PREFIX);
  await sql`
    update issues set assignee_id = (select id from users where email = ${alice.email})
    where title = ${mine.title}`;

  await page.goto("/issues");
  await chooseAssignee(page, "Me");
  await expect(page).toHaveURL(/\?assignee=me$/);
  await expect(page.getByText(mine.title)).toBeVisible();
  await expect(page.getByText(unassigned.title)).toHaveCount(0);

  await chooseAssignee(page, "Unassigned");
  await expect(page).toHaveURL(/\?assignee=unassigned$/);
  await expect(page.getByText(unassigned.title)).toBeVisible();
  await expect(page.getByText(mine.title)).toHaveCount(0);
});
