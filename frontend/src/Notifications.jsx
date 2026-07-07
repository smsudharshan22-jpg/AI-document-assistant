export default function Notifications({ notifications, onClose }) {
  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h4 className="font-bold text-gray-800 text-sm">Notifications</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2">🔔</div>
            <p className="text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div key={i} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex gap-3">
              <span className="text-lg flex-shrink-0">{n.icon}</span>
              <div className="min-w-0">
                <p className="text-sm text-gray-700">{n.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
