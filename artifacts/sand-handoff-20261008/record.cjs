// 선인장 마지막 장면 → 모래 전환 → 브라우저 창 등장 → (위로 스크롤) 되돌아가기를 영상(webm)으로 녹화.
// 사용법: node record.cjs [주소] [폭] [높이]
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const url = process.argv[2] || 'http://localhost:3000/';
const width = Number(process.argv[3] || 1440), height = Number(process.argv[4] || 900);
const tag = `${width}x${height}`;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width, height }, recordVideo: { dir: __dirname, size: { width, height } } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3000);
  await page.mouse.move(width - 5, 5);
  let last = -1, still = 0;
  for (let i = 0; i < 200 && still < 6; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(120);
    const y = await page.evaluate(() => scrollY);
    still = Math.abs(y - last) < 1 ? still + 1 : 0;
    last = y;
  }
  const skip = page.getByRole('button', { name: 'SKIP' });
  if (await skip.count()) await skip.click(); else await page.waitForTimeout(12000);
  await page.waitForTimeout(2000);
  const t0 = Date.now();
  await page.mouse.wheel(0, 120); // 내려가기: 모래 전환 → 창
  await page.waitForTimeout(5000);
  await page.mouse.wheel(0, -120); // 올라가기: 되돌아가기
  await page.waitForTimeout(4500);
  console.log('transition started at', ((t0 - Date.now()) / 1000).toFixed(1), 's from end');
  const video = page.video();
  await context.close();
  const file = await video.path();
  const out = path.join(__dirname, `handoff-${tag}.webm`);
  fs.renameSync(file, out);
  console.log('video:', out, 'errors:', errors.length ? errors : 'none');
  await browser.close();
})();
