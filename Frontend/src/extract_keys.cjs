const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const keys = new Set();
const files = getFiles('c:/Users/senna/OneDrive/Documentos/PlayHub/Frontend/src');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Look for t('something') or t("something") or t(`something`)
  const regex = /t\((['"`])(.*?)\1/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[2]);
  }
});

console.log(JSON.stringify(Array.from(keys).sort(), null, 2));
