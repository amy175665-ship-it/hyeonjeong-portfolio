// Usage: node check.cjs http://localhost:3000
// Wheels down into the cactus story and checks the page stays put while it plays, then scrolls on again.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await wait(4000);
  const y = () => page.evaluate(() => Math.round(scrollY));
  const log = [];
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 200); await wait(80); }
  await wait(1500);
  log.push(["after wheel into story", await y()]);
  const start = Date.now();
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 600); await wait(300);
    await page.keyboard.press("PageDown"); await wait(300);
    await page.mouse.wheel(0, -600); await wait(800);
    log.push([`playing +${((Date.now() - start) / 1000).toFixed(1)}s`, await y()]);
  }
  await page.screenshot({ path: path.join(__dirname, "desktop-locked.png") });
  await wait(Math.max(0, 14000 - (Date.now() - start)));
  for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, 300); await wait(80); }
  await wait(1500);
  log.push(["after story, wheel down", await y()]);
  await page.screenshot({ path: path.join(__dirname, "desktop-after.png") });
  console.log(JSON.stringify({ log, errors }, null, 1));
  await browser.close();
})();
