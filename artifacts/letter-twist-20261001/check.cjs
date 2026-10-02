// Usage: node check.cjs [url] — letter twist hover: no layout shift vs. kerned inline text, single-letter reaction.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const GREEN='rgb(143, 196, 71)';
(async()=>{const b=await chromium.launch();const out={};try{
for(const [w,h] of [[1440,900],[1024,768],[1920,1080]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(6000);
await p.mouse.move(w-5,h-5);
// pixel compare text region (left 60%, avatar excluded) against the original inline/kerned rendering
const clip={x:0,y:80,width:Math.round(w*.58),height:h-80};
const loose=await p.screenshot({clip});
const st=await p.addStyleTag({content:'[class*=GrowthScene_loose] [class*=GrowthScene_char],[class*=GrowthScene_loose] [class*=GrowthScene_glyph]{display:inline!important;margin:0!important}'});
await p.waitForTimeout(200);const inline=await p.screenshot({clip});await st.evaluate(e=>e.remove());await p.waitForTimeout(200);
out['diffPixels'+w]=await p.evaluate(async([a,c])=>{const load=async s=>{const i=new Image();i.src='data:image/png;base64,'+s;await i.decode();const cv=document.createElement('canvas');cv.width=i.width;cv.height=i.height;const x=cv.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data};const A=await load(a),C=await load(c);let n=0;for(let k=0;k<A.length;k+=4){if(Math.abs(A[k]-C[k])+Math.abs(A[k+1]-C[k+1])+Math.abs(A[k+2]-C[k+2])>60)n++}return n},[loose.toString('base64'),inline.toString('base64')]);
out['transition'+w]=await p.locator('[class*=GrowthScene_glyph]').first().evaluate(e=>getComputedStyle(e).transition+' | '+getComputedStyle(e.parentElement).transition);
// isolation check runs without transitions so the slow headless renderer cannot blur letter-to-letter timing
const noT=await p.addStyleTag({content:'[class*=GrowthScene_char],[class*=GrowthScene_glyph]{transition:none!important}'});
const looseCount=await p.locator('[class*=GrowthScene_loose]').count();
const chars=p.locator('[class*=GrowthScene_char]');const n=await chars.count();const fails=[];
for(let i=0;i<n;i++){const c=chars.nth(i);const bb=await c.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.55);await p.waitForTimeout(120);
const st=await chars.evaluateAll(es=>es.map(e=>({color:getComputedStyle(e).color,t:getComputedStyle(e.firstElementChild).transform})));
const changed=st.map((s,k)=>s.color!=='rgb(32, 39, 49)'||s.t!=='none'?k:-1).filter(k=>k>=0);
if(!(changed.length===1&&changed[0]===i&&st[i].color===GREEN&&st[i].t!=='none'))fails.push((await c.textContent())+i+' '+JSON.stringify(changed));
if(w===1440&&i===0)out.sampleTransforms=[];if(w===1440)out.sampleTransforms.push((await c.textContent())+' '+st[i].t);}
await p.mouse.move(w-5,h-5);await p.waitForTimeout(150);
out['restored'+w]=await chars.evaluateAll(es=>es.every(e=>getComputedStyle(e).color==='rgb(32, 39, 49)'&&getComputedStyle(e.firstElementChild).transform==='none'));
await noT.evaluate(e=>e.remove());out['looseWords'+w]=looseCount;out['fails'+w]=fails;out['errors'+w]=errors;
if(w===1440){for(const [k,name] of [[2,'S'],[8,'U'],[14,'R']]){const bb=await chars.nth(k).boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.55);await p.waitForTimeout(900);await p.screenshot({path:path.join(__dirname,`1440-hover-${name}.png`)});}}
await p.close();}
{const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(6000);const ch=p.locator('[class*=GrowthScene_char]');const w=await ch.nth(16).boundingBox();await p.mouse.move(w.x+w.width/2,w.y+w.height*.55);await p.waitForTimeout(900);const d=await ch.nth(17).boundingBox();await p.mouse.move(d.x+d.width/2,d.y+d.height*.8);await p.waitForTimeout(900);out.wThenPeriod=await ch.evaluateAll(es=>es.map((e,k)=>getComputedStyle(e).color==='rgb(143, 196, 71)'?k:-1).filter(k=>k>=0));await p.close();}
const r=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await r.goto(url,{waitUntil:'load'});await r.waitForTimeout(6000);const c=r.locator('[class*=GrowthScene_char]').nth(2);const bb=await c.boundingBox();await r.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.55);await r.waitForTimeout(100);
out.reduced=await c.evaluate(e=>({color:getComputedStyle(e).color,t:getComputedStyle(e.firstElementChild).transform}));
const m=await b.newPage({viewport:{width:390,height:844}});await m.goto(url,{waitUntil:'load'});await m.waitForTimeout(5000);out.mobileChars=await m.locator('[class*=GrowthScene_char]').count();out.mobileOverflow=await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
