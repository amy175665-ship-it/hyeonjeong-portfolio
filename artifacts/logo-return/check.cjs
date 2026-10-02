// Usage: node check.cjs http://localhost:3000
// From inside the browser window, clicks the logo and samples the scroll and the sand position over time: the page
// should glide to the top over about 2.6 seconds while the sand rises over the scene and sinks back to the hero.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(url + "#project", { waitUntil: "domcontentloaded", timeout: 120000 });
  await wait(5000);
  const start = await page.evaluate(() => Math.round(scrollY));
  await page.evaluate(() => {
    window.__samples = []; const t0 = performance.now();
    const sand = document.querySelector("img[class*=sand]");
    const tick = () => {
      const t = performance.now() - t0;
      window.__samples.push([Math.round(t), Math.round(scrollY), Math.round(sand.getBoundingClientRect().top)]);
      if (t < 5000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.getByRole("link", { name: /홈/ }).click();
  const shots = [];
  for (const at of [700, 1500, 2300, 4500]) {
    await wait(at - (shots.at(-1) ?? 0));
    await page.screenshot({ path: path.join(__dirname, `desktop-${at}ms.png`) });
    shots.push(at);
  }
  const samples = await page.evaluate(() => window.__samples);
  const every = samples.filter((_, i) => i % Math.max(1, Math.floor(samples.length / 14)) === 0);
  console.log(JSON.stringify({ start, samples: every, final: samples.at(-1), url: page.url(), errors }));
  await browser.close();
})();
