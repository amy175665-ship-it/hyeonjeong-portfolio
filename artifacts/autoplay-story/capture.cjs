// Usage: node capture.cjs http://localhost:3000
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const out = __dirname;
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await wait(4000);
    const info = await page.evaluate(() => {
      const t = document.querySelector('section[aria-label*="컨셉"]');
      return { track: t.offsetHeight, vh: innerHeight, scrollToAbout: document.getElementById("about")?.getBoundingClientRect().top + scrollY };
    });
    // Scroll in wheel steps to the end of the cover (half of the pinned scroll = 2 screens).
    const coverEnd = (info.track - info.vh) / 2;
    for (let y = 0; y < coverEnd; y += 300) { await page.mouse.wheel(0, 300); await wait(60); }
    await page.evaluate(y => window.scrollTo(0, y), coverEnd + 10);
    const shots = [];
    for (const t of [1500, 3500, 5500, 9000]) {
      await wait(t - (shots.at(-1)?.t ?? 0));
      const phrases = await page.evaluate(() => [...document.querySelectorAll("section p")].filter(p => /직접 만들고|표면을|웬만해선/.test(p.textContent)).map(p => [p.textContent.slice(0, 8), getComputedStyle(p.closest("[style]") || p).opacity]));
      await page.screenshot({ path: path.join(out, `${name}-${t}ms.png`) });
      shots.push({ t, phrases, scrollY: await page.evaluate(() => scrollY) });
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(JSON.stringify({ name, info, coverEnd, shots, overflow, errors }, null, 1));
    await page.close();
  }
  await browser.close();
})();
