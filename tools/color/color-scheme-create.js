// code generation tool - create color schemes

const fs = require("fs");
const targetFile = "color-info.css";

const ColorScheme = require("color-scheme");
const c = new ColorScheme();

const ColorSorter = require("color-sorter");

const createSchema = () => {
  const hue = Math.floor(Math.random() * 359);
  console.log("Hue: ", hue);
  const schemes = ["triade", "tetrade", "analogic"];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  console.log("Scheme: ", scheme);

  c.from_hue(hue).scheme(scheme).variation("hard");

  return c
    .colors()
    .map((c) => `#${c}`)
    .sort(ColorSorter.sortFn);
};

const schemesList = [];

for (let i = 0; i < 30; i++) {
  const colors = createSchema();
  schemesList.push(".class {");
  colors.forEach((c) => {
    schemesList.push(`color:${c};`);
  });
  schemesList.push("}");
}

fs.writeFile(targetFile, schemesList.join("\r\n"), (err) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log("done!");
});
