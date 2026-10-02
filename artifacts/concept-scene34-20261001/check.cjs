// Usage: node check.cjs [url] — SCENE 3 (sky turns day→sunset→night→dawn) and SCENE 4 (bloom, pollen forms GROW.).
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,160))});
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(6000);
const geo=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');const r=t.getBoundingClientRect();return {top:Math.round(r.top+scrollY),height:Math.round(r.height)}});
const at=f=>geo.top+(geo.height-h)*f;
// adapt 0.6-0.78, grow 0.78-1
const shots=[['0-hero',0],['1-build-end',at(0.59)],['2-sunset',at(0.6+0.18*0.25)],['3-night',at(0.6+0.18*0.6)],['4-dawn',at(0.6+0.18*0.92)],['5-bloom',at(0.78+0.22*0.25)],['6-forming',at(0.78+0.22*0.45)],['7-final',at(0.995)]];
const rows=[];
for(const [name,y] of shots){await p.evaluate(y=>window.scrollTo(0,y),Math.round(y));await p.waitForTimeout(2500);
rows.push(await p.evaluate(n=>{const st=document.querySelector('section[aria-label*="컨셉"] > div');const ps=[...st.querySelectorAll(':scope > p')].map(e=>e.textContent+'='+(+getComputedStyle(e).opacity).toFixed(2));const pollen=st.querySelector('canvas[class*=ConceptScenes_pollen]');const d=pollen.getContext('2d').getImageData(0,0,pollen.width,pollen.height).data;let px=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)px++;return n+' | '+ps.join(' ')+' | pollenPx:'+px},name));
await p.screenshot({path:path.join(__dirname,`${w}-${name}.png`)});}
out[w]={rows,overflowX:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors};await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
