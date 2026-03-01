// simple wrapper that exposes the language array
// the data is stored in languages.json so that consumers can import the
// raw list if needed and tooling (tsc, bundlers) can statically include it.

const languages = require('./languages.json');
module.exports = languages;
