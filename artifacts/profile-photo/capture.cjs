// Usage: node capture.cjs http://localhost:3000
// Opens the about page inside the browser window (menu ABOUT) and checks that the profile photo loads.
const path = require("path");
const { chromium } = require(path.join(process.env.LOCALAPPDATA, "npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright"));
const url = process.argv[2] || "http://localhost:3000";
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url + "#about", { waitUntil: "domcontentloaded", timeout: 120000 });
    await wait(5000);
    const photo = await page.evaluate(() => {
      const img = document.querySelector("#about img");
      return img && { src: img.getAttribute("src"), alt: img.alt, loaded: img.complete && img.naturalWidth > 0, natural: [img.naturalWidth, img.naturalHeight], box: [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)] };
    });
    await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
    console.log(name, JSON.stringify({ photo, errors }));
    await page.close();
  }
  await browser.close();
})();
