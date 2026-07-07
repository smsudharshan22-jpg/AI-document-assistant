import { useState } from "react";

const API = "https://ai-document-assistant-2-6uc4.onrender.com";

export default function Signup({ onSignup, onGoLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onSignup(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-white opacity-5 rounded-full" />

        <div className="relative z-10 flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <span className="text-white text-2xl font-bold">AI Document Assistant</span>
        </div>

        <div className="relative z-10 space-y-4 w-full max-w-sm mb-10">
          {[
            { icon: "🤖", text: "AI-powered document analysis" },
            { icon: "💬", text: "Chat with any PDF instantly" },
            { icon: "🔍", text: "Find information in seconds" },
            { icon: "📊", text: "Summarize long documents" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white bg-opacity-10 rounded-2xl p-4">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-purple-200 text-center text-sm max-w-xs">
          Join thousands of users who save hours every day using AI Document Assistant.
        </p>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span className="text-2xl">📄</span>
            <span className="text-purple-600 text-xl font-bold">AI Document Assistant</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account 🚀</h2>
            <p className="text-gray-500 text-sm mb-8">Sign up to get started for free</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button onClick={() => alert("Google signup coming soon!")}
              className="w-full border border-gray-200 hover:bg-gray-50 rounded-xl py-3 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.5 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 10-1.8 13.7-4.9l-6.3-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-3.4-11.2-8.1l-6.5 5C9.6 39.4 16.3 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.3 5.2C41.4 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-4z" />
              </svg>
              Sign up with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <button onClick={onGoLogin} className="text-purple-600 font-semibold hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
