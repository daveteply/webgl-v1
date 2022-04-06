// code generation tool - create color schemes

const fs = require("fs");
const sourceFile = "color-info.css";
const targetFile = "../../src/app/game/services/material/color-info.ts";

const targetLines = [];
targetLines.push("export const ColorSchemeData = ");

const colorData = [];
let scheme = [];
let id = 1;

const sourceContents = fs.readFileSync(sourceFile, { encoding: "utf-8" });
sourceContents.split(/\r?\n/).forEach((line) => {
  if (line.indexOf(".class") > -1) {
    scheme = [];
  } else if (line.indexOf("}") > -1) {
    const schemeObj = { id: id++, colors: scheme };
    colorData.push(schemeObj);
  } else {
    scheme.push(line.replace("color: ", "").replace(";", "").trim());
  }
});

targetLines.push(JSON.stringify(colorData));

// write to disk
fs.writeFile(targetFile, targetLines.join("\r\n"), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("done!");
});
