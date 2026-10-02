const { chromium } = require(process.argv[2]);
const path = require('path');
(async () => {
 const browser = await chromium.launch({ headless: true });
 try {
  for (const [width,height] of [[1440,900],[390,844]]) {
   const page = await browser.newPage({viewport:{width,height}});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.argv[3],{waitUntil:'networkidle'});
   await page.waitForTimeout(1500);
   const result=await page.locator('#hero-title').evaluate(e=>({opacity:getComputedStyle(e).opacity,height:e.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth}));
   await page.screenshot({path:path.join(__dirname,`${width}.png`)});
   console.log(JSON.stringify({width,...result,errors}));
   if(result.opacity!=='0'||result.height<=0||result.overflow||errors.length) throw Error('Visual check failed');
   await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
