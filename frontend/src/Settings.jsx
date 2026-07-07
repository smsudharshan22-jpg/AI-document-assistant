import { useState } from "react";

export default function Settings({ onBack }) {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${value ? "bg-purple-600" : "bg-gray-200"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-3 mb-4 text-sm">
          ✅ Settings saved successfully!
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h4 className="font-bold text-gray-800 mb-4">🔔 Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Push Notifications</p>
              <p className="text-xs text-gray-400">Get notified about new updates</p>
            </div>
            <Toggle value={notifications} onChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Email Alerts</p>
              <p className="text-xs text-gray-400">Receive updates via email</p>
            </div>
            <Toggle value={emailAlerts} onChange={setEmailAlerts} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h4 className="font-bold text-gray-800 mb-4">🎨 Appearance</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Dark Mode</p>
              <p className="text-xs text-gray-400">Switch to dark theme</p>
            </div>
            <Toggle value={darkMode} onChange={setDarkMode} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Language</p>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition">
              <option>English</option>
              <option>Hindi</option>
              <option>Telugu</option>
              <option>Tamil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h4 className="font-bold text-gray-800 mb-4">👤 Account</h4>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 rounded-xl text-sm transition">
            🔒 Change Password
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 rounded-xl text-sm transition">
            📧 Change Email
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl text-sm transition">
            🗑️ Delete Account
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h4 className="font-bold text-gray-800 mb-4">ℹ️ About</h4>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>App Name</span>
            <span className="font-medium text-gray-700">AI Document Assistant</span>
          </div>
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium text-gray-700">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Built with</span>
            <span className="font-medium text-gray-700">React + Flask + Groq AI</span>
          </div>
          <div className="flex justify-between">
            <span>Developer</span>
            <span className="font-medium text-gray-700">Sudharshan</span>
          </div>
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition">
        Save Settings
      </button>
    </div>
  );
}
