import React from 'react';
import languagesList from 'nigeria-languages';

interface Language {
  name: string;
  code?: string;
}

export default function Train() {
  const [languages] = React.useState<Language[]>(languagesList as Language[]);
  const [srcLang, setSrcLang] = React.useState<string>('English');
  const [tgtLang, setTgtLang] = React.useState<string>('Nigerian Pidgin');
  const [sourceText, setSourceText] = React.useState('');
  const [targetText, setTargetText] = React.useState('');
  const [message, setMessage] = React.useState('');

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  // languages are static; no fetch required

  const submitExample = async () => {
    if (!sourceText.trim() || !targetText.trim()) {
      setMessage('Both source and target text are required');
      return;
    }
    const srcCode = languages.find(l => l.name === srcLang)?.code || srcLang;
    const tgtCode = languages.find(l => l.name === tgtLang)?.code || tgtLang;

    try {
      const res = await fetch(apiBase + '/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: srcCode,
          targetLang: tgtCode,
          source: sourceText,
          target: targetText,
        }),
      });
      if (res.ok) {
        setMessage('Example saved successfully');
        setSourceText('');
        setTargetText('');
      } else {
        const text = await res.text();
        setMessage('Error: ' + text);
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Training Interface</h1>
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
                    <option key={l.name} value={l.name}>
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
                    <option key={l.name} value={l.name}>
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
