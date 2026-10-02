// Usage: node check.cjs [url] — Hahmlet loads for the Korean concept phrases.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));const fontReqs=[];p.on('response',r=>{if(/\.woff2/.test(r.url())&&!/Pretendard|DMSerif/.test(r.url()))fontReqs.push(r.status())});
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(6000);
const g=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');return {top:t.getBoundingClientRect().top+scrollY,h:t.offsetHeight}});
for(const [name,f] of [['build',.45],['night',.67],['final',.995]]){await p.evaluate(([g,f,h])=>window.scrollTo(0,g.top+(g.h-h)*f),[g,f,h]);await p.waitForTimeout(3500);await p.screenshot({path:path.join(__dirname,w+'-'+name+'.png')});}
const info=await p.evaluate(async()=>{await document.fonts.ready;return {variable:getComputedStyle(document.body).getPropertyValue('--font-hangul-serif').trim(),loadedFaces:[...document.fonts].filter(f=>f.status==='loaded'&&/Noto_Serif_KR|Noto Serif KR/i.test(f.family)).length}});
console.log(w,JSON.stringify(info),'hangulFiles',fontReqs.length,'statuses',[...new Set(fontReqs)].join(','),'errors',errs.length);await p.close();}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
