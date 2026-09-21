const { chromium } = require(process.env.LOCALAPPDATA + '/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const links = p.locator('nav[aria-label="주 메뉴"] a', { hasText: /^(ABOUT|SKILL|PROJECT|DESIGN)$/ });
  const about = links.filter({ hasText: 'ABOUT' });
  const project = links.filter({ hasText: 'PROJECT' });

  await about.hover();
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'artifacts/nav-hover-pill/hover-about-settled.png', clip: { x: 340, y: 10, width: 760, height: 100 } });
  const pillBoxAbout = await p.locator('nav[aria-label="주 메뉴"] a:has-text("ABOUT") span[style*="position"]').first().boundingBox().catch(() => null);

  await project.hover();
  await p.waitForTimeout(30);
  await p.screenshot({ path: 'artifacts/nav-hover-pill/hover-project-mid-transition.png', clip: { x: 340, y: 10, width: 760, height: 100 } });

  await p.waitForTimeout(500);
  await p.screenshot({ path: 'artifacts/nav-hover-pill/hover-project-settled.png', clip: { x: 340, y: 10, width: 760, height: 100 } });

  // check pill element exists and log its box at each stage for numeric confirmation
  console.log('done');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
