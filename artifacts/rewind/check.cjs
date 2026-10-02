// Usage: node check.cjs http://localhost:3000
// Watches the story to the end, scrolls on a little, then wheels back up and logs how fast the cactus and text leave.
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
  const state = () => page.evaluate(() => {
    const cactus = document.querySelector("[class*=cactus]");
    const lead = [...document.querySelectorAll("p")].find(p => p.textContent.includes("웬만해선"));
    return { y: Math.round(scrollY), cactus: (+getComputedStyle(cactus).opacity).toFixed(2), closing: (+getComputedStyle(lead.parentElement).opacity).toFixed(2) };
  });
  for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, 200); await wait(80); }
  await wait(15000);
  const log = [["story finished", await state()]];
  await page.screenshot({ path: path.join(__dirname, "desktop-end.png") });
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 200); await wait(100); }
  await wait(1200);
  log.push(["scrolled on", await state()]);
  const start = Date.now();
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -200); await wait(100); }
  for (let i = 0; i < 6; i++) { log.push([`up +${Date.now() - start}ms`, await state()]); await wait(150); }
  await page.screenshot({ path: path.join(__dirname, "desktop-rewound.png") });
  console.log(JSON.stringify({ log, errors }));
  await browser.close();
})();
