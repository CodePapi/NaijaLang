import React from 'react';
import languagesList from 'nigeria-languages';

interface Language {
  name: string;
  type: string;
  otherNames?: string[];
  info: string;
}

export default function Docs() {
  const [count] = React.useState<number>(
    (languagesList as Language[]).length
  );

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  // no fetch needed; languages are part of npm package

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Developer Documentation</h1>
        <p className="mb-4">
          This section will describe the API endpoints and how to contribute. The web interface
          also includes a <a className="text-blue-600 underline" href="/train">training page</a>
          where examples can be added one‑by‑one or via file upload. Under the hood the list of
          languages is pulled from the <code>nigeria-languages</code> npm package rather than a
          hard‑coded file.
        </p>
        <p className="mb-4">
          Currently supporting <strong>{count}</strong> languages from the package.
        </p>
        <p className="mb-4">
          API requests use the <code>VITE_API_BASE_URL</code> environment variable, which should
          point to the backend (e.g. <code>http://localhost:3000</code> in development).
        </p>
        <h2 className="text-xl font-semibold mt-6">API Endpoints</h2>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><code>POST /api/translate</code> - translate text using current examples</li>
          <li><code>POST /api/train</code> - add training examples; can be a single example or a batch array</li>
          <li><code>GET /api/languages</code> - list supported languages</li>
        </ul>
      </div>
    </div>
  );
}
