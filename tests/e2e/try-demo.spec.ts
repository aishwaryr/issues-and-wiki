import { expect, test } from "@playwright/test";

import { demo, expectPath } from "./support/auth";

for (const path of ["/signin", "/signup"]) {
  test(`Try Demo on ${path} signs in as the demo account`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.getByText("Explore Triagebook without signing up."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Try Demo" }).click();

    await expectPath(page, "/");
    await expect(page.getByRole("banner")).toContainText(demo.name);
  });
}
