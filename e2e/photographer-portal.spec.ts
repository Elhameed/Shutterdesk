import { expect, test } from "@playwright/test";

const DEMO_PHOTOGRAPHER = {
  email: "imani.uwase@shutterdesk.rw",
  password: "password123",
};

async function loginAsDemoPhotographer(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(DEMO_PHOTOGRAPHER.email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PHOTOGRAPHER.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/photographer\/dashboard/, { timeout: 20_000 });
}

test.describe("Photographer portal navigation", () => {
  test("dashboard, bookings, calendar, and settings are reachable", async ({ page }) => {
    await loginAsDemoPhotographer(page);

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("link", { name: "Bookings" }).click();
    await expect(page).toHaveURL(/\/photographer\/bookings/);

    await page.getByRole("link", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/\/photographer\/calendar/);

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/photographer\/settings/);
  });
});
