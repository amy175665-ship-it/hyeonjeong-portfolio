// Usage: node check.cjs [url] — header hides behind the rising dune crest, fades back in on the covered sand.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(6000);
const g=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');return {top:t.getBoundingClientRect().top+scrollY,h:t.offsetHeight}});
for(const [name,local] of [['a-0',0],['b-30',0.3],['c-40',0.4],['d-50',0.5],['e-hold',0.54],['f-sink',0.62],['g-sink',0.75],['h-sink',0.9]]){const f=0.27*local;await p.evaluate(([g,f,h])=>window.scrollTo(0,g.top+(g.h-h)*f),[g,f,h]);await p.waitForTimeout(3500);
const st=await p.evaluate(()=>{const e=document.querySelector('header');return {clip:e.style.clipPath||'-',opacity:e.style.opacity||'-',pe:e.style.pointerEvents||'-'}});
console.log(w,name,JSON.stringify(st));await p.screenshot({path:path.join(__dirname,`${w}-${name}.png`),clip:{x:0,y:0,width:w,height:Math.min(h,260)}});}
// back to top restores
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(3500);console.log(w,'top again',await p.evaluate(()=>{const e=document.querySelector('header');return (e.style.clipPath||'-')+' '+(e.style.opacity||'-')+' btn:'+getComputedStyle(e.querySelector('button')).visibility}),'errors',errs.length);await p.close();}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
