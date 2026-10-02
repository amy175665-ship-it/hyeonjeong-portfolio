// Usage: node check.cjs [url] — final pass: full-scroll captures, render-loop pausing, reduced motion, screen-reader text.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const out={};
// Count WebGL draw calls per canvas so we can tell which 3D scenes are still rendering.
const countDraws=()=>{for(const C of [WebGLRenderingContext,WebGL2RenderingContext]){for(const m of ['drawArrays','drawElements']){const o=C.prototype[m];C.prototype[m]=function(...a){const c=this.canvas;c.__draws=(c.__draws||0)+1;return o.apply(this,a)}}}};
const draws=async(p,ms=1200)=>{await p.evaluate(()=>document.querySelectorAll('canvas').forEach(c=>c.__draws=0));await p.waitForTimeout(ms);return p.evaluate(()=>{const r={};document.querySelectorAll('canvas').forEach(c=>{if(c.__draws===undefined)return;const k=c.closest('[class*=HeroAvatar]')?'avatar':c.closest('[class*=ConceptScenes_cactus]')?'cactus':'other';r[k]=(r[k]||0)+(c.__draws||0)});return r})};
const snap=c=>c.toDataURL();
(async()=>{const b=await chromium.launch();try{
for(const [w,h] of [[1440,900],[1024,768],[390,844],[320,640]]){
const p=await b.newPage({viewport:{width:w,height:h}});await p.addInitScript(countDraws);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,160))});
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(7000);
const geo=await p.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');const r=t.getBoundingClientRect();const a=document.getElementById('about'),pr=document.getElementById('project');return {top:Math.round(r.top+scrollY),height:Math.round(r.height),about:Math.round(a.getBoundingClientRect().top+scrollY),project:Math.round(pr.getBoundingClientRect().top+scrollY),doc:document.documentElement.scrollHeight}});
const at=f=>Math.round(geo.top+(geo.height-h)*f);
const stops=[['01-hero',0],['02-rising',at(.06)],['03-covered',at(.13)],['04-sinking',at(.21)],['05-sprout',at(.305)],['06-build',at(.43)],['07-sunset',at(.595)],['08-night',at(.67)],['09-dawn',at(.742)],['10-bloom',at(.82)],['11-final',at(.995)],['12-about',geo.about-80],['13-project',geo.project-80]];
const r={geo,overflow:[]};
for(const [name,y] of stops){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(2200);if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))r.overflow.push(name);await p.screenshot({path:path.join(__dirname,`${w}-${name}.png`)});}
// render loops
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(2500);r.drawsHero=await draws(p);
await p.evaluate(y=>window.scrollTo(0,y),at(.43));await p.waitForTimeout(3000);r.drawsBuild=await draws(p);
r.heroPausedAtBuild=await p.evaluate(()=>document.querySelector('[data-pause-scope]').hasAttribute('data-paused'));
r.sandStreamFrozen=await p.evaluate(async()=>{const c=document.querySelector('canvas[class*=SandStream]');const a=c.toDataURL();await new Promise(r=>setTimeout(r,700));return a===c.toDataURL()});
await p.evaluate(y=>window.scrollTo(0,y),geo.about+200);await p.waitForTimeout(2500);r.drawsAbout=await draws(p);r.stageVisibleAtAbout=await p.evaluate(()=>{const s=document.querySelector('section[aria-label*="컨셉"] > div').getBoundingClientRect();return s.bottom>0&&s.top<innerHeight});
r.errors=errors;out[w]=r;await p.close();}
// reduced motion
const m=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await m.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await m.waitForTimeout(7000);
out.reduced={wordAnimations:await m.evaluate(()=>[...document.querySelectorAll('div[class*=GrowthScene_absorb],div[class*=GrowthScene_build],div[class*=GrowthScene_grow]')].reduce((n,e)=>n+e.getAnimations().length,0)),
sandStreamStatic:await m.evaluate(async()=>{const c=document.querySelector('canvas[class*=SandStream]');const a=c.toDataURL();await new Promise(r=>setTimeout(r,800));return a===c.toDataURL()})};
const g=await m.evaluate(()=>{const t=document.querySelector('section[aria-label*="컨셉"]');return Math.round(t.getBoundingClientRect().top+scrollY+(t.offsetHeight-innerHeight)*.43)});
await m.evaluate(y=>window.scrollTo(0,y),g);await m.waitForTimeout(2500);
out.reduced.gustBlank=await m.evaluate(()=>{const c=document.querySelector('canvas[class*=ConceptScenes_gust]');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i])return false;return true});
await m.screenshot({path:path.join(__dirname,'reduced-build.png')});
// screen reader text in reading order
out.readingOrder=await m.evaluate(()=>[...document.querySelectorAll('section[aria-label*="컨셉"] p')].map(e=>e.textContent.trim()).filter(Boolean));
out.sectionLabel=await m.evaluate(()=>document.querySelector('section[aria-label*="컨셉"]').getAttribute('aria-label'));
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
