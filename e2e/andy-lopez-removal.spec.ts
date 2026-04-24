import { test, expect, devices } from "@playwright/test";

/**
 * Runtime guard: on every page load (across mobile + desktop viewports),
 * the rendered DOM must not contain Andy Lopez contact info, and the
 * contact dropdown must not expose "Text Andy" / "Email Andy" options.
 */

const FORBIDDEN = [
  "Andy Lopez",
  "Text Andy",
  "Email Andy",
  "9176933767",
  "917-693-3767",
  "OTE3NjkzMzc2Nw==",
];

const ROUTES = ["/", "/shop", "/designer", "/landing"];

const VIEWPORTS = [
  { name: "mobile", ...devices["iPhone 13"] },
  { name: "desktop", viewport: { width: 1280, height: 800 } },
];

for (const vp of VIEWPORTS) {
  test.describe(`Andy Lopez removal — ${vp.name}`, () => {
    test.use({ viewport: vp.viewport, userAgent: vp.userAgent });

    for (const route of ROUTES) {
      test(`${route} contains no Andy references`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        // Scroll to bottom so the footer (lazy/animated) is mounted.
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);

        const html = await page.content();
        for (const needle of FORBIDDEN) {
          expect(
            html.includes(needle),
            `${route} (${vp.name}) leaked forbidden token: ${needle}`,
          ).toBe(false);
        }
      });
    }

    test("contact dropdown excludes Text Andy on home", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Open the contact-method <Select>. Radix renders it as a button
      // with role=combobox containing the current label.
      const trigger = page
        .getByRole("combobox")
        .filter({ hasText: /email us|text golan|choose contact/i })
        .first();

      if ((await trigger.count()) === 0) {
        test.skip(true, "Contact select not present on this build");
        return;
      }

      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();

      // Dropdown items now in the DOM — assert no Andy options.
      await expect(page.getByRole("option", { name: /text andy/i })).toHaveCount(0);
      await expect(page.getByRole("option", { name: /email andy/i })).toHaveCount(0);
    });
  });
}
