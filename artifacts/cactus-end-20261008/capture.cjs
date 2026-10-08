// 선인장 이야기 재생이 끝나는 장면 캡처. 사용법: node capture.cjs [주소] [폭] [높이]
const path = require('path');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const url = process.argv[2] || 'http://localhost:3000/';
const width = Number(process.argv[3] || 1440), height = Number(process.argv[4] || 900);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3000);
  await page.mouse.move(width / 2, height / 2);
  // 스크롤 고정(재생 시작)으로 위치가 더 이상 바뀌지 않을 때까지 휠
  let last = -1, still = 0;
  for (let i = 0; i < 200 && still < 6; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(120);
    const y = await page.evaluate(() => scrollY);
    still = Math.abs(y - last) < 1 ? still + 1 : 0;
    last = y;
  }
  console.log('locked at scrollY', last);
  const tag = `${width}x${height}`;
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.join(__dirname, `grow-${tag}.png`) });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: path.join(__dirname, `end-${tag}.png`) });
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
