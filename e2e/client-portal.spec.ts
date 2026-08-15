import { expect, test } from "@playwright/test";

const DEMO_CLIENT = {
  email: "immaculee.niyonsaba@gmail.com",
  password: "password123",
  firstName: "Immaculée",
};

async function loginAsDemoClient(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(DEMO_CLIENT.email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_CLIENT.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  try {
    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 20_000 });
  } catch {
    throw new Error(
      "Demo client login failed. Start the stack (npm run dev:all), seed the database (npm run db:seed), then retry.",
    );
  }

  await expect(
    page.getByText(new RegExp(`Welcome back, ${DEMO_CLIENT.firstName}`, "i")),
  ).toBeVisible();
}

test.describe("Client portal golden path", () => {
  test("dashboard, bookings, payments, galleries, and notifications", async ({
    page,
  }) => {
    await loginAsDemoClient(page);

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("link", { name: "My Bookings" }).click();
    await expect(page).toHaveURL(/\/client\/bookings/);
    await expect(page.getByRole("heading", { name: "My Bookings" })).toBeVisible();

    await page.getByRole("link", { name: "Payments" }).click();
    await expect(page).toHaveURL(/\/client\/payments/);
    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();

    await page.getByRole("link", { name: "Galleries" }).click();
    await expect(page).toHaveURL(/\/client\/galleries/);
    await expect(page.getByRole("heading", { name: "My Galleries" })).toBeVisible();

    await page.getByRole("link", { name: "Notifications" }).click();
    await expect(page).toHaveURL(/\/client\/notifications/);
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  });

  test("book session marketplace entry is reachable", async ({ page }) => {
    await loginAsDemoClient(page);

    await page.getByRole("link", { name: "Book Session" }).click();
    await expect(page).toHaveURL(/\/client\/book/);
    await expect(page.getByRole("heading", { name: "Book a Session" })).toBeVisible();
  });
});
