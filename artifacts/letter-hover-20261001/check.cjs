// Usage: node check.cjs [url] — per-letter hover on the desktop hero words.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();const out={chars:[]};try{
for(const [w,h] of [[1440,900],[1024,768],[1920,1080]]){
const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(6000);
const words=p.locator('div[class*=absorb],div[class*=build],div[class*=grow]').filter({hasText:/^(ABSORB|BUILD|GROW)\.$/});
out['boxes'+w]=await words.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return e.textContent+' x'+Math.round(r.x)+' r'+Math.round(r.right)+' y'+Math.round(r.y)+' b'+Math.round(r.bottom)}));
const chars=words.locator('span');const n=await chars.count();let failures=[];
for(let i=0;i<n;i++){const c=chars.nth(i);const bb=await c.boundingBox();const cx=bb.x+bb.width/2,cy=bb.y+bb.height*.55;
const hit=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.textContent,[cx,cy]);
await p.mouse.move(cx,cy);await p.waitForTimeout(60);
const colors=await chars.evaluateAll(es=>es.map(e=>getComputedStyle(e).color));
const green=colors.map((col,k)=>col==='rgb(104, 123, 60)'?k:-1).filter(k=>k>=0);
const ch=await c.textContent();if(w===1440)out.chars.push(ch+':'+(green.length===1&&green[0]===i?'ok':'FAIL '+JSON.stringify({hit,green})));
if(!(green.length===1&&green[0]===i))failures.push(ch+i);}
await p.mouse.move(5,h-5);await p.waitForTimeout(60);
out['restored'+w]=await chars.evaluateAll(es=>es.every(e=>getComputedStyle(e).color==='rgb(32, 39, 49)'));
out['failures'+w]=failures;out['errors'+w]=errors;
if(w===1440){const s=chars.nth(2);const bb=await s.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.55);await p.waitForTimeout(100);await p.screenshot({path:path.join(__dirname,'1440-hover-S.png')});
const t=await b.newPage({viewport:{width:1440,height:900}});await t.goto(url,{waitUntil:'load'});await t.waitForTimeout(6000);out.transition=await t.locator('div[class*=absorb] span').first().evaluate(e=>getComputedStyle(e).transition);await t.close();}
await p.close();}
const m=await b.newPage({viewport:{width:390,height:844}});await m.goto(url,{waitUntil:'load'});await m.waitForTimeout(5000);out.mobileWords=await m.locator('div[class*=absorb]').count();out.mobileOverflow=await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
