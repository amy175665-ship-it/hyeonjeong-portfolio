// Usage: node check.cjs [url] — concept track: seamless hand-off from the desert, SCENE 2 cactus growth and gusts.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,160))});
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(6000);
const geo=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');const r=t.getBoundingClientRect();return {top:Math.round(r.top+scrollY),height:Math.round(r.height)}});
const shots=[['desert-end',geo.top-h+0],['concept-0',geo.top],['rise-done',geo.top+(geo.height-h)*0.2],['build-30',geo.top+(geo.height-h)*(0.25+0.3*0.3)],['build-70',geo.top+(geo.height-h)*(0.25+0.3*0.7)],['build-95',geo.top+(geo.height-h)*(0.25+0.3*0.95)],['scene3',geo.top+(geo.height-h)*0.65]];
const rows=[];
for(const [name,y] of shots){await p.evaluate(y=>window.scrollTo(0,y),Math.round(y));await p.waitForTimeout(1200);
rows.push(await p.evaluate(n=>{const st=document.querySelector('section[aria-label*="컨셉"] > div');const s=st.querySelector('img');const r=st.getBoundingClientRect();return n+' stageTop:'+Math.round(r.top)+' sandTop:'+Math.round(s.getBoundingClientRect().top)+' phrase:'+getComputedStyle(st.querySelector('p')).opacity},name));
await p.screenshot({path:path.join(__dirname,`${w}-${name}.png`)});}
out[w]={geo,rows,overflowX:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors};await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
