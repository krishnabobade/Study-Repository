const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js') || dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const replaceRules = [
  { regex: /text-white\/[0-9]+/g, replacement: 'text-text-muted' },
  { regex: /text-white(?!(\/|[a-zA-Z0-9_-]))/g, replacement: 'text-text-main' },
  { regex: /bg-white\/5/g, replacement: 'bg-card' }, // white/5 usually panel or card
  { regex: /bg-white\/10/g, replacement: 'bg-panel' },
  { regex: /bg-black\/[0-9]+/g, replacement: 'bg-surface/50' }, // roughly
  { regex: /bg-black(?!(\/|[a-zA-Z0-9_-]))/g, replacement: 'bg-surface' },
  { regex: /border-white\/10/g, replacement: 'border-border' },
  { regex: /border-white\/20/g, replacement: 'border-border' },
  { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-card' },
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-panel' },
  { regex: /hover:text-white(?!(\/|[a-zA-Z0-9_-]))/g, replacement: 'hover:text-text-main' },
];

const files = walkSync(srcDir);
let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  for (const rule of replaceRules) {
    newContent = newContent.replace(rule.regex, rule.replacement);
  }

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Finished processing. Changed ${changedFiles} files.`);
