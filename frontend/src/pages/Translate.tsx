import React from 'react';

interface Language {
  name: string;
  otherNames?: string[];
  type: string;
  info: string;
}

export default function Translate() {
  const [languages, setLanguages] = React.useState<Language[]>([]);
  const [srcLang, setSrcLang] = React.useState<string>('English');
  const [tgtLang, setTgtLang] = React.useState<string>('Igbo');
  const [text, setText] = React.useState('');
  const [result, setResult] = React.useState('');

  React.useEffect(() => {
    fetch('/lang.json')
      .then(res => res.json())
      .then((data: { languages: Language[] }) =>
         setLanguages(data.languages)
    )
      .catch(err => console.error('could not load languages', err));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Translate Languages</h1>
        {/* source/target selectors, text input, output area */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border p-2 rounded w-full"
              value={srcLang}
              onChange={e => setSrcLang(e.target.value)}
            >
              {languages.map(l => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <select
              className="border p-2 rounded w-full"
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
          <textarea
            className="border rounded w-full h-32 p-2"
            placeholder="Enter text to translate"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
            onClick={() => {
              /* call backend when available */
              setResult(`(translation of "${text}" from ${srcLang} to ${tgtLang})`);
            }}
          >
            Translate
          </button>
          <div className="border rounded p-2 h-32 bg-gray-50 whitespace-pre-wrap">
            {result || 'Output will appear here'}
          </div>
        </div>
      </div>
    </div>
  );
}
