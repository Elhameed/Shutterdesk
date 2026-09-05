import { expect, test } from "@playwright/test";

const DEMO_PHOTOGRAPHER = {
  email: "imani.uwase@shutterdesk.rw",
  password: "password123",
  firstName: "Imani",
};

/**
 * Sidebar landmark. Playwright matches accessible names by substring, so an
 * unscoped `name: "Calendar"` also matches the dashboard's "View calendar"
 * link and trips strict mode.
 */
function nav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation");
}

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

    // The dashboard headline is the time-of-day greeting, not the word
    // "Dashboard" — assert what the page actually renders.
    await expect(
      page.getByRole("heading", {
        name: new RegExp(`(morning|afternoon|evening), ${DEMO_PHOTOGRAPHER.firstName}`, "i"),
      }),
    ).toBeVisible();

    await nav(page).getByRole("link", { name: "Bookings" }).click();
    await expect(page).toHaveURL(/\/photographer\/bookings/);

    await nav(page).getByRole("link", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/\/photographer\/calendar/);

    await nav(page).getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/photographer\/settings/);
  });
});
