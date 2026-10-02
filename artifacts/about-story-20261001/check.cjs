// Usage: node check.cjs [url] — new About/Skills after the concept story: hand-off color, layout, nav anchors, word breaks.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();try{for(const [w,h] of [[1440,900],[1024,768],[390,844],[320,640]]){
const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:'reduce'});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(5000);
const info=await p.evaluate(()=>{const a=document.getElementById('about'),s=document.getElementById('skill');const r=e=>Math.round(e.getBoundingClientRect().top+scrollY);
const names=[...s.querySelectorAll('h3')].map(e=>{const lh=parseFloat(getComputedStyle(e).lineHeight);return e.textContent+':'+Math.round(e.getBoundingClientRect().height/lh)+'L'});
return {about:r(a),skill:r(s),aboutCount:document.querySelectorAll('#about').length,names:names.join(' ')}});
for(const [name,y] of [['handoff',info.about-h*0.6],['about',info.about-100],['profile',info.about+h*0.55],['skills',info.skill-110]]){await p.evaluate(y=>window.scrollTo(0,y),Math.round(y));await p.waitForTimeout(1500);await p.screenshot({path:path.join(__dirname,`${w}-${name}.png`)});}
console.log(w,JSON.stringify(info),'overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'errors',errs.length);await p.close();}
// nav anchors
const n=await b.newPage({viewport:{width:1440,height:900}});await n.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await n.waitForTimeout(5000);
for(const id of ['about','skill']){await n.evaluate(()=>window.scrollTo(0,0));await n.waitForTimeout(600);await n.getByRole('button',{name:'메뉴 열기'}).click();await n.waitForTimeout(600);await n.locator(`#site-navigation a[href="/#${id}"]`).first().click();await n.waitForTimeout(2000);console.log('nav',id,await n.evaluate(id=>Math.round(document.getElementById(id).getBoundingClientRect().top),id));}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
