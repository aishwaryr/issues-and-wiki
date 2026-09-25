import { expect, test } from "@playwright/test";

import { carol, expectPath, signIn } from "./support/auth";

test("logs out from the navbar and locks the dashboard again", async ({
  page,
  context,
}) => {
  await signIn(page, carol);
  await expectPath(page, "/");

  await page.getByRole("button", { name: "Log out" }).click();
  await expectPath(page, "/signin");

  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "session")).toBeUndefined();

  await page.goto("/");
  await expectPath(page, "/signin");
});
