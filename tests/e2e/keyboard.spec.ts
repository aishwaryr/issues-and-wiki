import { expect, type Locator, type Page, test } from "@playwright/test";

import { alice, expectPath, newAccount } from "./support/auth";
import { deleteIssues } from "./support/issues";
import { deleteWikiPages } from "./support/wiki";

// Keyboard only: no clicks or fills. Tab to reach a control, type, Enter to submit.
const TITLE_PREFIX = "E2E keyboard";

test.afterAll(async () => {
  await deleteIssues(TITLE_PREFIX);
  await deleteWikiPages(TITLE_PREFIX);
});

/** Presses Tab until `target` has focus; fails if it isn't reachable in `max` presses. */
async function tabTo(page: Page, target: Locator, max = 40) {
  await expect(target).toBeVisible();
  for (let presses = 0; presses < max; presses++) {
    if (await target.evaluate((el) => el === document.activeElement)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

/** Tabs to a field and types into it, replacing what's there. */
async function typeInto(page: Page, field: Locator, text: string) {
  await tabTo(page, field);
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(text);
}

/** Tabs to a button or link and presses Enter on it. */
async function activate(page: Page, control: Locator) {
  await tabTo(page, control);
  await page.keyboard.press("Enter");
}

async function keyboardSignIn(page: Page) {
  await page.goto("/signin");
  await typeInto(page, page.locator("#email"), alice.email);
  await typeInto(page, page.locator("#password"), alice.password);
  await page.keyboard.press("Enter");
  await expectPath(page, "/");
}

test("sign in, create and edit an issue, and comment, by keyboard only", async ({
  page,
}) => {
  await keyboardSignIn(page);

  const title = `${TITLE_PREFIX} ${Date.now().toString(36)}`;
  await page.goto("/issues/new");
  await typeInto(page, page.locator("#title"), title);
  await typeInto(page, page.locator("#description"), "Typed, not pasted");

  // Radix select: Enter opens it on the current value, ArrowDown moves, Enter picks.
  await activate(page, page.getByRole("combobox", { name: "Status" }));
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Todo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("combobox", { name: "Status" })).toContainText(
    "Todo",
  );

  await activate(page, page.getByRole("button", { name: "Create issue" }));
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await activate(page, page.getByRole("link", { name: "Edit" }));
  await typeInto(page, page.locator("#title"), `${title} edited`);
  await activate(page, page.getByRole("button", { name: "Save changes" }));
  await expect(
    page.getByRole("heading", { name: `${title} edited` }),
  ).toBeVisible();

  await typeInto(page, page.getByLabel("Add a comment"), "Keyboard comment");
  await activate(page, page.getByRole("button", { name: "Comment" }));
  await expect(
    page.getByRole("region", { name: "Comments" }).getByRole("listitem"),
  ).toContainText("Keyboard comment");
});

test("create a wiki page by keyboard only", async ({ page }) => {
  await keyboardSignIn(page);

  const title = `${TITLE_PREFIX} ${Date.now().toString(36)}`;
  await page.goto("/wiki/new");
  await typeInto(page, page.locator("#title"), title);
  await typeInto(page, page.locator("#body"), "# Typed page");
  await activate(page, page.getByRole("button", { name: "Create page" }));
  await expect(
    page.getByRole("heading", { level: 1, name: title }),
  ).toBeVisible();
});

test.describe("a failed submit moves focus to the problem", () => {
  test("sign-in: the form message", async ({ page }) => {
    await page.goto("/signin");
    await typeInto(page, page.locator("#email"), alice.email);
    await typeInto(page, page.locator("#password"), "not-the-password");
    await page.keyboard.press("Enter");
    await expect(page.locator("#form-message")).toBeFocused();
  });

  test("sign-up: the first invalid field", async ({ page }) => {
    const account = newAccount();
    await page.goto("/signup");
    // Spaces pass the browser's `required` check; the server trims and rejects them.
    await typeInto(page, page.locator("#name"), "   ");
    await typeInto(page, page.locator("#email"), account.email);
    await typeInto(page, page.locator("#password"), account.password);
    await page.keyboard.press("Enter");
    await expect(page.locator("#name")).toBeFocused();
  });

  test("new issue, comment and new wiki page: the invalid field", async ({
    page,
  }) => {
    await keyboardSignIn(page);

    await page.goto("/issues/new");
    await typeInto(page, page.locator("#title"), "   ");
    await activate(page, page.getByRole("button", { name: "Create issue" }));
    await expect(page.locator("#title-error")).toBeVisible();
    await expect(page.locator("#title")).toBeFocused();

    // A real issue to comment on.
    const title = `${TITLE_PREFIX} ${Date.now().toString(36)}`;
    await typeInto(page, page.locator("#title"), title);
    await activate(page, page.getByRole("button", { name: "Create issue" }));
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await typeInto(page, page.getByLabel("Add a comment"), "   ");
    await activate(page, page.getByRole("button", { name: "Comment" }));
    await expect(page.locator("#body-error")).toBeVisible();
    await expect(page.getByLabel("Add a comment")).toBeFocused();

    await page.goto("/wiki/new");
    await typeInto(page, page.locator("#title"), "   ");
    await activate(page, page.getByRole("button", { name: "Create page" }));
    await expect(page.locator("#title-error")).toBeVisible();
    await expect(page.locator("#title")).toBeFocused();
  });
});
