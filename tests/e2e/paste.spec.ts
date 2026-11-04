import { expect, type Page, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";
import { deleteIssues, insertIssue } from "./support/issues";

const TITLE_PREFIX = "E2E paste";

// Covers i30 ("paste sometimes needs a second Cmd+V"): one real Ctrl/Cmd+V per field must land.
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
});

/** Puts `text` on the clipboard, clicks the field and pastes it with the keyboard. */
async function pasteInto(page: Page, selector: string, text: string) {
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
  const field = page.locator(selector);
  // click, not focus(): a streamed page keeps its form hidden behind loading.tsx for a
  // moment after load, and click() waits until it's visible, like a person would.
  await field.click();
  await page.keyboard.press("ControlOrMeta+V");
  await expect(field).toHaveValue(text);
}

test("paste lands on the first try in the sign-in fields", async ({ page }) => {
  await page.goto("/signin");
  await pasteInto(page, "#email", "pasted@example.com");
  await pasteInto(page, "#password", "pasted-password");
});

test("paste lands on the first try in the sign-up fields", async ({ page }) => {
  await page.goto("/signup");
  await pasteInto(page, "#name", "Pasted Name");
  await pasteInto(page, "#email", "pasted@example.com");
  // Controlled input (the show/hide toggle needs its value).
  await pasteInto(page, "#password", "pasted-password");
});

test("paste lands before the page has hydrated", async ({ page }) => {
  // domcontentloaded: the server HTML is there, React may not have hydrated yet.
  await page.goto("/signup", { waitUntil: "domcontentloaded" });
  await pasteInto(page, "#password", "early-paste-password");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#password")).toHaveValue("early-paste-password");
});

test("paste lands in the issue, comment and wiki fields", async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");

  await page.goto("/issues/new");
  await pasteInto(page, "#title", "Pasted issue title");
  await pasteInto(page, "#description", "Line one\nLine two");

  // Its own issue: specs run in parallel, and another spec may delete any shared one.
  const issue = await insertIssue(TITLE_PREFIX);
  await page.goto(issue.url);
  await pasteInto(page, "#body", "Pasted comment");

  await page.goto("/wiki/new");
  await pasteInto(page, "#title", "Pasted page title");
  await pasteInto(page, "#body", "# Pasted\n\nMarkdown body");
});
