// Usage: node check.cjs [url] — new concept copy and placement: phrases in the sky, closing under "GROW.".
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path'),fs=require('fs');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[390,844],[320,640]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(6000);
const g=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');return {top:t.getBoundingClientRect().top+scrollY,h:t.offsetHeight}});
const rows=[];
for(const [name,f] of [['build',.45],['sunset',.595],['night',.67],['final',.995]]){await p.evaluate(([g,f,h])=>window.scrollTo(0,g.top+(g.h-h)*f),[g,f,h]);await p.waitForTimeout(3500);
rows.push(name+' '+JSON.stringify(await p.evaluate(()=>{const st=document.querySelector('section[aria-label*="컨셉"] > div');const vis=[...st.querySelectorAll('[class*=ConceptScenes_phrase],[class*=ConceptScenes_closing]')].filter(e=>+getComputedStyle(e).opacity>.5).filter(e=>!e.className.includes('closingLead')&&!e.className.includes('closingNote'));return vis.map(e=>{const r=e.getBoundingClientRect();const c=document.querySelector('[class*=ConceptScenes_cactus]').getBoundingClientRect();return {text:e.textContent.slice(0,14),box:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)],inView:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}})})));
await p.screenshot({path:path.join(__dirname,w+'-'+name+'.png')});}
out[w]={rows,overflowX:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors:errs};await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
