import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { alice, signIn } from "./support/auth";
import { deleteIssues, insertIssue, type TestIssue } from "./support/issues";
import {
  deleteWikiPages,
  insertWikiPage,
  type TestWikiPage,
} from "./support/wiki";

const TITLE_PREFIX = "E2E a11y";

/** Runs axe (WCAG 2.1 A + AA rules) on the current page and expects no violations. */
async function expectNoViolations(page: Page) {
  // A submit button fades back from its disabled opacity (transition-all) after the
  // action returns; mid-fade, its contrast is lower than what the user ends up seeing.
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  // Rule id + each element it hit and why, so a failure says what to fix.
  const violations = results.violations.map((violation) => ({
    rule: violation.id,
    nodes: violation.nodes.map((node) => ({
      target: node.target.join(" "),
      html: node.html.slice(0, 120),
      why: node.failureSummary,
    })),
  }));
  expect(violations).toEqual([]);
}

test.describe("auth forms", () => {
  test("sign-in, empty and with an error", async ({ page }) => {
    await page.goto("/signin");
    await expectNoViolations(page);

    await page.locator("#email").fill(alice.email);
    await page.locator("#password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.locator("#form-message")).toBeVisible();
    await expectNoViolations(page);
  });

  test("sign-up, empty and with field errors", async ({ page }) => {
    await page.goto("/signup");
    await expectNoViolations(page);

    // Spaces pass the browser's `required` check; the server trims and rejects them.
    await page.locator("#name").fill("   ");
    await page.locator("#email").fill(alice.email);
    await page.locator("#password").fill("hunter2hunter2");
    await page.getByRole("button", { name: "Sign up", exact: true }).click();
    await expect(page.locator("#name-error")).toBeVisible();
    await expectNoViolations(page);
  });
});

test.describe("app forms", () => {
  let issue: TestIssue;
  let wikiPage: TestWikiPage;

  test.beforeAll(async () => {
    issue = await insertIssue(TITLE_PREFIX, { description: "Body" });
    wikiPage = await insertWikiPage(TITLE_PREFIX, { body: "# Heading" });
  });

  test.afterAll(async () => {
    await deleteIssues(TITLE_PREFIX);
    await deleteWikiPages(TITLE_PREFIX);
  });

  test.beforeEach(async ({ page }) => {
    await signIn(page, alice);
    await page.waitForURL("/");
  });

  test("new issue, empty and with a field error", async ({ page }) => {
    await page.goto("/issues/new");
    await expect(page.locator("#title")).toBeVisible();
    await expectNoViolations(page);

    await page.locator("#title").fill("   ");
    await page.getByRole("button", { name: "Create issue" }).click();
    await expect(page.locator("#title-error")).toBeVisible();
    await expectNoViolations(page);
  });

  test("issue list with filters", async ({ page }) => {
    await page.goto("/issues?status=backlog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoViolations(page);
  });

  test("issue page: assignee, comment and wiki link forms", async ({
    page,
  }) => {
    await page.goto(issue.url);
    await expect(page.locator("#body")).toBeVisible();
    await expectNoViolations(page);
  });

  test("edit issue", async ({ page }) => {
    await page.goto(`${issue.url}/edit`);
    await expect(page.locator("#title")).toBeVisible();
    await expectNoViolations(page);
  });

  test("new wiki page, empty and with a field error", async ({ page }) => {
    await page.goto("/wiki/new");
    await expect(page.locator("#title")).toBeVisible();
    await expectNoViolations(page);

    await page.locator("#title").fill("   ");
    await page.getByRole("button", { name: "Create page" }).click();
    await expect(page.locator("#title-error")).toBeVisible();
    await expectNoViolations(page);
  });

  test("wiki page and its edit form", async ({ page }) => {
    await page.goto(wikiPage.url);
    await expect(
      page.getByRole("heading", { level: 1, name: wikiPage.title }),
    ).toBeVisible();
    await expectNoViolations(page);

    await page.goto(`${wikiPage.url}/edit`);
    await expect(page.locator("#title")).toBeVisible();
    await expectNoViolations(page);
  });
});
