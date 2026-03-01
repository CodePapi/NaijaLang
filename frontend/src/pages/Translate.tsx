import React from 'react';
import languagesList from 'nigeria-languages';

interface Language {
  name: string;
  code?: string;
  otherNames?: string[];
  type: string;
  info: string;
}

export default function Translate() {
  // use the npm package rather than fetching a static file
  const [languages] = React.useState<Language[]>(languagesList as Language[]);
  const [srcLang, setSrcLang] = React.useState<string>('English');
  const [tgtLang, setTgtLang] = React.useState<string>('Igbo');
  const [text, setText] = React.useState('');
  const [result, setResult] = React.useState('');

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  // no need for effect; languages are static

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Translate Languages</h1>
        {/* source/target selectors, text input, output area */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="srcLang" className="block text-sm font-medium text-gray-700">
                Source language
              </label>
              <select
                id="srcLang"
                className="mt-1 block w-full border p-2 rounded"
                value={srcLang}
                onChange={e => setSrcLang(e.target.value)}
              >
                {languages.map(l => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tgtLang" className="block text-sm font-medium text-gray-700">
                Target language
              </label>
              <select
                id="tgtLang"
                className="mt-1 block w-full border p-2 rounded"
                value={tgtLang}
                onChange={e => setTgtLang(e.target.value)}
              >
                {languages.map(l => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="sourceText" className="block text-sm font-medium text-gray-700">
              Text to translate
            </label>
            <textarea
              id="sourceText"
              className="mt-1 border rounded w-full h-32 p-2"
              placeholder="Enter text to translate"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
          <div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
              onClick={async () => {
                if (!text.trim()) return;
                // find codes for the selected names
                const src = languages.find((l) => l.name === srcLang)?.code || srcLang;
                const tgt = languages.find((l) => l.name === tgtLang)?.code || tgtLang;
                try {
                  const res = await fetch(apiBase + '/model/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, sourceLang: src, targetLang: tgt }),
                  });
                  const json = await res.json();
                  setResult(json.translation || '(no translation)');
                } catch (err) {
                  console.error(err);
                  setResult('error contacting server');
                }
              }}
            >
              Translate
            </button>
          </div>
          <div>
            <label htmlFor="result" className="sr-only">Translation result</label>
            <div
              id="result"
              className="border rounded p-2 h-32 bg-gray-50 whitespace-pre-wrap"
            >
              {result || 'Output will appear here'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
