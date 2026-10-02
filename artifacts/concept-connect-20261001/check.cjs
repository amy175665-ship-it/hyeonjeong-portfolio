// Usage: node check.cjs [url] — sprout handover, phrase motion, fast/reverse scroll stability, about/projects reconnected, nav anchors.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
const state=p=>p.evaluate(()=>{const st=document.querySelector('section[aria-label*="컨셉"] > div');const ps=[...st.querySelectorAll(':scope > p')].map(e=>(+getComputedStyle(e).opacity).toFixed(2));const pollen=st.querySelector('canvas[class*=ConceptScenes_pollen]');const d=pollen.getContext('2d').getImageData(0,0,pollen.width,pollen.height).data;let px=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)px++;return {hero:getComputedStyle(st.querySelector('[class*=ConceptScenes_hero]')).visibility,sandTop:Math.round(st.querySelector(':scope > img').getBoundingClientRect().top),phrases:ps.join('/'),pollen:px}});
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(['error','warning'].includes(m.type())&&!/GL Driver|GPU stall|React DevTools|non-static position/.test(m.text()))errors.push(m.type()+': '+m.text().slice(0,160))});
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(6000);
const geo=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');const r=t.getBoundingClientRect();return {top:Math.round(r.top+scrollY),height:Math.round(r.height),doc:document.documentElement.scrollHeight}});
const at=f=>Math.round(geo.top+(geo.height-h)*f);
const r={geo};
// sprout: build local 0.12 (between sprout and first segment), and right after the handover
for(const [name,f] of [['sprout',0.36+0.24*0.13],['handover',0.36+0.24*0.27]]){await p.evaluate(y=>window.scrollTo(0,y),at(f));await p.waitForTimeout(2200);await p.screenshot({path:path.join(__dirname,`${w}-${name}.png`),clip:{x:0,y:Math.round(h*.35),width:w,height:Math.round(h*.6)}});}
// fast forward to the end, then jump back to the top, then into build
await p.evaluate(y=>window.scrollTo(0,y),at(1));await p.waitForTimeout(2500);r.end=await state(p);
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(3000);r.backTop=await state(p);
await p.evaluate(y=>window.scrollTo(0,y),at(0.5));await p.waitForTimeout(3000);r.build=await state(p);
// rapid back-and-forth
for(const f of [0.9,0.1,0.7,0.2,0.95,0.05]){await p.evaluate(y=>window.scrollTo(0,y),at(f));await p.waitForTimeout(120);}
await p.waitForTimeout(3000);r.afterRapid=await state(p);
// sections after the concept track
r.sections=await p.evaluate(()=>['about','skill','project'].map(id=>{const e=document.getElementById(id);return id+':'+(e?Math.round(e.getBoundingClientRect().top+scrollY):'missing')}).join(' '));
await p.evaluate(y=>window.scrollTo(0,y),geo.top+geo.height+10);await p.waitForTimeout(1500);await p.screenshot({path:path.join(__dirname,`${w}-after-concept.png`)});
// nav anchors
if(w>=1024){r.nav={};for(const id of ['about','project']){await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(800);await p.getByRole('button',{name:'메뉴 열기'}).click();await p.waitForTimeout(600);await p.locator(`#site-navigation a[href="/#${id}"]`).first().click();await p.waitForTimeout(1800);r.nav[id]=await p.evaluate(id=>{const e=document.getElementById(id);const top=Math.round(e.getBoundingClientRect().top);return {hash:location.hash,targetTop:top}},id);}}
r.overflowX=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);r.errors=errors;out[w]=r;await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
