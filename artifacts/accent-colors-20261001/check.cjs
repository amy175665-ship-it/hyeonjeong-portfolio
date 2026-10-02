// Usage: node check.cjs [url] — three-colour accents on hero letters; hover colour and twist still work.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';
const hex=c=>'#'+c.match(/\d+/g).slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');
(async()=>{const b=await chromium.launch();const out={};try{
const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(6000);await p.mouse.move(1435,895);await p.waitForTimeout(400);
const chars=p.locator('[class*=GrowthScene_char]');
out.colors=(await chars.evaluateAll(es=>es.map(e=>e.textContent+'='+getComputedStyle(e).color))).map(s=>s.replace(/rgb\([^)]*\)/,hex));
out.backgroundImages=await chars.evaluateAll(es=>[...new Set(es.map(e=>getComputedStyle(e).backgroundImage))]);
await p.screenshot({path:path.join(__dirname,'1440.png')});
await p.addStyleTag({content:'[class*=GrowthScene_char],[class*=GrowthScene_glyph]{transition:none!important}'});
out.hover=[];for(const i of [0,1,8,13,17]){const bb=await chars.nth(i).boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height*.6);await p.waitForTimeout(150);
out.hover.push(await chars.nth(i).evaluate(e=>e.textContent+' '+getComputedStyle(e).color+' twist:'+(getComputedStyle(e.firstElementChild).transform!=='none')).then(s=>s.replace(/rgb\([^)]*\)/,hex)));}
await p.mouse.move(1435,895);await p.waitForTimeout(150);
out.restored=(await chars.evaluateAll(es=>es.map(e=>getComputedStyle(e).color))).map(hex).join(' ');
out.errors=errors;fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
