const { chromium } = require(process.argv[2]);
const path = require('path');
const fs = require('fs');
(async()=>{
 const browser=await chromium.launch();const results=[];
 try {
  for(const width of [1440,390,320,480,768]) {
   const p=await browser.newPage({viewport:{width,height:width===1440?900:844},hasTouch:true});const errors=[];
   p.on('pageerror',e=>errors.push(e.message));await p.goto(process.argv[3],{waitUntil:'networkidle'});
   await p.locator('#project').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(800);
   const title=p.locator('#project h3');
   if(!(await title.textContent()).includes('카페'))throw Error('Initial project');
   await p.getByRole('button',{name:'다음 프로젝트',exact:true}).click();await p.waitForTimeout(700);
   if(!(await title.textContent()).includes('상품'))throw Error('Next');
   await p.getByRole('button',{name:'이전 프로젝트',exact:true}).click();
   const region=p.getByRole('region',{name:'대표 프로젝트 탐색'});await region.focus();await p.keyboard.press('ArrowLeft');await p.waitForTimeout(600);
   if(!(await title.textContent()).includes('행사'))throw Error('Keyboard wrap');
   await p.keyboard.press('ArrowRight');await p.waitForTimeout(600);
   const stage=p.locator('[class*="ProjectCarousel_stage"]');
   await stage.dispatchEvent('pointerdown',{pointerType:'touch',clientX:250,clientY:200});
   await stage.dispatchEvent('pointerup',{pointerType:'touch',clientX:100,clientY:205});await p.waitForTimeout(600);
   if(!(await title.textContent()).includes('상품'))throw Error('Swipe');
   const issues=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.querySelectorAll('#project img')].some(i=>!i.complete||i.naturalWidth===0)}));
   await p.locator('#project').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(300);
   await p.screenshot({path:path.join(__dirname,`${width}-carousel.png`)});
   await p.locator('#project').screenshot({path:path.join(__dirname,`${width}-section.png`)});
   const href=await title.locator('a').getAttribute('href');if(href!='/work/product-catalog')throw Error(href);
   await title.locator('a').click();await p.waitForURL('**/work/product-catalog');
   results.push({width,...issues,errors,detail:true});if(issues.overflow||issues.images||errors.length)throw Error(JSON.stringify(results));
   await p.close();
  }
  fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(results,null,2));console.log(results);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
