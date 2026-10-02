// Usage: node capture.cjs http://localhost:3000
// Captures the BUILD. projects with their cream browser windows (desktop, 1024, mobile, 320) and the hover lift.
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
    await page.goto(url + "#project", { waitUntil: "domcontentloaded", timeout: 120000 });
    await wait(4000);
    await page.evaluate(() => document.getElementById("project").scrollIntoView());
    await wait(1500);
    // Bring every row into view once so its Reveal plays.
    for (const row of await page.$$("#project li")) { await row.scrollIntoViewIfNeeded(); await wait(400); }
    const first = await page.$("#project a[class*=window]");
    await first.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -120));
    await wait(1200);
    await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
    if (name === "desktop") {
      await first.hover();
      await wait(800);
      await page.screenshot({ path: path.join(__dirname, "desktop-hover.png") });
    }
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      windows: [...document.querySelectorAll("#project a[class*=window]")].map(a => { const r = a.getBoundingClientRect(), img = a.querySelector("img"); return { w: Math.round(r.width), address: a.querySelector("[class*=address]").textContent, imgLoaded: img.complete && img.naturalWidth > 0 }; }),
    }));
    console.log(name, JSON.stringify({ ...info, errors }));
    await page.close();
  }
  await browser.close();
})();
