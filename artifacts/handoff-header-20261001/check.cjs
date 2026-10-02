// Usage: node check.cjs [url] — story → about hand-off (no hard edge) and solid header after the story.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(6000);
const g=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');return {top:t.getBoundingClientRect().top+scrollY,h:t.offsetHeight}});
const rows=[];
for(const [name,y] of [['top',0],['story-end',g.top+g.h-h],['leaving',g.top+g.h-h*0.45],['handoff',g.top+g.h],['about',g.top+g.h+h*0.35]]){await p.evaluate(y=>window.scrollTo(0,y),Math.round(y));await p.waitForTimeout(3000);
rows.push(name+' solid:'+await p.evaluate(()=>document.documentElement.hasAttribute('data-header-solid'))+' barOpacity:'+await p.evaluate(()=>getComputedStyle(document.querySelector('header'),'::before').opacity));
await p.screenshot({path:path.join(__dirname,w+'-'+name+'.png')});}
console.log(w,'errors',errs.length,'overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));rows.forEach(r=>console.log('  ',r));await p.close();}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
