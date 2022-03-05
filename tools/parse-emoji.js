// code generation tool - convert emoji data dump into typescript

const fs = require("fs");
const sourceFile = "emoji-test.txt";
const targetFile = "../src/app/game/services/texture/emoji-data.ts";

const parseLine = (line) => {
  const lineSegments = line.split(";");

  const listArray = lineSegments[0].trim().split(" ");
  const hexArray = [];

  listArray.forEach((l) => {
    hexArray.push(Number("0x" + l));
  });
  // let versionDesc = lineSegments[1].substr(lineSegments[1].indexOf(" E")).trim();
  // const spaceIndex = versionDesc.indexOf(" ");
  return {
    list: hexArray,
    // version: versionDesc.substr(0, spaceIndex),
    // desc: versionDesc.substr(spaceIndex + 1),
  };
};

const targetLines = [];
targetLines.push("// - Generated file, do not modify -");
targetLines.push("// Original data: https://unicode.org");
targetLines.push("");

// parsing identifiers
const groupStartId = "# group: ";
const subGroupStartId = "# subgroup: ";
const qualifedId = "; fully-qualified";

// start first group
targetLines.push("export const EmojiData = [");

const emojiData = [];

let groupInx = 0;
let subGroupInx = 0;

const sourceContents = fs.readFileSync(sourceFile, { encoding: "utf-8" });
sourceContents.split(/\r?\n/).forEach((line) => {
  if (line.startsWith(groupStartId)) {
    // group
    emojiData.push({ id: line.replace(groupStartId, "") });
    groupInx = emojiData.length - 1;
    emojiData[groupInx].subGroup = [];
  } else if (line.startsWith(subGroupStartId)) {
    // sub group
    emojiData[groupInx].subGroup.push({
      id: line.replace(subGroupStartId, ""),
    });
    subGroupInx = emojiData[groupInx].subGroup.length - 1;
    emojiData[groupInx].subGroup[subGroupInx].codes = [];
  } else if (line.indexOf(qualifedId) > -1) {
    // line
    emojiData[groupInx].subGroup[subGroupInx].codes.push(parseLine(line));
  }
});

targetLines.push(JSON.stringify(emojiData));

// finish groups
targetLines.push("];\r\n");

fs.writeFile(targetFile, targetLines.join("\r\n"), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("done!");
});
