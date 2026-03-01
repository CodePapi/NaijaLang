const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../lang.json');
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
const langs = data.languages || [];

let md = '# Language Codes\n\n';
md += 'This table lists every language included in the dataset along with its two‑letter code. Developers can copy the code for use in API calls or other implementations.\n\n';
md += '| Name | Code |\n';
md += '|------|------|\n';
for (const l of langs) {
  md += `| ${l.name} | ${l.code || ''} |\n`;
}

const out = path.resolve(__dirname, '../LANGUAGE_CODES.md');
fs.writeFileSync(out, md);
console.log('Wrote', out);
