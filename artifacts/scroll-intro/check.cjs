const { chromium } = require(process.argv[2]);
const path = require('path');
const fs = require('fs');
(async () => {
 const browser = await chromium.launch({headless:true});
 const results=[];
 try {
  for (const width of [1440,390,320,480,768]) {
   const page=await browser.newPage({viewport:{width,height:width===1440?900:844}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.argv[3],{waitUntil:'networkidle'});await page.waitForTimeout(1200);
   await page.screenshot({path:path.join(__dirname,`${width}-first.png`)});
   const stage=page.locator('[class*="scrollStage"]');
   const height=await stage.evaluate(e=>e.offsetHeight-innerHeight);
   const box=page.getByRole('region',{name:'인터랙티브 웹 제작 데모'});
   for(const [label,progress] of [['middle',.5],['full',.94]]) {
    await page.evaluate(y=>window.scrollTo(0,y),height*progress);await page.waitForTimeout(400);
    await page.screenshot({path:path.join(__dirname,`${width}-${label}.png`)});
   }
   const rect=await box.boundingBox();
   if(Math.abs(rect.x)>2||Math.abs(rect.width-width)>2)throw Error(`Not full width ${width}: ${JSON.stringify(rect)}`);
   for(const label of ['HTML','CSS','JavaScript','React']) {
    const button=page.getByRole('button',{name:label,exact:true});await button.click();
    if(await button.getAttribute('aria-pressed')!=='true')throw Error('Demo step failed');
   }
   await page.getByRole('button',{name:'나만의 웹 페이지 만들기'}).click();
   await page.getByRole('button',{name:'브라우저 데모 처음으로'}).click();
   for(const id of ['about','skill']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();await page.waitForTimeout(1300);
    await page.screenshot({path:path.join(__dirname,`${width}-${id}.png`)});
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   const clipped=await page.locator('#skill h3').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth));
   await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);
   const returned=await page.locator('#hero-title').isVisible();
   results.push({width,errors,overflow,clipped,returned});
   if(errors.length||overflow||clipped||!returned)throw Error(JSON.stringify(results));
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(process.argv[3],{waitUntil:'networkidle'});
  const position=await page.locator('[class*="stickyStage"]').evaluate(e=>getComputedStyle(e).position);
  if(position==='sticky')throw Error('Reduced motion remains sticky');
  results.push({reducedMotion:position});
  fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(results,null,2));console.log(results);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
