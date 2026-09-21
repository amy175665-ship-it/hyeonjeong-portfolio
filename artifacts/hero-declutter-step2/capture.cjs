const { chromium } = require(process.env.LOCALAPPDATA + '/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  for (const [name, width, height] of [['desktop', 1440, 900], ['laptop', 1280, 800], ['mobile', 390, 844]]) {
    const p = await b.newPage({ viewport: { width, height } });
    await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await p.screenshot({ path: `artifacts/hero-declutter-step2/${name}.png` });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(name, 'horizontal overflow:', overflow);
    await p.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
