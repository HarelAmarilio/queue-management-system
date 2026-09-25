import { test, expect } from "@playwright/test";

test("Booking flow - selecting a date displays available time slots", async ({
  page,
}) => {
  await page.goto("https://nini-eyebrows.vercel.app/");

  await page.getByText("לקביעת תור").first().click();

  const dateInput = page.locator('input[type="date"]');
  await dateInput.fill("2026-10-25");

  const timeSlot = page.locator(".time-slot-button").first();
  await expect(timeSlot).toBeVisible({ timeout: 10000 });
});
