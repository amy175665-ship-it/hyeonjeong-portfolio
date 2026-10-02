// Usage: node capture.cjs http://localhost:3000
// Every menu link (ABOUT, SKILLS, PROJECTS, DESIGN, CONTACT) should land on its section inside the desert browser
// window, with the address bar following; also captures the end of the window content.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }], ["small", { width: 320, height: 640 }]]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await wait(4000);
    const results = [];
    for (const [label, id] of [["ABOUT", "about"], ["SKILLS", "skill"], ["PROJECTS", "project"], ["DESIGN", "design"], ["CONTACT", "contact"]]) {
      await page.getByRole("button", { name: "메뉴 열기" }).click(); await wait(900);
      await page.getByRole("link", { name: label, exact: true }).click(); await wait(2200);
      const r = await page.evaluate(id => {
        const bar = document.querySelector("[class*=DesertWindow_bar]").getBoundingClientRect();
        return { top: Math.round(document.getElementById(id).getBoundingClientRect().top - bar.bottom), address: document.querySelector("[class*=address]").textContent };
      }, id);
      results.push([label, r]);
      if (label === "DESIGN" || label === "CONTACT") await page.screenshot({ path: path.join(__dirname, `${name}-${id}.png`) });
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await wait(2500);
    await page.screenshot({ path: path.join(__dirname, `${name}-end.png`) });
    const end = await page.evaluate(() => ({ address: document.querySelector("[class*=address]").textContent, overflow: document.documentElement.scrollWidth > innerWidth }));
    console.log(name, JSON.stringify({ results, end, errors }));
    await page.close();
  }
  await browser.close();
})();
