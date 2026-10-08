// Mobile title bar while the window frame dissolves (after the fade fix). Usage: node check-mobile-bar.cjs [url]
const path = require('path');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const url = process.argv[2] || 'http://localhost:3000/';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(url + '#about', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(4000);
  for (const [name, up] of [['30-dissolve-early', 2], ['31-dissolve-mid', 2], ['32-dissolve-late', 2]]) {
    for (let i = 0; i < up; i++) { await page.mouse.wheel(0, -110); await page.waitForTimeout(250); }
    await page.waitForTimeout(1000);
    const frame = await page.evaluate(() => getComputedStyle(document.querySelector('[data-desert-window]')).getPropertyValue('--frame'));
    await page.screenshot({ path: path.join(__dirname, `390x844-${name}.png`), clip: { x: 0, y: 0, width: 390, height: 200 } });
    console.log(name, 'frame', frame);
  }
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
