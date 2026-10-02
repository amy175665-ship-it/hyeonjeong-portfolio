// Usage: node check.cjs http://localhost:3000
// After the story, one wheel step down should raise the browser window in one glide (and land on the start of its
// content); one wheel step up from there should lower it again back to the finished story.
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
    const state = () => page.evaluate(() => ({ y: Math.round(scrollY), windowTop: Math.round(document.querySelector("[class*=DesertWindow_window]").getBoundingClientRect().top) }));
    for (let y = 0; y < 2 * viewport.height + 200; y += 200) { await page.mouse.wheel(0, 200); await wait(80); }
    await wait(2500);
    await page.locator("button", { hasText: "SKIP" }).click();
    await wait(1500);
    const log = [["story end", await state()]];
    await page.mouse.wheel(0, 100);
    await wait(350);
    log.push(["down +0.35s", await state()]);
    await page.screenshot({ path: path.join(__dirname, `${name}-rising.png`) });
    await wait(1500);
    log.push(["down +1.85s", await state()]);
    await page.screenshot({ path: path.join(__dirname, `${name}-risen.png`) });
    await page.mouse.wheel(0, -100);
    await wait(350);
    log.push(["up +0.35s", await state()]);
    await wait(1500);
    log.push(["up +1.85s", await state()]);
    await page.screenshot({ path: path.join(__dirname, `${name}-lowered.png`) });
    await page.mouse.wheel(0, 100);
    await wait(1800);
    for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 200); await wait(100); }
    await wait(1500);
    log.push(["down again + scroll inside", await state()]);
    console.log(name, JSON.stringify({ log, errors }));
    await page.close();
  }
  await browser.close();
})();
