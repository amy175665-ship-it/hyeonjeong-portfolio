// Usage: node check.cjs [url] — SCENE 3: English two-tone statement on the left, cactus shifted right and larger (desktop).
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[1920,1080],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(6000);
const g=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');return {top:t.getBoundingClientRect().top+scrollY,h:t.offsetHeight}});
// adapt 0.54-0.76, grow 0.76-1
const rows=[];
for(const [name,f] of [['sunset',.54+.22*.3],['night',.54+.22*.6],['dawn',.54+.22*.92],['final',.995]]){await p.evaluate(([g,f,h])=>window.scrollTo(0,g.top+(g.h-h)*f),[g,f,h]);await p.waitForTimeout(3500);
rows.push(name+' '+JSON.stringify(await p.evaluate(()=>{const st=document.querySelector('[class*=ConceptScenes_statement]');const s=st.getBoundingClientRect();const c=document.querySelector('[class*=ConceptScenes_cactus]').getBoundingClientRect();return {statement:[Math.round(s.left),Math.round(s.top),Math.round(s.right),Math.round(s.bottom)],opacity:(+getComputedStyle(st).opacity).toFixed(2),cactusCenterPct:Math.round((c.left+c.width/2)/innerWidth*100),cactusTop:Math.round(c.top)}})));
await p.screenshot({path:path.join(__dirname,w+'-'+name+'.png')});}
console.log(w,'errors',errs.length,'overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));rows.forEach(r=>console.log('  ',r));await p.close();}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
