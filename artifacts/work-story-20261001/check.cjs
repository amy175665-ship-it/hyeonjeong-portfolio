// Usage: node check.cjs [url] — WorkStory: rows render, images load, detail links work, #project anchor, no overflow.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[1024,768],[390,844],[320,640]]){
const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:'reduce'});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(5000);
const top=await p.evaluate(()=>Math.round(document.getElementById('project').getBoundingClientRect().top+scrollY));
const shots=[['head',top-110],['row2',top+h*0.9],['end',top+h*1.8]];
for(const [n,y] of shots){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(1800);await p.screenshot({path:path.join(__dirname,`${w}-${n}.png`)});}
const info=await p.evaluate(()=>{const s=document.getElementById('project');return {rows:s.querySelectorAll('ol > li').length,images:[...s.querySelectorAll('img')].map(i=>i.complete&&i.naturalWidth>0).join(','),bg:getComputedStyle(s).backgroundColor,carousel:document.querySelectorAll('[class*=ProjectCarousel]').length}});
console.log(w,JSON.stringify(info),'overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'errors',errs.length);await p.close();}
const n=await b.newPage({viewport:{width:1440,height:900}});await n.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await n.waitForTimeout(5000);
await n.getByRole('button',{name:'메뉴 열기'}).click();await n.waitForTimeout(600);await n.locator('#site-navigation a[href="/#project"]').first().click();await n.waitForTimeout(2000);console.log('nav project top',await n.evaluate(()=>Math.round(document.getElementById('project').getBoundingClientRect().top)));
await n.locator('#project a[href^="/work/"]').first().click();await n.waitForURL(/\/work\//,{timeout:60000});console.log('detail',new URL(n.url()).pathname);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
