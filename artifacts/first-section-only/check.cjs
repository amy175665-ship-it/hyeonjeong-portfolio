const { chromium } = require(process.argv[2]);
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(process.argv[3], { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const result = await page.evaluate(() => ({
        sections: document.querySelectorAll('main section').length,
        footer: !!document.querySelector('footer'),
        overflow: document.documentElement.scrollWidth > innerWidth,
        title: document.querySelector('h1')?.getAttribute('aria-label'),
      }));
      await page.screenshot({ path: path.join(__dirname, `screen-${width}.png`), fullPage: true });
      console.log(JSON.stringify({ width, ...result, errors }));
      if (result.sections !== 1 || result.footer || result.overflow || errors.length) throw Error('화면 확인 실패');
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
