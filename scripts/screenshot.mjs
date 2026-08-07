import { chromium } from 'playwright';

const url = process.argv[2];
const outPath = process.argv[3];
const width = Number(process.argv[4] ?? 390);
const height = Number(process.argv[5] ?? 844);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });

if (process.env.COOKIE) {
  await page.context().addCookies([
    { name: 'session', value: process.env.COOKIE, domain: 'localhost', path: '/' },
  ]);
}

await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log('saved', outPath);
