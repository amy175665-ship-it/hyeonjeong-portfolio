// Usage: node check.cjs [url] — hero letters keep the arrow cursor, cannot be selected, and still react to hover.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();const out={};try{
const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(6000);
const chars=p.locator('[class*=GrowthScene_char]');
out.styles=await chars.evaluateAll(es=>[...new Set(es.map(e=>[getComputedStyle(e).cursor,getComputedStyle(e).userSelect,getComputedStyle(e.firstElementChild).cursor,getComputedStyle(e).pointerEvents].join('/')))]);
out.wordStyles=await p.locator('div[class*=GrowthScene_absorb],div[class*=GrowthScene_build],div[class*=GrowthScene_grow]').evaluateAll(es=>es.map(e=>getComputedStyle(e).cursor+'/'+getComputedStyle(e).userSelect));
// drag across ABSORB. and check nothing gets selected
const a=await chars.nth(0).boundingBox(),z=await chars.nth(6).boundingBox();
await p.mouse.move(a.x+2,a.y+a.height*.6);await p.mouse.down();await p.mouse.move(z.x+z.width-2,z.y+z.height*.6,{steps:8});await p.mouse.up();
out.selectedText=JSON.stringify(await p.evaluate(()=>getSelection().toString()));
await p.addStyleTag({content:'[class*=GrowthScene_char],[class*=GrowthScene_glyph]{transition:none!important}'});
const s=await chars.nth(2).boundingBox();await p.mouse.move(s.x+s.width/2,s.y+s.height*.55);await p.waitForTimeout(150);
out.hoverS=await chars.nth(2).evaluate(e=>({color:getComputedStyle(e).color,t:getComputedStyle(e.firstElementChild).transform}));
out.othersUnchanged=await chars.evaluateAll(es=>es.every((e,k)=>k===2||getComputedStyle(e).color==='rgb(32, 39, 49)'));
out.otherTextSelectable=await p.evaluate(()=>getComputedStyle(document.body).userSelect);
out.errors=errors;fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
