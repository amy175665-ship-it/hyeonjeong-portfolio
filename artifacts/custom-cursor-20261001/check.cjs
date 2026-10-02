// Usage: node check.cjs [url] — custom cursor: follows, hover swap, click burst cleanup, native cursor hidden, touch/small screens untouched.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const path=require('path'),fs=require('fs');
const url=process.argv[2]||'http://localhost:3000';const out={};
const state=p=>p.evaluate(()=>{const c=document.querySelector('[class*=CustomCursor_cursor]');const m=new DOMMatrix(getComputedStyle(c).transform);const op=s=>(+getComputedStyle(c.querySelector(s)).opacity).toFixed(2);return {visible:c.dataset.visible,hover:c.dataset.hover,x:Math.round(m.e),y:Math.round(m.f),drop:op('[class*=CustomCursor_drop]'),sphere:op('[class*=CustomCursor_sphere]'),bursts:document.querySelectorAll('[class*=CustomCursor_burst]').length}});
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await p.waitForTimeout(6000);
out.enabled=await p.evaluate(()=>document.documentElement.classList.contains('has-custom-cursor'));
out.nativeCursor=await p.evaluate(()=>[getComputedStyle(document.body).cursor,getComputedStyle(document.querySelector('a[href]')).cursor]);
out.beforeMove=await state(p);
await p.mouse.move(300,520,{steps:4});await p.waitForTimeout(500);out.afterMove=await state(p);
await p.screenshot({path:path.join(__dirname,'1440-default.png'),clip:{x:250,y:470,width:100,height:100}});
// hover a link (logo)
const logo=await p.getByRole('link',{name:/홈$/}).boundingBox();await p.mouse.move(logo.x+logo.width/2,logo.y+logo.height/2,{steps:4});await p.waitForTimeout(500);out.onLink=await state(p);
await p.screenshot({path:path.join(__dirname,'1440-hover.png'),clip:{x:logo.x-30,y:logo.y-30,width:logo.width+60,height:logo.height+60}});
const menu=await p.getByRole('button',{name:'메뉴 열기'}).boundingBox();await p.mouse.move(menu.x+menu.width/2,menu.y+menu.height/2,{steps:3});await p.waitForTimeout(400);out.onButton=(await state(p)).hover;
await p.mouse.move(400,560,{steps:3});await p.waitForTimeout(500);out.backToDefault=await state(p);
// click burst
await p.mouse.down();await p.mouse.up();await p.waitForTimeout(150);out.duringBurst=await state(p);
await p.screenshot({path:path.join(__dirname,'1440-click.png'),clip:{x:340,y:500,width:120,height:120}});
await p.waitForTimeout(900);out.afterBurst=(await state(p)).bursts;
// hero letter hover still works under the custom cursor
const ch=p.locator('[class*=GrowthScene_char]').nth(2);const cb=await ch.boundingBox();await p.mouse.move(cb.x+cb.width/2,cb.y+cb.height*.6,{steps:3});await p.waitForTimeout(500);out.letterHoverColor=await ch.evaluate(e=>getComputedStyle(e).color);
out.errors=errs;await p.close();
// touch device & small screen
const t=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await t.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await t.waitForTimeout(4000);
out.mobile=await t.evaluate(()=>({enabled:document.documentElement.classList.contains('has-custom-cursor'),bodyCursor:getComputedStyle(document.body).cursor}));
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
