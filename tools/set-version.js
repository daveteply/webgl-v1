const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let versionString;
try {
  // Get date/time of last commit in format: YYYY.MM.DD.HHmm
  const gitDate = execSync('git log -1 --format=%cd --date=format:%Y.%m.%d.%H%m', { encoding: 'utf8' }).trim();
  if (gitDate) {
    versionString = `v${gitDate}`;
  }
} catch (e) {
  // Fallback if git command fails or not in a git repository
}

if (!versionString) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  versionString = `v${year}.${month}.${day}.${hours}${minutes}`;
}

const content = `// Generated automatically during build
export const APP_VERSION = '${versionString}';
`;

const targetPath = path.join(__dirname, '..', 'src', 'app', 'version.ts');

let currentContent = '';
if (fs.existsSync(targetPath)) {
  currentContent = fs.readFileSync(targetPath, 'utf8');
}

if (currentContent !== content) {
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`[set-version] Updated version to: ${versionString}`);
} else {
  console.log(`[set-version] Version unchanged (${versionString})`);
}

