// Usage: node check.cjs [url] — tagline above GROW.: static, single line, no overlap with BUILD./avatar.
const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');
const url=process.argv[2]||'http://localhost:3000';
(async()=>{const b=await chromium.launch();const out={};try{
for(const [w,h] of [[1440,900],[1024,768],[1280,800],[1920,1080]]){
const p=await b.newPage({viewport:{width:w,height:h}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(6000);
await p.addStyleTag({content:'div[class*=GrowthScene_absorb],div[class*=GrowthScene_build],div[class*=GrowthScene_grow]{animation:none!important}'});await p.waitForTimeout(200);
out[w]=await p.evaluate(()=>{const q=s=>document.querySelector(s);const t=q('p[class*=GrowthScene_tagline]');const r=t.getBoundingClientRect();const g=[...q('div[class*=GrowthScene_grow]').querySelectorAll('[class*=GrowthScene_glyph]')];
// glyph ink top of G approximated via a Range on its text node is the line box, so measure cap top by canvas
const G=g[0].getBoundingClientRect();const cs=getComputedStyle(g[0]);const cv=document.createElement('canvas').getContext('2d');cv.font=cs.fontSize+' '+cs.fontFamily;const m=cv.measureText('G');
const baseline=G.top+(G.height/2)+((m.fontBoundingBoxAscent-m.fontBoundingBoxDescent)/2);const capTop=baseline-m.actualBoundingBoxAscent;
const B=q('div[class*=GrowthScene_build]').getBoundingClientRect();const av=q('[class*=HeroAvatar_avatar]')?.getBoundingClientRect();
const dot=t.firstElementChild;
return {text:t.textContent,font:getComputedStyle(t).fontSize+' '+getComputedStyle(t).letterSpacing,color:getComputedStyle(t).color,dot:getComputedStyle(dot).color,lines:Math.round(r.height/parseFloat(getComputedStyle(t).lineHeight||r.height)),box:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)],gLeft:Math.round(G.left),gapToGrowCap:Math.round(capTop-r.bottom),buildBottom:Math.round(B.bottom),buildLeft:Math.round(B.left),overlapBuild:!(r.right<B.left||r.left>B.right||r.bottom<B.top||r.top>B.bottom),avatarLeft:av&&Math.round(av.left),anims:t.getAnimations().length}});
out[w].errors=errors;await p.screenshot({path:path.join(__dirname,w+'.png')});await p.close();}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,1));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
