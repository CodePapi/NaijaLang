
export default function Train() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Training Interface</h1>
        {/* stub: upload dataset, select model, configure parameters */}
        <div className="space-y-6">
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
  );
}
