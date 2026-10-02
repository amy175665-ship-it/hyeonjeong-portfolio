// Usage: node check.cjs [url] — hero words float independently; letter hover and reduced motion still behave.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const WORDS='div[class*=GrowthScene_absorb],div[class*=GrowthScene_build],div[class*=GrowthScene_grow]';
(async()=>{const b=await chromium.launch();const out={};try{
for(const [w,h] of [[1440,900],[1024,768]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(6000);
out['float'+w]=await p.evaluate(W=>[...document.querySelectorAll(W)].map(e=>{const a=e.getAnimations().find(x=>x.animationName==='wordFloat'||String(x.animationName).includes('wordFloat'));const t=a.effect.getTiming();a.pause();const ys=[];for(const f of [0,.5,1]){a.currentTime=t.delay<0?-t.delay*0+f*t.duration-t.delay*0:f*t.duration;a.currentTime=(f*t.duration)-(t.delay);ys.push(getComputedStyle(e).translate)}const tr=getComputedStyle(e).transform;a.play();return {word:e.textContent,duration:t.duration,delay:t.delay,easing:t.easing,direction:t.direction,iterations:t.iterations,translates:ys,keepsRotation:tr!=='none'}}),WORDS);
// GROW at its lowest point must stay inside the viewport
out['growLowestBottom'+w]=await p.evaluate(W=>{const g=[...document.querySelectorAll(W)].find(e=>e.textContent==='GROW.');const a=g.getAnimations()[0];a.pause();const t=a.effect.getTiming();a.currentTime=t.duration-t.delay;const r=Math.round(g.getBoundingClientRect().bottom);a.play();return r+' / '+innerHeight},WORDS);
await p.addStyleTag({content:'[class*=GrowthScene_char],[class*=GrowthScene_glyph]{transition:none!important}'});
const chars=p.locator('[class*=GrowthScene_char]');const fails=[];
for(const i of [2,8,14,17]){const bb=await chars.nth(i).boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.6);await p.waitForTimeout(120);const st=await chars.evaluateAll(es=>es.map(e=>getComputedStyle(e).color==='rgb(127, 150, 87)'&&getComputedStyle(e.firstElementChild).transform!=='none'?1:0));if(st.reduce((a,b)=>a+b)!==1||!st[i])fails.push(i);}
out['hoverFails'+w]=fails;out['errors'+w]=errors;
out['boxes'+w]=await p.evaluate(W=>[...document.querySelectorAll(W)].map(e=>{const r=e.getBoundingClientRect();return e.textContent+' x'+Math.round(r.x)+' y'+Math.round(r.y)+' b'+Math.round(r.bottom)}),WORDS);await p.mouse.move(w-5,h-5);await p.screenshot({path:path.join(__dirname,w+'.png')});
await p.close();}
const r=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await r.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await r.waitForTimeout(6000);
out.reduced=await r.evaluate(W=>[...document.querySelectorAll(W)].map(e=>e.getAnimations().length+' '+getComputedStyle(e).translate),WORDS);
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
