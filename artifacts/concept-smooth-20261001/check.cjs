// Usage: node check.cjs [url] — sand covers the hero, the backdrop swaps, the sand sinks and SCENE 2 plays.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,160))});
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(6000);
const geo=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');const r=t.getBoundingClientRect();return {top:Math.round(r.top+scrollY),height:Math.round(r.height),doc:document.documentElement.scrollHeight}});
const at=f=>geo.top+(geo.height-h)*f;
const shots=[['0-hero',0],['1-rising',at(0.1)],['2-covered',at(0.21)],['3-sinking',at(0.33)],['4-build-50',at(0.56)],['5-build-95',at(0.69)],['6-adapt',at(0.78)]];
const rows=[];
if(w>=1024){const ch=p.locator('[class*=GrowthScene_char]');const bb=await ch.nth(14).boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.5);await p.waitForTimeout(400);out['hoverGrowR']=await ch.nth(14).evaluate(e=>getComputedStyle(e).color);await p.mouse.move(w-5,5);}
for(const [name,y] of shots){await p.evaluate(y=>window.scrollTo(0,y),Math.round(y));await p.waitForTimeout(2500);
rows.push(await p.evaluate(n=>{const st=document.querySelector('section[aria-label*="컨셉"] > div');const s=st.querySelector(':scope > img');const hero=st.querySelector('[class*=ConceptScenes_hero]');return n+' stageTop:'+Math.round(st.getBoundingClientRect().top)+' sandTop:'+Math.round(s.getBoundingClientRect().top)+' hero:'+getComputedStyle(hero).visibility},name));
await p.screenshot({path:path.join(__dirname,`${w}-${name}.png`)});}
out[w]={geo,rows,overflowX:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors};await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
