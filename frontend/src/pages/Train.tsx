import React from 'react';
import { getLanguages, addExample, fetchExamples } from '../api';

interface Language {
  name: string;
  code?: string;
}

export default function Train() {
  const [languages, setLanguages] = React.useState<Language[]>([]);
  const [srcLang, setSrcLang] = React.useState<string>('');
  const [tgtLang, setTgtLang] = React.useState<string>('');
  const [examples, setExamples] = React.useState<Array<{source:string;target:string}>>([]);
  const [sourceText, setSourceText] = React.useState('');
  const [targetText, setTargetText] = React.useState('');
  const [message, setMessage] = React.useState('');


  React.useEffect(() => {
    async function loadLangs() {
      try {
        const d = await getLanguages();
        setLanguages(d);
        if (d.length > 0) {
          setSrcLang(d[0].code || d[0].name);
          setTgtLang(d[0].code || d[0].name);
        }
      } catch (e) {
        console.error('failed to load languages', e);
      }
    }
    loadLangs();
  }, []);

  React.useEffect(() => {
    async function loadExamples() {
      if (!srcLang || !tgtLang) return;
      try {
        const arr = await fetchExamples(srcLang, tgtLang);
        setExamples(arr);
      } catch (e) {
        console.error('failed to load examples', e);
      }
    }
    loadExamples();
  }, [srcLang, tgtLang]);

  const submitExample = async () => {
    if (!sourceText.trim() || !targetText.trim()) {
      setMessage('Both source and target text are required');
      return;
    }
    const srcCode = languages.find(l => l.name === srcLang)?.code || srcLang;
    const tgtCode = languages.find(l => l.name === tgtLang)?.code || tgtLang;

    try {
      await addExample({
        sourceLang: srcCode,
        targetLang: tgtCode,
        source: sourceText,
        target: targetText,
      });
      setMessage('Example saved successfully');
      setSourceText('');
      setTargetText('');
      const arr = await fetchExamples(srcCode, tgtCode);
      setExamples(arr);
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-4">Training Interface</h1>
        <p className="text-gray-600 mb-6">
          Submit parallel source/target examples to help the model learn.
        </p>
        <div className="space-y-6">
          {/* single-example form */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Add Single Example</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="trainSrc" className="block text-sm font-medium text-gray-700">
                  Source language
                </label>
                <select
                  id="trainSrc"
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
                <label htmlFor="trainTgt" className="block text-sm font-medium text-gray-700">
                  Target language
                </label>
                <select
                  id="trainTgt"
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
                Source text
              </label>
              <textarea
                id="sourceText"
                className="mt-1 border rounded w-full h-24 p-2"
                placeholder="Source text"
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="targetText" className="block text-sm font-medium text-gray-700">
                Target text
              </label>
              <textarea
                id="targetText"
                className="mt-1 border rounded w-full h-24 p-2"
                placeholder="Target text"
                value={targetText}
                onChange={e => setTargetText(e.target.value)}
              />
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
              onClick={submitExample}
            >
              Add Example
            </button>
            {message && (
              <div role="status" className="text-sm text-gray-700 mt-2">{message}</div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Existing examples</h2>
            {examples.length === 0 ? (
              <p className="text-sm text-gray-600">No examples for this pair yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {examples.map((e, idx) => (
                  <li key={idx} className="text-sm">
                    <em>{e.source}</em> → <strong>{e.target}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* batch/upload stub remains */}
          <div className="space-y-6 pt-8 border-t">
            <label className="block">
              Dataset file
              <input type="file" className="mt-1 block w-full" />
            </label>
            <label className="block">
              Model name
              <input type="text" className="border p-2 rounded w-full" />
            </label>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow">
              Start Training
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
