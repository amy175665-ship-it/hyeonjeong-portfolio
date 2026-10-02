// Usage: node capture.cjs http://localhost:3000
// After the story, each wheel step should turn exactly one page inside the desert browser window, and every page
// ([data-page]) should fit the window without being cut. Captures every stop.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["tablet", { width: 1024, height: 768 }], ["mobile", { width: 390, height: 844 }], ["small", { width: 320, height: 640 }]]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await wait(4000);
    const pages = await page.evaluate(() => {
      const view = document.querySelector("[class*=DesertWindow_viewport]").clientHeight;
      return { view, pages: [...document.querySelectorAll("[data-page]")].map(p => ({ id: p.id || p.closest("[id]")?.id, h: p.offsetHeight, fits: p.scrollHeight <= view + 1 })) };
    });
    for (let y = 0; y < 2 * Math.max(600, viewport.height) + 200; y += 200) { await page.mouse.wheel(0, 200); await wait(80); }
    await wait(2500);
    await page.locator("button", { hasText: "SKIP" }).click();
    await wait(1200);
    await page.mouse.wheel(0, 100); await wait(1800); // raise the window
    const stops = [];
    for (let i = 0; i < 12; i++) {
      const s = await page.evaluate(() => ({ y: Math.round(scrollY), address: document.querySelector("[class*=address]").textContent }));
      if (stops.length && stops.at(-1).y === s.y) break;
      stops.push(s);
      await page.screenshot({ path: path.join(__dirname, `${name}-${String(i).padStart(2, "0")}.png`) });
      await page.mouse.wheel(0, 100); await wait(1500);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(name, JSON.stringify({ ...pages, stops, overflow, errors }));
    await page.close();
  }
  await browser.close();
})();
