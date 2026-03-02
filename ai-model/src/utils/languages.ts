// utility helper for mapping between codes and full language names
// loads the `nigeria-languages` package at runtime and provides lookup
// functions used by services to normalize identifiers.

export interface LanguageDef {
  name: string;
  code?: string;
  otherNames?: string[];
  [key: string]: any;
}

/**
 * Load the language list from the npm package. Returns an array, or empty if
 * the package is not installed. Cached after first invocation.
 */
let _cache: LanguageDef[] | null = null;
function loadList(): LanguageDef[] {
  if (_cache) return _cache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('nigeria-languages');
    if (Array.isArray(pkg)) {
      _cache = pkg;
      return _cache;
    }
  } catch {
    // ignore; fall through to empty array
  }
  _cache = [];
  return _cache;
}

/**
 * Find a language entry by a user-provided identifier (code, name, or
 * alternative name). Case-insensitive. Returns null if nothing matches.
 */
export function findLanguage(identifier: string): LanguageDef | null {
  if (!identifier) return null;
  const list = loadList();
  const lower = identifier.toLowerCase();
  return (
    list.find((l) => {
      if (l.name && l.name.toLowerCase() === lower) return true;
      if (l.code && l.code.toLowerCase() === lower) return true;
      if (l.otherNames) {
        for (const o of l.otherNames) {
          if (o.toLowerCase() === lower) return true;
        }
      }
      return false;
    }) || null
  );
}

/**
 * Normalize an identifier to a canonical `{ code, name }` pair. If the input
 * matches a known language the code field will be the two-letter code (when
 * available) and the name will be the full language name from the package.
 * When there is no match we fall back to using the original string for both
 * fields so that downstream logic can still function without error.
 */
export function normalizeLang(
  identifier: string,
): { code: string; name: string } {
  const found = findLanguage(identifier);
  if (!found) {
    return { code: identifier, name: identifier };
  }
  return { code: found.code || found.name, name: found.name };
}
