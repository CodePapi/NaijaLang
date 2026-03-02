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

  // no fetch needed; languages are part of npm package

  return (
    <div className="max-w-3xl mx-auto py-6">
      <article className="prose prose-blue bg-white rounded-lg shadow p-6">
        <h1>Developer Documentation</h1>
        <p>
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
        <h2>API Endpoints</h2>
        <ul>
          <li><code>POST /api/translate</code> - proxy to the AI model's translation endpoint; accepts <code>{"{ text, sourceLang, targetLang }"}</code></li>
          <li><code>POST /api/train</code> - proxy to /training; add a single example or send an array for batch insertion</li>
          <li><code>GET /api/train/:source/:target</code> - fetch existing training examples for a pair</li>
          <li><code>GET /api/languages</code> - retrieve the list of languages (name &amp; code)</li>
        </ul>
      </article>
    </div>
  );
}
