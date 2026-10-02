// Usage: node capture.cjs http://localhost:3000
// Reduced motion lets the scroll pick each time of day, so the long low-sun shadows can be checked one by one.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await wait(4000);
    const hold = await page.evaluate(() => { const t = document.querySelector('section[aria-label*="컨셉"]'); return { start: (t.offsetHeight - innerHeight) / 2, length: (t.offsetHeight - innerHeight) / 2 }; });
    for (const [at, label] of [[0.3, "build"], [0.45, "sunset"], [0.62, "night"], [0.7, "dawn"]]) {
      await page.evaluate(y => window.scrollTo(0, y), Math.round(hold.start + hold.length * at));
      await wait(3000);
      await page.screenshot({ path: path.join(__dirname, `${name}-${label}.png`) });
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(name, JSON.stringify({ overflow, errors }));
    await page.close();
  }
  await browser.close();
})();
