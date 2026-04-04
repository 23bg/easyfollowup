import { expect, test } from "@playwright/test";

test("public home renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "Start Free Trial" })).toBeVisible();
});

test("pricing page shows both plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("₹499 / month")).toBeVisible();
    await expect(page.getByText("₹999 / month")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start Solo Trial" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start Team Trial" })).toBeVisible();
});
