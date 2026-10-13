// Usage: node build.cjs  → index.html (template.html with the three captures inlined, so the canvas can read their
// pixels even when the page is opened straight from disk).
const fs = require("fs"), path = require("path");
const at = name => path.join(__dirname, name);
const uri = name => "data:image/png;base64," + fs.readFileSync(at(name)).toString("base64");
const html = fs.readFileSync(at("template.html"), "utf8")
  .replace("%%BG%%", uri("end-bg.png")).replace("%%FG%%", uri("end-fg.png")).replaceAll("%%ABOUT%%", uri("about.png"));
fs.writeFileSync(at("index.html"), html);
console.log("index.html", (html.length / 1e6).toFixed(2), "MB");
