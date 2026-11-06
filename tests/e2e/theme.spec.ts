import { expect, type Page, test } from "@playwright/test";

import { alice, expectPath, signIn } from "./support/auth";

/** Opens the navbar theme menu and picks an option. */
async function pickTheme(page: Page, option: "Light" | "Dark" | "System") {
  await page.getByRole("combobox", { name: "Theme" }).click();
  await page.getByRole("option", { name: option }).click();
}

const html = (page: Page) => page.locator("html");

test.beforeEach(async ({ page }) => {
  await signIn(page, alice);
  await expectPath(page, "/");
});

test("dark by default; light sticks after a reload", async ({ page }) => {
  await expect(html(page)).toHaveClass(/\bdark\b/);

  await pickTheme(page, "Light");
  await expect(html(page)).not.toHaveClass(/\bdark\b/);

  await page.reload();
  await expect(html(page)).not.toHaveClass(/\bdark\b/);
  await expect(html(page)).toHaveAttribute("data-theme", "light");
});

test("system follows the OS setting, live and on reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await pickTheme(page, "System");
  await expect(html(page)).not.toHaveClass(/\bdark\b/);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(html(page)).toHaveClass(/\bdark\b/);

  // The inline script sets it before React hydrates, so the first paint is already dark.
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(html(page)).toHaveClass(/\bdark\b/);

  await pickTheme(page, "Dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html(page)).toHaveClass(/\bdark\b/);
});
