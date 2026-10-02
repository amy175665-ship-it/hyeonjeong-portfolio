// Usage: node check.cjs [url] — falling sand stream: visible, layered under the dunes, no pointer blocking.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(7000);await p.mouse.move(w-5,h-5);
const r=await p.evaluate(()=>{const c=document.querySelector('canvas[class*=SandStream_stream]');const x=c.getContext('2d');const d=x.getImageData(0,0,c.width,c.height).data;let n=0,minX=1e9,maxX=0;for(let i=3;i<d.length;i+=4)if(d[i]>0){n++;const px=(i>>2)%c.width;minX=Math.min(minX,px);maxX=Math.max(maxX,px)}const s=getComputedStyle(c);const sand=document.querySelector('img[class*=Hero_sand]');return {painted:n,xRangeCss:[Math.round(minX/(c.width/c.clientWidth)),Math.round(maxX/(c.width/c.clientWidth))],z:s.zIndex,pe:s.pointerEvents,beforeSand:!!(c.compareDocumentPosition(sand)&Node.DOCUMENT_POSITION_FOLLOWING),overflow:document.documentElement.scrollWidth>innerWidth}});
if(w>=1024){const ch=p.locator('[class*=GrowthScene_char]');const bb=await ch.nth(4).boundingBox();r.hitOnR=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.className.slice(0,22),[bb.x+bb.width/2,bb.y+bb.height*.6]);}
r.errors=errors;out[w]=r;await p.screenshot({path:path.join(__dirname,w+'.png')});await p.close();}
const rm=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await rm.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await rm.waitForTimeout(6000);
out.reducedStatic=await rm.evaluate(async()=>{const c=document.querySelector('canvas[class*=SandStream_stream]');const a=c.toDataURL();await new Promise(r=>setTimeout(r,600));return a===c.toDataURL()});
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
