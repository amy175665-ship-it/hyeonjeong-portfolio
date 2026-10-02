// Usage: node capture.cjs http://localhost:3000
// Plays the cactus story to the end, captures the sand-toned GROW. and the scroll cue, then checks the cue leaves on scroll.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await wait(4000);
    const cue = () => page.evaluate(() => (+getComputedStyle(document.querySelector("[class*=scrollCue]")).opacity).toFixed(2));
    const coverEnd = await page.evaluate(() => { const t = document.querySelector('section[aria-label*="컨셉"]'); return (t.offsetHeight - innerHeight) * (2 / 2.8); });
    for (let y = 0; y < coverEnd + 200; y += 200) { await page.mouse.wheel(0, 200); await wait(80); }
    await wait(6000);
    const during = await cue();
    await wait(9000);
    const end = await cue();
    await page.screenshot({ path: path.join(__dirname, `${name}-end.png`) });
    for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 150); await wait(100); }
    await wait(1500);
    const after = await cue();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(name, JSON.stringify({ cueDuringPlay: during, cueAtEnd: end, cueAfterScroll: after, overflow, errors }));
    await page.close();
  }
  await browser.close();
})();
