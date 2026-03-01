const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../lang.json');
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
const langs = data.languages || [];

const examples = [];
for (const l of langs) {
  if (l.code === 'en') continue;
  examples.push({
    sourceLang: 'en',
    targetLang: l.code,
    source: 'hello',
    target: `hello in ${l.name}`,
  });
}

const out = path.resolve(__dirname, '../training-sample.json');
fs.writeFileSync(out, JSON.stringify(examples, null, 2));
console.log('Wrote', out, 'with', examples.length, 'examples');
