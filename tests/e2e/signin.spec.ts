import { test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";

test("signs in an existing account and lands on the dashboard", async ({
  page,
}) => {
  await signIn(page, alice);

  await expectPath(page, "/");
});
