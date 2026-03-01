const fs = require('fs');
const path = require('path');

/**
 * Generate a two-letter identifier from a language name.
 * - prefer first two alphabetic letters of the name (lowercased)
 * - if that collides, try other pairs from the name or from word boundaries
 * - as a last resort append a digit until unique
 */
function makeCode(name, used) {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
  const parts = clean.split(/\s+/);

  // helper to try candidate and reserve if unused
  const tryCode = (c) => {
    if (!used.has(c)) {
      used.add(c);
      return c;
    }
    return null;
  };

  // first attempt: first letters of first two words (or two letters of first word)
  let candidate = parts
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('');
  if (candidate.length === 1 && parts[0].length > 1) {
    candidate = parts[0].slice(0, 2);
  }
  if (candidate.length === 2) {
    const use = tryCode(candidate);
    if (use) return use;
  }

  // try sliding window over clean string
  const letters = clean.replace(/\s+/g, '');
  for (let i = 0; i < letters.length - 1; i++) {
    const c = letters.slice(i, i + 2);
    const use = tryCode(c);
    if (use) return use;
  }

  // try first letter plus subsequent word initials
  for (let i = 1; i < parts.length; i++) {
    const c = parts[0].charAt(0) + parts[i].charAt(0);
    const use = tryCode(c);
    if (use) return use;
  }

  // finally append numbers to first two letters
  let idx = 1;
  const base = letters.slice(0, 2) || 'xx';
  while (true) {
    const c = base[0] + idx.toString().padStart(1, '0');
    if (!used.has(c)) {
      used.add(c);
      return c;
    }
    idx++;
  }
}

for (const rel of ['lang.json', 'frontend/public/lang.json']) {
  const file = path.resolve(__dirname, '..', rel);
  console.log('Processing', file);
  const raw = fs.readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.languages)) {
    console.warn('no languages array in', file);
    continue;
  }
  const used = new Set();
  data.languages = data.languages.map((lang) => {
    lang.code = makeCode(lang.name, used);
    return lang;
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Wrote', data.languages.length, 'entries with codes');
}
