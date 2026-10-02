// Usage: node check.cjs [url] — "GROW." forms from sand falling from above, left to right.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(6000);
const g=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');return {top:t.getBoundingClientRect().top+scrollY,h:t.offsetHeight}});
// grow scene is 0.76-1 of the track
for(const [name,local] of [['a-start',0.3],['b-falling',0.45],['c-sweep',0.6],['d-final',0.98]]){const f=0.76+0.24*local;await p.evaluate(([g,f,h])=>window.scrollTo(0,g.top+(g.h-h)*f),[g,f,h]);await p.waitForTimeout(3500);await p.screenshot({path:path.join(__dirname,w+'-'+name+'.png')});}
console.log(w,'errors',errs.length,'overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await p.close();}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
