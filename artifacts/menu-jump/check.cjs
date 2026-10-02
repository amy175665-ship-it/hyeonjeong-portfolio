// Usage: node check.cjs http://localhost:3000
// From the top, opens the menu and clicks ABOUT: behind the rising window the desert should already be in place
// (no sand cover replaying). Samples the hero visibility and sand position right after the click.
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
  await page.getByRole("button", { name: "메뉴 열기" }).click(); await wait(900);
  await page.evaluate(() => {
    window.__s = []; const t0 = performance.now();
    const tick = () => {
      const hero = document.querySelector("[data-pause-scope]"), sand = document.querySelector("img[class*=ConceptScenes_sand]");
      window.__s.push([Math.round(performance.now() - t0), hero && getComputedStyle(hero).visibility, sand && sand.style.transform]);
      if (performance.now() - t0 < 1500) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.getByRole("link", { name: "ABOUT", exact: true }).click();
  await wait(150); await page.screenshot({ path: path.join(__dirname, "desktop-150ms.png") });
  await wait(450); await page.screenshot({ path: path.join(__dirname, "desktop-600ms.png") });
  await wait(1200);
  const s = await page.evaluate(() => window.__s);
  const changes = s.filter((row, i) => i === 0 || row[1] !== s[i - 1][1] || row[2] !== s[i - 1][2]);
  console.log(JSON.stringify({ changes: changes.slice(0, 12), errors }));
  await browser.close();
})();
