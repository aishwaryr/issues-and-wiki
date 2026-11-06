import { expect, test } from "@playwright/test";

import { expectPath, newAccount } from "./support/auth";
import { sql } from "./support/db";

const account = newAccount();

test.afterAll(async () => {
  await sql`delete from users where email = ${account.email}`;
});

// Both requests pass signUp's "is the email taken?" read before either inserts (that read
// is only a fast path). The unique constraint on users.email has to pick the winner.
test("two sign-ups with the same email at once create one account", async ({
  browser,
}) => {
  const pages = await Promise.all(
    [0, 1].map(async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto("/signup");
      await page.locator("#name").fill(account.name);
      await page.locator("#email").fill(account.email);
      await page.locator("#password").fill(account.password);
      return page;
    }),
  );

  await Promise.all(
    pages.map((page) =>
      page.getByRole("button", { name: "Sign up", exact: true }).click(),
    ),
  );

  // One lands on the dashboard; the other stays on /signup with the email error.
  const outcomes = await Promise.all(
    pages.map((page) =>
      Promise.race([
        expectPath(page, "/").then(() => "signed-up"),
        expect(page.locator("#email-error"))
          .toHaveText("An account with this email already exists")
          .then(() => "email-taken"),
      ]),
    ),
  );
  expect(outcomes.sort()).toEqual(["email-taken", "signed-up"]);

  const rows = await sql`select id from users where email = ${account.email}`;
  expect(rows).toHaveLength(1);

  await Promise.all(pages.map((page) => page.context().close()));
});
