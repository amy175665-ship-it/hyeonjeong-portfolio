// Usage: node check.cjs [url]  — verifies the header logo ring-ring hover.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';const IMG='a[aria-label$="홈"] img';
(async()=>{const b=await chromium.launch();const out={};try{
const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(6000);
const link=p.getByRole('link',{name:/홈$/});const box=await link.boundingBox();
await p.mouse.move(box.x+38,box.y+38,{steps:3});
// sample the running ring deterministically at several points of the effect
out.samples=await p.evaluate(IMG=>{const img=document.querySelector(IMG);const a=img.getAnimations()[0];if(!a)return null;a.pause();const r=[];for(const t of [0,87,186,298,397,508,620]){a.currentTime=t;const m=new DOMMatrix(getComputedStyle(img).transform);r.push({t,deg:+(Math.atan2(m.b,m.a)*180/Math.PI).toFixed(1),x:+m.e.toFixed(2),scale:+Math.hypot(m.a,m.b).toFixed(3)})}a.currentTime=100;a.play();return r},IMG);
// synchronous leave/enter bursts while the ring is running must not stack or restart it
out.noStack=await p.evaluate(IMG=>{const link=document.querySelector(IMG).parentElement;const img=link.firstElementChild;const first=img.getAnimations()[0];for(let i=0;i<5;i++){link.dispatchEvent(new PointerEvent('pointerout',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));document.body.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',relatedTarget:link}));document.body.dispatchEvent(new PointerEvent('pointerout',{bubbles:true,pointerType:'mouse',relatedTarget:link}));img.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));}const a=img.getAnimations();return {count:a.length,same:a[0]===first,time:Math.round(a[0]?.currentTime)}},IMG);
await p.evaluate(IMG=>document.querySelector(IMG).getAnimations().forEach(a=>a.finish()),IMG);
await p.waitForTimeout(300);
out.settled=await p.evaluate(IMG=>{const i=document.querySelector(IMG);return {transform:getComputedStyle(i).transform,running:i.getAnimations().length}},IMG);
out.boxSame=JSON.stringify(box)===JSON.stringify(await link.boundingBox());
await p.mouse.move(10,400,{steps:2});await p.mouse.move(box.x+38,box.y+38,{steps:2});
out.replaysOnNextHover=await p.evaluate(IMG=>document.querySelector(IMG).getAnimations().length,IMG);
await p.screenshot({path:path.join(__dirname,'1440-header.png'),clip:{x:0,y:0,width:1440,height:140}});
await p.mouse.move(10,400);await p.waitForTimeout(900);
await p.getByRole('button',{name:'메뉴 열기'}).click();await p.waitForTimeout(500);
out.menuOpens=await p.getByRole('button',{name:'메뉴 닫기'}).getAttribute('aria-expanded');
await p.keyboard.press('Escape');await p.waitForTimeout(1500);
out.escapeCloses=await p.getByRole('button',{name:'메뉴 열기'}).getAttribute('aria-expanded');
const r=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await r.goto(url,{waitUntil:'load'});await r.waitForTimeout(6000);
const rb=await r.getByRole('link',{name:/홈$/}).boundingBox();await r.mouse.move(rb.x+38,rb.y+38,{steps:3});
out.reducedMotionAnims=await r.evaluate(IMG=>document.querySelector(IMG).getAnimations().length,IMG);
const m=await b.newPage({viewport:{width:390,height:844}});await m.goto(url,{waitUntil:'load'});await m.waitForTimeout(5000);await m.screenshot({path:path.join(__dirname,'390-header.png'),clip:{x:0,y:0,width:390,height:130}});
out.errors=errors;fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
