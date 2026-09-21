const { chromium } = require(process.env.LOCALAPPDATA + '/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
(async () => {
 const browser = await chromium.launch({headless:true});
 const results = [];
 for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small-mobile',320,720],['large-mobile',480,900]]) {
  const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://localhost:3102',{waitUntil:'networkidle'});
  await page.screenshot({path:`artifacts/component-structure/${name}-first.png`});
  for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=650){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(150);}
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(800);
  await page.screenshot({path:`artifacts/component-structure/${name}-full.png`,fullPage:true});
  results.push({name,width,height,errors,...await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)}).map(e=>({tag:e.tagName,class:e.className})).slice(0,15)}))});
  await page.close();
 }
 fs.writeFileSync('artifacts/component-structure/checks.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


