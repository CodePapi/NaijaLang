# nigeria-languages

A standalone package containing a comprehensive list of Nigerian
languages and associated metadata. It is designed for use in web
applications (dropdowns, select inputs, language pickers, etc.) and
works equally well in Node or browser environments.

The package simply exports an array of language objects. Each entry has
at least the following properties:

- `name` – human‑readable language name
- `code` – two‑letter identifier (unique)
- `type` – classification (official, indigenous, creole, etc.)
- `info` – short descriptive text
- `otherNames` – optional array of alternative names

## Installation

```bash
npm install nigeria-languages
# or
# yarn add nigeria-languages
```


## Usage

```js
const languages = require('nigeria-languages');

// build options for a <select>
const options = languages.map(l => ({ label: l.name, value: l.code }));

// look up a language by code
const hausa = languages.find(l => l.code === 'ha');
console.log(hausa.name); // "Hausa"
```

TypeScript consumers may import JSON directly:

```ts
import languages from 'nigeria-languages/languages.json';
```

## Development

To regenerate the bundled `languages.json` from the root dataset, run
this repository's root build script (it currently simply copies
`lang.json`).

## License

MIT
