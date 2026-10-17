import { test, expect } from '@playwright/test';

const projectDomains = {
  'cv-peers': 'https://cvpeers.com',
  'stephen-beratung': 'https://stephenberatung.at',
  'curators-path': 'https://staging.tamasstephen.com',
};

for (const viewport of [{ width: 1440, height: 1000 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
  test(`working sheet layout at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('I build clear interfaces.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.project')).toHaveCount(3);
    await expect(page.locator('.project[data-open="true"]')).toHaveCount(1);
    await expect(page.locator('.project[data-project="cv-peers"]')).toHaveAttribute('data-open', 'true');
    await expect(page.locator('#panel-cv-peers')).toBeVisible();
    await expect(page.locator('#panel-stephen-beratung')).toBeHidden();
    await expect(page.locator('#panel-curators-path')).toBeHidden();
    for (const [project, href] of Object.entries(projectDomains)) {
      await expect(page.locator(`.project[data-project="${project}"] .project-domain`)).toHaveAttribute('href', href);
    }
    const summaries = page.locator('.experience-row .experience-summary');
    await expect(summaries).toHaveCount(4);
    for (const summary of await summaries.all()) await expect(summary).not.toBeEmpty();
    await expect(page.getByRole('link', { name: /hello@tamasstephen.com/ })).toHaveAttribute('href', 'mailto:hello@tamasstephen.com');
    expect(errors).toEqual([]);
  });
}

test('cv peers mobile preview is form-only', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#panel-cv-peers .preview-dialog')).toBeVisible();
  await expect(page.locator('#panel-cv-peers .preview-page')).toBeHidden();
});

test('mobile navigation shows only contact and theme control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const link of await page.locator('.nav-section').all()) await expect(link).toBeHidden();
  const nav = await page.locator('.nav-links').boundingBox();
  expect(nav && nav.x + nav.width <= 390 - 20).toBe(true);
});

test('desktop domain link sits beside the title, tablet below the description', async ({ page }) => {
  const domain = page.locator('.project[data-project="cv-peers"] .project-domain');
  const title = page.locator('.project[data-project="cv-peers"] .project-title');
  const description = page.locator('.project[data-project="cv-peers"] .project-description');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const desktopDomain = await domain.boundingBox();
  const desktopTitle = await title.boundingBox();
  expect(desktopDomain && desktopTitle && desktopDomain.x > desktopTitle.x + desktopTitle.width).toBe(true);
  await page.setViewportSize({ width: 768, height: 1024 });
  const tabletDomain = await domain.boundingBox();
  const tabletDescription = await description.boundingBox();
  expect(tabletDomain && tabletDescription && tabletDomain.y >= tabletDescription.y + tabletDescription.height).toBe(true);
});

test('content is complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const opacities = await page.locator('[data-reveal], [data-reveal] > *, [data-arrival]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).opacity));
  expect(opacities.length).toBeGreaterThan(0);
  expect(opacities.every(opacity => opacity === '1')).toBe(true);
  await expect(page.locator('.theme-toggle')).toBeHidden();
  await expect(page.locator('#panel-cv-peers')).toBeVisible();
  await context.close();
});

test('keyboard navigation exposes skip link and every internal target exists', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  expect(await page.locator('a[href^="#"]').evaluateAll(links => links.every(link => document.querySelector(link.getAttribute('href'))))).toBe(true);
});

test('explore my work targets selected work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Explore my work/ }).click();
  await expect(page).toHaveURL(/#work$/);
});
