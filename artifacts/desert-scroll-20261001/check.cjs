// Usage: node check.cjs [url] — scroll sections hidden; the desert continues below the hero while scrolling.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForFunction(()=>{const s=document.querySelector('img[class*=Hero_sand]');return s&&s.complete&&s.naturalWidth>0},null,{timeout:90000});await p.waitForTimeout(5000);await p.mouse.move(w-5,h-5);
const info=await p.evaluate(()=>{const s=document.querySelector('img[class*=Hero_sand]').getBoundingClientRect();return {docHeight:document.documentElement.scrollHeight,sandTop:Math.round(s.top),sandBottom:Math.round(s.bottom),natural:document.querySelector('img[class*=Hero_sand]').naturalWidth+'x'+document.querySelector('img[class*=Hero_sand]').naturalHeight,scrollSections:document.querySelectorAll('[class*=ScrollHero_journey],[class*=ProjectCarousel]').length,overflowX:document.documentElement.scrollWidth>innerWidth}});
const shots=[0,Math.round(h*.9),info.docHeight-h];
for(const [k,y] of shots.entries()){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(700);await p.screenshot({path:path.join(__dirname,`${w}-${k}.png`)});}
// bottom of page must be sand, not a blank band
info.bottomPixel=await p.evaluate(()=>{const s=document.querySelector('img[class*=Hero_sand]').getBoundingClientRect();return Math.round(s.bottom)-innerHeight});
info.errors=errors;out[w]=info;await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
