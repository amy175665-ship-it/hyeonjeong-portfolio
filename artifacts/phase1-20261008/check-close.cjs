// Phase 1 check: the window's close button (back into the dunes) and the logo's way home, with longer waits.
// Usage: node check-close.cjs [url] [width] [height]
const path = require('path');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const url = process.argv[2] || 'http://localhost:3000/';
const width = Number(process.argv[3] || 1440), height = Number(process.argv[4] || 900);
const tag = `${width}x${height}`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const shot = name => page.screenshot({ path: path.join(__dirname, `${tag}-${name}.png`) });
  const y = () => page.evaluate(() => Math.round(scrollY));
  await page.goto(url + '#about', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(4000);
  await page.mouse.move(width - 5, height / 2);
  console.log('opened with #about at', await y());
  // up into the framed part, where the title bar and its buttons show
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(200); }
  await page.waitForTimeout(1200);
  await shot('20-framed-again');
  console.log('framed again at', await y());
  await page.getByRole('button', { name: '창 닫기' }).click();
  await page.waitForTimeout(1300); await shot('21-closing');
  await page.waitForTimeout(2500); await shot('22-closed');
  console.log('after close at', await y());
  await page.getByRole('link', { name: /홈/ }).first().click();
  await page.waitForTimeout(8000); await shot('23-home-later');
  console.log('home at', await y(), 'errors:', errors.length ? errors : 'none');
  await browser.close();
})();
