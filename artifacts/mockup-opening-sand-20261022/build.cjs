// Usage: node build.cjs  → index.html (template.html with the captures inlined, so the canvas can read their pixels
// even when the page is opened straight from disk).
const fs = require("fs"), path = require("path");
const at = name => path.join(__dirname, name);
const uri = name => "data:image/png;base64," + fs.readFileSync(at(name)).toString("base64");
const cactus = JSON.parse(fs.readFileSync(at("cactus.json"), "utf8"));
cactus.frames = cactus.times.map((_, n) => uri(`cactus-${String(n).padStart(2, "0")}.png`));
const html = fs.readFileSync(at("template.html"), "utf8")
  .replace("%%HERO_SKY%%", uri("hero-sky.png"))
  .replace("%%HERO_FACE%%", uri("hero-face.png"))
  .replace("%%HERO_FG%%", uri("hero-fg.png"))
  .replace("%%HEADER%%", uri("header.png"))
  .replace("%%DESERT_SKY%%", uri("desert-sky.png"))
  .replace("%%DESERT_SAND%%", uri("desert-sand.png"))
  .replace("%%CACTUS%%", JSON.stringify(cactus));
fs.writeFileSync(at("index.html"), html);
console.log("index.html", (html.length / 1e6).toFixed(2), "MB");
