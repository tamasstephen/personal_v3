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

const toggle = (page, project) => page.locator(`.project[data-project="${project}"] .project-toggle`);
const article = (page, project) => page.locator(`.project[data-project="${project}"]`);

async function expectAriaMatchesState(page) {
  const states = await page.locator('.project').evaluateAll(projects => projects.map(project => [project.getAttribute('data-open'), project.querySelector('.project-toggle')?.getAttribute('aria-expanded')]));
  for (const [open, expanded] of states) expect(expanded).toBe(open);
}

test('opening a project closes the others', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 'stephen-beratung').click();
  await expect(article(page, 'stephen-beratung')).toHaveAttribute('data-open', 'true');
  await expect(toggle(page, 'stephen-beratung')).toHaveAttribute('aria-expanded', 'true');
  await expect(article(page, 'cv-peers')).toHaveAttribute('data-open', 'false');
  await expect(toggle(page, 'cv-peers')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#panel-stephen-beratung')).toBeVisible();
  await expect(page.locator('#panel-cv-peers')).toBeHidden();
});

test('rapid switching leaves exactly one open', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    for (const id of ['stephen-beratung', 'curators-path']) document.querySelector(`.project[data-project="${id}"] .project-toggle`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await expect(page.locator('.project[data-open="true"]')).toHaveCount(1);
  await expect(article(page, 'curators-path')).toHaveAttribute('data-open', 'true');
  await expectAriaMatchesState(page);
});

test('clicking the open project closes it', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 'cv-peers').click();
  await expect(page.locator('.project[data-open="true"]')).toHaveCount(0);
  await expectAriaMatchesState(page);
});

test('keyboard toggles and keeps focus', async ({ page }) => {
  await page.goto('/');
  const button = toggle(page, 'stephen-beratung');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(article(page, 'stephen-beratung')).toHaveAttribute('data-open', 'true');
  await page.keyboard.press('Space');
  await expect(article(page, 'stephen-beratung')).toHaveAttribute('data-open', 'false');
  await expect(button).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.project[data-project="stephen-beratung"] .project-domain')).toBeFocused();
});

test('reduced motion opens instantly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const durations = await page.locator('.project-panel, .project-icon').evaluateAll(nodes => nodes.flatMap(node => getComputedStyle(node).transitionDuration.split(', ')));
  expect(durations.every(duration => duration === '0s')).toBe(true);
});

test('panels animate when motion is allowed', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#panel-cv-peers')).toHaveCSS('transition-duration', /0\.24s/);
});

const bodyBackground = page => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('follows system dark on first visit', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
  expect(await bodyBackground(page)).toBe('rgb(10, 10, 10)');
  await expect(page.locator('.theme-toggle')).toHaveText('Light');
  await expect(page.locator('.theme-toggle')).toHaveAttribute('aria-label', 'Switch to light mode');
});

test('explicit choice persists across reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
});

test('stored light beats system dark', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bodyBackground(page)).toBe('rgb(255, 255, 255)');
});

test('system change does not override explicit choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('.theme-toggle').click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => bodyBackground(page)).toBe('rgb(10, 10, 10)');
});

test('works when localStorage throws', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('no-JS honors system dark', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  expect(await bodyBackground(page)).toBe('rgb(10, 10, 10)');
  await expect(page.locator('.theme-toggle')).toBeHidden();
  await context.close();
});

test('sections reveal once when scrolled into view', async ({ page }) => {
  await page.goto('/');
  const experience = page.locator('#experience');
  await expect(experience).not.toHaveClass(/is-visible/);
  expect(await experience.locator('> *').first().evaluate(node => getComputedStyle(node).opacity)).toBe('0');
  await experience.scrollIntoViewIfNeeded();
  await expect(experience).toHaveClass(/is-visible/);
  await page.evaluate(() => scrollTo(0, 0));
  await experience.scrollIntoViewIfNeeded();
  await expect(experience).toHaveClass(/is-visible/);
});

test('reduced motion shows everything at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const styles = await page.locator('[data-reveal] > *, [data-arrival]').evaluateAll(nodes => nodes.map(node => [getComputedStyle(node).opacity, getComputedStyle(node).transform]));
  expect(styles.every(([opacity, transform]) => opacity === '1' && transform === 'none')).toBe(true);
});

test('missing IntersectionObserver reveals everything', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'IntersectionObserver', { value: undefined }));
  await page.goto('/');
  for (const section of await page.locator('[data-reveal]').all()) await expect(section).toHaveClass(/is-visible/);
});

test('anchor jump to an unrevealed section shows it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Experience' }).click();
  await expect(page.locator('#experience')).toHaveClass(/is-visible/, { timeout: 1000 });
});

test('hero arrives with a short stagger', async ({ page }) => {
  await page.goto('/');
  const delays = await page.locator('[data-arrival]').evaluateAll(nodes => nodes.map(node => [node.getAttribute('data-arrival'), getComputedStyle(node).animationDelay, getComputedStyle(node).animationDuration]));
  for (const [step, delay, duration] of delays) {
    expect(duration).toBe('0.42s');
    expect(delay).toBe({ 0: '0s', 1: '0.08s', 2: '0.16s' }[step]);
  }
});

test('content stays visible when the bundle fails to load', async ({ page }) => {
  await page.route('**/site.bundle.js', route => route.abort());
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const opacities = await page.locator('[data-reveal] > *').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).opacity));
  expect(opacities.every(opacity => opacity === '1')).toBe(true);
});

test('printing before scrolling shows every section', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  const opacities = await page.locator('[data-reveal] > *').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).opacity));
  expect(opacities.every(opacity => opacity === '1')).toBe(true);
});

test('header controls stay inside the gutter at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const rightEdges = await page.locator('.topbar a:visible, .topbar button:visible').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().right));
  expect(Math.max(...rightEdges)).toBeLessThanOrEqual(320 - 20);
});

test('without a stored choice the page follows a system theme change', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => bodyBackground(page)).toBe('rgb(10, 10, 10)');
  await expect(page.locator('.theme-toggle')).toHaveText('Light');
});
