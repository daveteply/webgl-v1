// tool to create an html view of emojis for testing on various systems

const fs = require('fs');
const path = require('path');
const sourceFile = path.join(__dirname, '../../apps/rikkle/public/assets/emoji-data.json');
const targetFile = 'output.html';

const targetLines = [];

// add html find
targetLines.push('<!DOCTYPE html>');
targetLines.push('<html>');
targetLines.push('<body>');

const payload = JSON.parse(fs.readFileSync(sourceFile, { encoding: 'utf-8' }));
const groups = Array.isArray(payload) ? payload : payload.groups;

groups.forEach((group) => {
  targetLines.push(`<h1>${group.id}</h1>`);
  group.subGroup.forEach((subGroup) => {
    targetLines.push(`<h2>${subGroup.id}</h2>`);
    subGroup.codes.forEach((code) => {
      const sequence = code.sequence.map((c) => `&#${c};`).join('');
      targetLines.push(`${sequence} ${code.version} ${code.desc} <br>`);
    });
  });
});

// finish html
targetLines.push('</body>');
targetLines.push('</html>');

// write to disk
fs.writeFile(targetFile, targetLines.join('\r\n'), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('done!');
});
