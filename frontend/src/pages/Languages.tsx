import React from 'react';
import { getLanguages } from '../api';

interface Language {
  id?: number;
  name: string;
  code?: string;
  type?: string;
  info?: string;
}

export default function Languages() {
  const [langs, setLangs] = React.useState<Language[]>([]);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getLanguages();
        setLangs(data);
      } catch (e) {
        console.error('failed to fetch languages', e);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-extrabold mb-4">Supported Languages</h1>
      {langs.length === 0 ? (
        <p className="text-gray-600">No languages available.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Code</th>
              <th className="border px-4 py-2 text-left">Type</th>
              <th className="border px-4 py-2 text-left">Info</th>
            </tr>
          </thead>
          <tbody>
            {langs.map((l, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="border px-4 py-2">{l.name}</td>
                <td className="border px-4 py-2">{l.code || '-'}</td>
                <td className="border px-4 py-2">{l.type || '-'}</td>
                <td className="border px-4 py-2">{l.info || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
