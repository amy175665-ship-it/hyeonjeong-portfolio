// Usage: node check.cjs [url] — hero stays pinned while only the desert rises with scroll.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForFunction(()=>{const s=document.querySelector('img[class*=Hero_sand]');return s&&s.complete&&s.naturalWidth>0},null,{timeout:90000});await p.waitForTimeout(5000);await p.mouse.move(w-5,h-5);
const docH=await p.evaluate(()=>document.documentElement.scrollHeight);const rows=[];
for(const [k,f] of [0,.5,1].entries()){const y=Math.round((docH-h)*f);await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(900);
rows.push(await p.evaluate(()=>{const c=document.querySelector('[class*=Hero_composition]').getBoundingClientRect();const s=document.querySelector('img[class*=Hero_sand]').getBoundingClientRect();const t=document.querySelector('[class*=DesertScroll_track]');return {scrollY:Math.round(scrollY),heroTop:Math.round(c.top),sandTop:Math.round(s.top),sandBottom:Math.round(s.bottom),progress:getComputedStyle(t).getPropertyValue('--desert-progress').trim()}}));
await p.screenshot({path:path.join(__dirname,`${w}-${k}.png`)});}
out[w]={docH,rows,overflowX:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors};await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
