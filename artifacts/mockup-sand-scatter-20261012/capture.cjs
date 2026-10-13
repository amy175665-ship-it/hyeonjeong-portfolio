// Usage: node capture.cjs http://localhost:3000
// Captures the layers the sand-scatter mockup needs from the live site (PC 1440×900):
//   end-bg.png   last cactus scene with the cactus and text removed (sky, dunes, header)
//   end-fg.png   only the cactus and text, on a transparent background (these scatter into sand)
//   about.png    the window opened on the intro page (the sand gathers into this)
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const out = name => path.join(__dirname, name);
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await wait(4000);
  for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, 200); await wait(80); }
  await wait(16000);
  // Hide the scroll cue in both layers; it would otherwise scatter as a stray line.
  const style = css => page.addStyleTag({ content: css });
  await style("[class*=scrollCue], [class*=skip] { visibility: hidden !important; }");
  const fg = "[class*=cactusWrap], [class*=pollenLayer], [class*=closing]";
  const bgTag = await style(`${fg} { visibility: hidden !important; }`);
  await wait(500);
  await page.screenshot({ path: out("end-bg.png") });
  await bgTag.evaluate(node => node.remove());
  await style(`html, body { background: transparent !important; }
    [class*=ConceptScenes_sky], [class*=skyLayer], [class*=ConceptScenes_sand], [class*=ConceptScenes_tint], [class*=groundFade], [class*=ConceptScenes_hero], header { visibility: hidden !important; }`);
  await wait(800);
  await page.screenshot({ path: out("end-fg.png"), omitBackground: true });
  // Back to the normal scene, then scroll on once so the sand hand-off opens the window on the intro page.
  await page.evaluate(() => document.querySelectorAll("style").forEach(node => { if (/visibility: hidden !important/.test(node.textContent) && !/scrollCue/.test(node.textContent)) node.remove(); }));
  await page.mouse.wheel(0, 200);
  await wait(6000);
  await page.addStyleTag({ content: "body [class*=CustomCursor] { display: none !important; }" });
  await wait(300);
  await page.screenshot({ path: out("about.png") });
  console.log(JSON.stringify({ errors }));
  await browser.close();
})();
