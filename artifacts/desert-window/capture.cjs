// Usage: node capture.cjs http://localhost:3000
// Story → SKIP → the window rising out of the dunes → content moving inside it → menu jump to PROJECTS.
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
    const state = () => page.evaluate(() => ({
      y: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight,
      address: document.querySelector("[class*=address]")?.textContent,
      windowTop: Math.round(document.querySelector("[class*=DesertWindow_window]")?.getBoundingClientRect().top ?? -1),
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    const shot = async label => { await page.screenshot({ path: path.join(__dirname, `${name}-${label}.png`) }); return [label, await state()]; };
    const log = [];
    const H = viewport.height < 600 ? 600 : viewport.height;
    for (let y = 0; y < 2 * H + 200; y += 200) { await page.mouse.wheel(0, 200); await wait(80); }
    await wait(2500);
    await page.locator("button", { hasText: "SKIP" }).click();
    await wait(1500);
    log.push(await shot("1-story-end"));
    await page.mouse.wheel(0, Math.round(H * 0.4)); await wait(1800);
    log.push(await shot("2-rising"));
    await page.mouse.wheel(0, Math.round(H * 0.5)); await wait(1800);
    log.push(await shot("3-window"));
    for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 300); await wait(120); }
    await wait(1800);
    log.push(await shot("4-inside"));
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await wait(2500);
    log.push(await shot("5-end"));
    // Menu jump from the very top.
    await page.evaluate(() => window.scrollTo(0, 0)); await wait(2500);
    await page.getByRole("button", { name: "메뉴 열기" }).click(); await wait(900);
    await page.getByRole("link", { name: "PROJECTS" }).click(); await wait(3000);
    log.push(await shot("6-menu-projects"));
    const projectTop = await page.evaluate(() => Math.round(document.getElementById("project").getBoundingClientRect().top));
    console.log(name, JSON.stringify({ log, projectTopAfterMenu: projectTop, errors }));
    await page.close();
  }
  await browser.close();
})();
