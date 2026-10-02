// Usage: node check.cjs [url] — the face fades in on its own a moment after the model loads.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
const sel='[class*=HeroAvatar_entrance]';await p.waitForSelector(sel,{state:'attached',timeout:60000});
await p.waitForFunction(s=>document.querySelector(s).className.includes('entranceReady'),sel,{timeout:60000});
const t0=Date.now();const samples=[];
for(const ms of [0,500,1200,2000,3200]){while(Date.now()-t0<ms)await p.waitForTimeout(50);samples.push(ms+'ms:'+(+await p.evaluate(s=>getComputedStyle(document.querySelector(s)).opacity,sel)).toFixed(2));if(ms===1200)await p.screenshot({path:path.join(__dirname,'1440-mid.png')});}
await p.screenshot({path:path.join(__dirname,'1440-done.png')});
console.log(samples.join('  '),'transition:',await p.evaluate(s=>getComputedStyle(document.querySelector(s)).transition,sel),'errors',errs.length);
const r=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await r.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await r.waitForTimeout(6000);
console.log('reduced:',await r.evaluate(s=>{const e=document.querySelector(s);return getComputedStyle(e).opacity+' '+getComputedStyle(e).transition},sel));}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
