import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await page.goto('https://staging.tamasstephen.com', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const cookieConsent = page.getByRole('button', { name: 'OK', exact: true });
if (await cookieConsent.isVisible()) await cookieConsent.click();
await page.screenshot({ path: 'assets/work/curators-path.jpg', type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: 1280, height: 800 } });
await browser.close();
