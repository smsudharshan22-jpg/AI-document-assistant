export default function RecentChats({ chatLog, onOpenChat, onBack }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-800">Recent Chats</h2>
      </div>

      {chatLog.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-700 font-semibold text-lg">No chats yet</p>
          <p className="text-gray-400 text-sm mt-2">Upload a PDF and start asking questions</p>
          <button onClick={onBack}
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
            ← Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
          {chatLog.slice().reverse().map((chat, i) => (
            <div key={i}
              onClick={() => onOpenChat(chat.doc)}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-sm flex-shrink-0">
                  💬
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 font-medium truncate max-w-md">{chat.question}</p>
                  <p className="text-xs text-gray-400 truncate max-w-md">{chat.answer?.slice(0, 80)}...</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xs text-purple-600 font-medium">{chat.docName}</p>
                <p className="text-xs text-gray-300">{chat.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
