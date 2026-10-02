// Usage: node scroll-past.cjs http://localhost:3000
// Scrolling straight past right after the cover, and reduced motion following the hold scroll.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await wait(4000);
  await page.evaluate(() => window.scrollTo(0, 1800));
  await wait(2500);
  await page.evaluate(() => window.scrollTo(0, 3500)); // end of the pinned hold, story still playing
  await wait(800);
  await page.screenshot({ path: path.join(__dirname, "desktop-scroll-past.png") });
  await page.close();
  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await reduced.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await wait(4000);
  for (const [y, name] of [[2300, "reduced-build"], [2900, "reduced-adapt"], [3550, "reduced-grow"]]) {
    await reduced.evaluate(y => window.scrollTo(0, y), y);
    await wait(3000);
    await reduced.screenshot({ path: path.join(__dirname, `desktop-${name}.png`) });
  }
  await browser.close();
})();
