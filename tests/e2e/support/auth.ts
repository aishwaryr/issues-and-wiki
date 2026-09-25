import { expect, type Page } from "@playwright/test";

import users from "../../../cypress/fixtures/users.json";

export type TestUser = { name: string; email: string; password: string };

// Seeded by global-setup.ts — use these for anything that needs an account.
export const [alice, bob, carol]: TestUser[] = users;

export async function expectPath(page: Page, pathname: string) {
  await expect(page).toHaveURL((url) => url.pathname === pathname);
}

export async function signIn(page: Page, { email, password }: TestUser) {
  await page.goto("/signin");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

// Only for the sign-up spec. base36 timestamp: short and unique per run.
export function newAccount(): TestUser {
  const id = Date.now().toString(36);
  return {
    name: `E2E User ${id.slice(-4)}`,
    email: `e2e+${id}@example.com`,
    password: "hunter2hunter2",
  };
}

export async function signUp(page: Page, { name, email, password }: TestUser) {
  await page.goto("/signup");
  await page.locator("#name").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
}
