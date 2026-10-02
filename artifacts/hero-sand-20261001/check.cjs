// Usage: node check.cjs [url] — sand dunes at the hero bottom: loading, coverage, layering, overflow.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[1024,768],[1920,1080],[390,844],[320,640]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForFunction(()=>{const s=document.querySelector('img[class*=Hero_sand]');return s&&s.complete&&s.naturalWidth>0},null,{timeout:90000});
await p.waitForTimeout(5000);await p.mouse.move(w-5,h-5);
out[w+'x'+h]=await p.evaluate(()=>{const s=document.querySelector('img[class*=Hero_sand]');const c=s.parentElement.getBoundingClientRect();const q=s.getBoundingClientRect();return {top:Math.round(q.top),bottom:Math.round(q.bottom),heroBottom:Math.round(c.bottom),coversBottom:q.bottom>=c.bottom,z:getComputedStyle(s).zIndex,overflow:document.documentElement.scrollWidth>innerWidth}});
out[w+'x'+h].errors=errors;await p.screenshot({path:path.join(__dirname,w+'.png')});await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
