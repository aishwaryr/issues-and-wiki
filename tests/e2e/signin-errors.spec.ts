import { expect, type Page, test } from "@playwright/test";

import { alice, expectPath } from "./support/auth";

/** Submits the sign-in form and returns the form-level error text. */
async function failedSignIn(page: Page, email: string, password: string) {
  await page.goto("/signin");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const message = page.locator("#form-message");
  await expect(message).toBeVisible();
  await expectPath(page, "/signin");
  return message.textContent();
}

// The form must not reveal which emails have accounts. (The server also spends one
// bcrypt compare on both paths, so timing doesn't reveal it either; see signIn.)
test("an unknown email and a wrong password show the same error", async ({
  page,
}) => {
  const unknownEmail = await failedSignIn(
    page,
    `nobody+${Date.now().toString(36)}@example.com`,
    "hunter2hunter2",
  );
  const wrongPassword = await failedSignIn(
    page,
    alice.email,
    "not-the-password",
  );

  expect(unknownEmail).toBe("Invalid email or password");
  expect(wrongPassword).toBe(unknownEmail);
});
