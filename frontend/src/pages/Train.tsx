import React from 'react';
import { getLanguages, addExample, addBatch, fetchExamples } from '../api';

interface Language {
  name: string;
  code?: string;
}

export default function Train() {
  const [languages, setLanguages] = React.useState<Language[]>([]);
  const [srcLang, setSrcLang] = React.useState<string>('');
  const [tgtLang, setTgtLang] = React.useState<string>('');
  const [examples, setExamples] = React.useState<Array<{source:string;target:string}>>([]);
  const [bulkInput, setBulkInput] = React.useState('');
  const [sourceText, setSourceText] = React.useState('');
  const [targetText, setTargetText] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [fineTuneMsg, setFineTuneMsg] = React.useState('');
  const [fineTuneLoading, setFineTuneLoading] = React.useState(false);


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
          <br />You can add a single pair below, paste many lines into the bulk
          box, or upload a JSON/CSV file.  Non‑technical users should just put
          one translation per line like <code>good morning → ina kwana</code>.
          <br /><strong>Tip:</strong> codes such as <code>np</code>, <code>m4</code>,
          etc. identify under‑represented Nigerian languages – you can select
          them from the dropdowns above and see the code in parentheses.
        </p>
        <div className="space-y-6">
          {/* bulk input and file upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bulk or File Upload</h2>
            <textarea
              className="mt-1 border rounded w-full h-24 p-2"
              placeholder="one pair per line, e.g. hello → sallama"
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
            />
            <div className="flex items-center space-x-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
                onClick={async () => {
                  // parse lines
                  const lines = bulkInput
                    .split(/\r?\n/)
                    .map(l => l.trim())
                    .filter(Boolean);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pairs: any[] = [];
                  for (const l of lines) {
                    const parts = l.split(/→|=>|=/).map(p => p.trim());
                    if (parts.length >= 2) {
                      pairs.push({ sourceLang: srcLang, targetLang: tgtLang, source: parts[0], target: parts[1] });
                    }
                  }
                  if (pairs.length) {
                    try {
                      await addBatch(pairs);
                      setMessage(`Imported ${pairs.length} examples`);
                      setBulkInput('');
                      const arr = await fetchExamples(srcLang, tgtLang);
                      setExamples(arr);
                    } catch (e) {
                      console.error(e);
                      setMessage('Bulk upload failed');
                    }
                  } else {
                    setMessage('No valid pairs detected');
                  }
                }}
              >
                Import Lines
              </button>
              <input
                type="file"
                accept=".json,.csv,text/plain"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  let arr: any[] = [];
                  if (file.name.endsWith('.json')) {
                    try { arr = JSON.parse(text); } catch {
                      // ignore parse errors
                    }
                  } else {
                    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
                    for (const l of lines) {
                      const parts = l.split(/→|=>|=/).map(p=>p.trim());
                      if (parts.length>=2) arr.push({ sourceLang: srcLang, targetLang: tgtLang, source: parts[0], target: parts[1] });
                    }
                  }
                  if (arr.length) {
                    try {
                      await addBatch(arr);
                      setMessage(`Imported ${arr.length} examples`);
                      setBulkInput('');
                      const updated = await fetchExamples(srcLang, tgtLang);
                      setExamples(updated);
                    } catch (err) {
                      console.error(err);
                      setMessage('File import failed');
                    }
                  }
                }}
              />
            </div>
          </div>
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
                      {l.name}{l.code ? ` (${l.code})` : ''}
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
                      {l.name}{l.code ? ` (${l.code})` : ''}
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
            <div className="mt-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={async () => {
                  if (fineTuneLoading) return;
                  setFineTuneLoading(true);
                  try {
                    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                    const res = await fetch(`${base}/model/fine-tune`, { method: 'POST' });
                    const json = await res.json();
                    setFineTuneMsg(json.result || 'Fine-tune triggered');
                  } catch (e) {
                    console.error(e);
                    setFineTuneMsg('Fine-tune failed');
                  } finally {
                    setFineTuneLoading(false);
                    setTimeout(() => setFineTuneMsg(''), 5000);
                  }
                }}
                disabled={fineTuneLoading}
              >
                {fineTuneLoading ? 'Running…' : 'Run fine‑tune now'}
              </button>
              {fineTuneMsg && <p className="text-sm text-gray-700 mt-2">{fineTuneMsg}</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
