import { test } from "@playwright/test";

import { expectPath, newAccount, signUp } from "./support/auth";

test("creates an account and lands on the dashboard", async ({ page }) => {
  await signUp(page, newAccount());

  await expectPath(page, "/");
});
