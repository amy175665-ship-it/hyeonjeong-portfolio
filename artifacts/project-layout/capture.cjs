const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
(async()=>{const browser=await chromium.launch();const results=[];
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small',320,720],['large',480,900],['tablet',768,1024]]){
const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
await page.screenshot({path:`artifacts/project-layout/${name}-first.png`});
await page.locator('#project h2').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
await page.locator('#project').screenshot({style: 'nav { visibility: hidden !important; }', path:`artifacts/project-layout/${name}-projects.png`});
results.push({name,errors,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,aboutOverflow:[...document.querySelectorAll('#project *')].some(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left< -1}),text:document.querySelector('#project').innerText}))});await page.close();}
fs.writeFileSync('artifacts/project-layout/checks.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});





