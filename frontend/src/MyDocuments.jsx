export default function MyDocuments({ documents, onOpenDoc, onBack }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-800">My Documents</h2>
        <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
          {documents.length} files
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-gray-700 font-semibold text-lg">No documents yet</p>
          <p className="text-gray-400 text-sm mt-2">Upload a PDF to get started</p>
          <button onClick={onBack}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
            ← Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-purple-200 transition cursor-pointer"
              onClick={() => onOpenDoc(doc)}>
              {/* Icon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-red-500 text-sm font-bold">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.pages} Pages</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>📅 {doc.uploaded}</span>
                <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-lg font-medium">
                  Open →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
