// simple frontend fetch wrapper that expects VITE_API_BASE_URL to point
// at the ai-model service (e.g. "http://localhost:3000").  If the variable
// is empty we still attempt the request relative to the current origin but
// this configuration is only useful when the frontend and ai-model are
// hosted together.
// default to localhost:3000 in development for ease of use
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// fallback package for when backend is unreachable (primarily for dev)
import languagesPkg from 'nigeria-languages';

export async function getLanguages() {
  const url = BASE ? `${BASE}/languages` : '/languages';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`languages fetch failed: ${res.status}`);
    return res.json();
  } catch (e) {
    console.warn('falling back to local nigeria-languages package', e);
    return languagesPkg as any[];
  }
}

export async function translate(text:string, sourceLang:string, targetLang:string) {
  const url = BASE ? `${BASE}/model/translate` : '/model/translate';
  console.debug('calling translate url', url, text, sourceLang, targetLang);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLang, targetLang }),
  });
  if (!res.ok) throw new Error(`translate failed: ${res.status}`);
  return res.json();
}

export async function addExample(example: any) {
  const url = BASE ? `${BASE}/training` : '/training';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(example),
  });
  if (!res.ok) throw new Error(`train failed: ${res.status}`);
  return res.json();
}

export async function fetchExamples(src:string, tgt:string) {
  const url = BASE ? `${BASE}/training/${src}/${tgt}` : `/training/${src}/${tgt}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchExamples failed: ${res.status}`);
  return res.json();
}
