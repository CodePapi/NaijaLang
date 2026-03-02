import React from 'react';
import { getLanguages, translate as apiTranslate } from '../api';

interface Language {
  name: string;
  code?: string;
  otherNames?: string[];
  type: string;
  info: string;
}

export default function Translate() {
  const [languages, setLanguages] = React.useState<Language[]>([]);
  const [srcLang, setSrcLang] = React.useState<string>('');
  const [tgtLang, setTgtLang] = React.useState<string>('');
  const [text, setText] = React.useState('');
  const [result, setResult] = React.useState('');


  React.useEffect(() => {
    async function load() {
      try {
        const data = await getLanguages();
        setLanguages(data);
        if (data.length > 0) {
          setSrcLang(data[0].code || data[0].name);
          setTgtLang(data[0].code || data[0].name);
        }
      } catch (e) {
        console.error('Failed to fetch languages', e);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-4">Translate Languages</h1>
        <p className="text-gray-600 mb-6">
          Enter text and select source/target languages to perform a translation.
        </p>
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
                  <option key={l.code || l.name} value={l.code || l.name}>
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
                  <option key={l.code || l.name} value={l.code || l.name}>
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
                const src = srcLang;
                const tgt = tgtLang;
                try {
                  const json = await apiTranslate(text, src, tgt);
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
