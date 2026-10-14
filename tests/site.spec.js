import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 1280, height: 720 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
  test(`layout and motion at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('I build clear interfaces.');
    await page.locator('.clarity-stage').scrollIntoViewIfNeeded();
    await expect(page.locator('#structure-to-clarity')).toHaveAttribute('data-phase', 'Clarity', { timeout: 10000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await expect(page.locator('.project-row')).toHaveCount(3);
    await page.getByRole('link', { name: "Let's talk" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole('link', { name: /hello@tamasstephen.com/ })).toHaveAttribute('href', 'mailto:hello@tamasstephen.com');
  });
}

test('reduced motion has a complete, still scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#structure-to-clarity')).toHaveAttribute('data-phase', 'Clarity');
  await expect(page.locator('.clarity-board')).toHaveCSS('opacity', '1');
  const before = await page.locator('.clarity-piece').first().getAttribute('style');
  await page.locator('.clarity-stage').hover();
  expect(await page.locator('.clarity-piece').first().getAttribute('style')).toBe(before);
});

test('content and completed visual remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.clarity-board')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('link', { name: /Stephen Beratung/ })).toHaveAttribute('href', 'https://stephenberatung.at');
  await context.close();
});

test('changing motion preference during playback completes and stops the scene', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#structure-to-clarity')).toHaveAttribute('data-phase', 'Clarity');
  await expect(page.locator('.clarity-board')).toHaveCSS('opacity', '1');
});

test('keyboard navigation exposes skip link and every internal target exists', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  expect(await page.locator('a[href^="#"]').evaluateAll(links => links.every(link => document.querySelector(link.getAttribute('href'))))).toBe(true);
});

test('unavailable observer APIs retain the complete static artwork', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined });
    Object.defineProperty(window, 'ResizeObserver', { value: undefined });
  });
  await page.goto('/');
  await expect(page.locator('#structure-to-clarity')).toHaveAttribute('data-phase', 'Clarity');
  await expect(page.locator('.clarity-board')).toHaveCSS('opacity', '1');
});
