import { chromium } from 'playwright';

const url = process.argv[2];
const clickText = process.argv[3];
const outPath = process.argv[4];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

if (process.env.COOKIE) {
  await page.context().addCookies([
    { name: 'session', value: process.env.COOKIE, domain: 'localhost', path: '/' },
  ]);
}

await page.goto(url, { waitUntil: 'networkidle' });
await page.getByText(clickText, { exact: true }).first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();
console.log('saved', outPath);
