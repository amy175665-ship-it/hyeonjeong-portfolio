// 선인장 마지막 장면 → 모래 전환 → 브라우저 창 등장을 프레임으로 캡처. 사용법: node capture.cjs [주소] [폭] [높이]
const path = require('path');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const url = process.argv[2] || 'http://localhost:3000/';
const width = Number(process.argv[3] || 1440), height = Number(process.argv[4] || 900);
const tag = `${width}x${height}`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3000);
  await page.mouse.move(width - 5, 5); // 커서가 화면 가운데를 가리지 않게
  let last = -1, still = 0;
  for (let i = 0; i < 200 && still < 6; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(120);
    const y = await page.evaluate(() => scrollY);
    still = Math.abs(y - last) < 1 ? still + 1 : 0;
    last = y;
  }
  // SKIP으로 이야기를 끝낸 뒤 마지막 장면이 자리 잡을 때까지 대기
  const skip = page.getByRole('button', { name: 'SKIP' });
  if (await skip.count()) await skip.click(); else await page.waitForTimeout(12000);
  await page.waitForTimeout(1500);
  const shot = name => page.screenshot({ path: path.join(__dirname, `${tag}-${name}.png`) });
  await shot('00-end');
  await page.mouse.wheel(0, 120);
  for (let i = 1; i <= 17; i++) { await page.waitForTimeout(200); await shot(`f${String(i).padStart(2, '0')}`); }
  await page.waitForTimeout(1500);
  await shot('99-window');
  // 되돌리기: 창 맨 위에서 위로 스크롤
  await page.mouse.wheel(0, -120);
  for (let i = 1; i <= 8; i++) { await page.waitForTimeout(400); await shot(`r${i}`); }
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
