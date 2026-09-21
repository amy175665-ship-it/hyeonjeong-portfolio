const { chromium } = require(process.env.LOCALAPPDATA + '/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  for (const [name, width, height] of [['w1150-just-above-breakpoint', 1150, 800], ['w1024-tablet', 1024, 900]]) {
    const p = await b.newPage({ viewport: { width, height } });
    await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await p.screenshot({ path: `artifacts/hero-declutter-step2/${name}.png` });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(name, 'overflow:', overflow);
    await p.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
