const fs = require("fs");
const sourceFile = "../../src/app/game/services/texture/emoji-data.ts";
const targetFile = "output.html";

const targetLines = [];

// add html find
targetLines.push("<!DOCTYPE html>");
targetLines.push("<html>");
targetLines.push("<body>");

const sourceContents = fs.readFileSync(sourceFile, { encoding: "utf-8" });
sourceContents.split(/\r?\n/).forEach((line) => {
  if (line.startsWith("[")) {
    const data = JSON.parse(line);
    data.forEach((group) => {
      targetLines.push(`<h1>${group.id}</h1>`);
      group.subGroup.forEach((subGroup) => {
        targetLines.push(`<h2>${subGroup.id}</h2>`);
        subGroup.codes.forEach((code) => {
          const sequence = code.sequence.map((c) => `&#${c};`).join("");
          // console.log(code);
          targetLines.push(`${sequence} ${code.version} ${code.desc} <br>`);
        });
      });
    });
  }
});

// finish html
targetLines.push("</body>");
targetLines.push("</html>");

// write to disk
fs.writeFile(targetFile, targetLines.join("\r\n"), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("done!");
});
