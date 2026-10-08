// Phase 1 check: opening → sand hand-off → framed window → frame dissolve → floating header → hobbies → projects,
// then menu jump, the window's close button and the logo's way home. Usage: node check.cjs [url] [width] [height]
const path = require('path');
const { chromium } = require(path.join(process.env.LOCALAPPDATA, 'npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'));
const url = process.argv[2] || 'http://localhost:3000/';
const width = Number(process.argv[3] || 1440), height = Number(process.argv[4] || 900);
const tag = `${width}x${height}`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shot = name => page.screenshot({ path: path.join(__dirname, `${tag}-${name}.png`) });
  const state = () => page.evaluate(() => ({
    y: Math.round(scrollY),
    up: document.documentElement.hasAttribute('data-window-up'),
    frame: getComputedStyle(document.querySelector('[data-desert-window]')).getPropertyValue('--frame'),
    word: document.querySelector('header [class*="stageWord"]')?.textContent,
    headerTransform: getComputedStyle(document.querySelector('header')).transform,
    overflowX: document.documentElement.scrollWidth > innerWidth,
  }));
  const wheel = async (dy, times = 1, gap = 120) => { for (let i = 0; i < times; i++) { await page.mouse.wheel(0, dy); await page.waitForTimeout(gap); } };

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3500);
  await page.mouse.move(width - 5, height / 2);
  await shot('01-top');
  // to the scroll lock at the end of the cover, then skip the story
  let last = -1, still = 0;
  for (let i = 0; i < 200 && still < 6; i++) { await wheel(120); const y = await page.evaluate(() => scrollY); still = Math.abs(y - last) < 1 ? still + 1 : 0; last = y; }
  const skip = page.getByRole('button', { name: 'SKIP' });
  if (await skip.count()) await skip.click(); else await page.waitForTimeout(12000);
  await page.waitForTimeout(1500);
  await shot('02-story-end');
  await wheel(120); // hand-off
  await page.waitForTimeout(1300); await shot('03-handoff-mid');
  await page.waitForTimeout(2200); await shot('04-window');
  console.log('window up:', await state());
  await wheel(100, 3, 200); await page.waitForTimeout(900); await shot('05-dissolving');
  console.log('dissolving:', await state());
  await wheel(100, 6, 200); await page.waitForTimeout(1200); await shot('06-fullscreen');
  console.log('full screen:', await state());
  await wheel(-120, 1); await page.waitForTimeout(900); await shot('07-header-back-on-up');
  console.log('after scrolling up a little:', await state());
  await wheel(150, 8, 150); await page.waitForTimeout(1200); await shot('08-hobbies');
  console.log('hobbies:', await state());
  // header menu → PROJECTS
  await page.evaluate(() => window.scrollBy(0, -40)); await page.waitForTimeout(600);
  await page.getByRole('button', { name: '메뉴 열기' }).click(); await page.waitForTimeout(700);
  await page.getByRole('link', { name: 'PROJECTS' }).first().click(); await page.waitForTimeout(1800);
  await shot('09-menu-projects');
  console.log('menu → projects:', await state());
  // back to the top of the window, then the window's close button lowers it into the dunes
  await page.evaluate(() => window.scrollBy(0, -30)); await page.waitForTimeout(500);
  await page.getByRole('link', { name: 'ABOUT' }).first().click().catch(async () => { await page.getByRole('button', { name: '메뉴 열기' }).click(); await page.waitForTimeout(500); await page.getByRole('link', { name: 'ABOUT' }).first().click(); });
  await page.waitForTimeout(1500); await shot('10-menu-about');
  console.log('menu → about:', await state());
  await page.evaluate(() => window.scrollBy(0, -2)); await page.waitForTimeout(300);
  // scroll back into the framed state so the toolbar shows, then close
  await wheel(-100, 4, 200); await page.waitForTimeout(1500);
  console.log('scrolled back up:', await state());
  await shot('11-back-up');
  await page.waitForTimeout(3000); await shot('12-after-lowering');
  console.log('after lowering:', await state());
  // logo → home
  await page.getByRole('link', { name: /홈/ }).first().click(); await page.waitForTimeout(4500);
  await shot('13-home');
  console.log('home:', await state());
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
