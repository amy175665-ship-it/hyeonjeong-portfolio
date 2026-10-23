// Usage: node capture.cjs http://localhost:3000 [path to playwright]
// Captures the layers the opening sand mockup needs from the live site (PC 1440×900):
//   hero-sky.png    hero without its face, words and dunes          hero-face.png  only the 3D face (transparent)
//   hero-fg.png     only the hero words and dunes (these scatter)   header.png     only the header (transparent)
//   desert-sky.png  desert stage without dunes, cactus and text     desert-sand.png only the desert dunes (transparent)
//   cactus-NN.png   the 3D cactus growing (build scene), clipped, transparent; times in cactus.json
const path = require("path"), fs = require("fs");
const pw = process.argv[3] || path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright");
const { chromium } = require(pw);
const url = process.argv[2] || "http://localhost:3000";
const out = name => path.join(__dirname, name);
const wait = ms => new Promise(r => setTimeout(r, ms));
const CLIP = { x: 740, y: 300, width: 480, height: 600 };
(async () => {
  const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.addStyleTag({ content: "[class*=CustomCursor] { display: none !important; }" });
  await wait(9000);
  // Layer helpers: hide some elements, or show only some (everything else hidden, transparent page).
  const hide = sel => page.addStyleTag({ content: `${sel} { visibility: hidden !important; }` });
  const only = sel => page.addStyleTag({ content: `html, body { background: transparent !important; } body * { visibility: hidden !important; }
    ${sel.split(",").map(s => `${s}, ${s} *`).join(", ")} { visibility: visible !important; }` });
  const drop = tag => tag.evaluate(node => node.remove());
  const shot = (name, opts = {}) => page.screenshot({ path: out(name), ...opts });

  const words = "[class*=GrowthScene_absorb], [class*=GrowthScene_build], [class*=GrowthScene_grow]";
  const dunes = "img[class*=ConceptScenes_sand]";
  const face = "[class*=HeroAvatar_avatar]";
  let t = await hide(`${words}, ${dunes}, [class*=SandStream], header, [class*=ConceptScenes_jump]`);
  await wait(400); await shot("hero-face-sky.png");
  const t2 = await hide(face); await wait(300); await shot("hero-sky.png"); await drop(t2); await drop(t);
  t = await only(face); await wait(400); await shot("hero-face.png", { omitBackground: true }); await drop(t);
  t = await only(`${words}, ${dunes}`); await wait(400); await shot("hero-fg.png", { omitBackground: true }); await drop(t);
  t = await only("header"); await wait(300); await shot("header.png", { omitBackground: true }); await drop(t);

  // Into the story: only the cactus stays visible while the frames are taken.
  t = await only("[class*=cactusWrap]");
  for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, 200); await wait(80); }
  const start = Date.now();
  while (Date.now() - start < 20000 && !(await page.$("[class*=ConceptScenes_skip]"))) await wait(30);
  const t0 = Date.now(), times = [];
  for (let n = 0; Date.now() - t0 < 2900; n++) {
    const at = (Date.now() - t0) / 1000;
    await shot(`cactus-${String(n).padStart(2, "0")}.png`, { clip: CLIP, omitBackground: true });
    times.push(+at.toFixed(3));
  }
  fs.writeFileSync(out("cactus.json"), JSON.stringify({ clip: CLIP, times }));
  await drop(t);
  await page.click("[class*=ConceptScenes_skip]").catch(() => {});
  await wait(1500);
  const story = "[class*=cactusWrap], [class*=pollenLayer], [class*=ConceptScenes_phrase], [class*=ConceptScenes_statement], [class*=ConceptScenes_closing], [class*=ConceptScenes_skip], [class*=scrollCue], [class*=groundFade], [class*=ConceptScenes_gust], [class*=sandHandoff], header";
  t = await hide(`${story}, ${dunes}`); await wait(400); await shot("desert-sky.png"); await drop(t);
  t = await only(dunes); await wait(400); await shot("desert-sand.png", { omitBackground: true }); await drop(t);
  const box = await page.$eval(dunes, e => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; });
  console.log(JSON.stringify({ errors, frames: times.length, times, desertSandBox: box }));
  await browser.close();
})();
