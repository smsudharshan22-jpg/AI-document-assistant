import { useState } from "react";

export default function Login({ onLogin, onGoSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("Please fill in all fields.");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: "Sudharshan", email });
    }, 1200);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-white opacity-5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center">
            <span className="text-3xl">📄</span>
          </div>
          <span className="text-white text-2xl font-bold">AI Document Assistant</span>
        </div>

        {/* Illustration */}
        <div className="relative z-10 bg-white bg-opacity-10 rounded-3xl p-8 mb-10 w-full max-w-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-purple-400 bg-opacity-50 rounded-xl flex items-center justify-center text-white text-lg">🤖</div>
            <div className="bg-white bg-opacity-20 rounded-2xl rounded-tl-none p-4 flex-1">
              <p className="text-white text-sm">Hi Sudharshan! I've analyzed your document. What would you like to know?</p>
            </div>
          </div>
          <div className="flex items-start gap-4 justify-end">
            <div className="bg-white bg-opacity-20 rounded-2xl rounded-tr-none p-4 flex-1">
              <p className="text-white text-sm">Summarize the key points from page 3.</p>
            </div>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-lg">👤</div>
          </div>
        </div>

        <h2 className="relative z-10 text-white text-3xl font-bold text-center mb-4">
          AI Document Assistant
        </h2>
        <p className="relative z-10 text-purple-200 text-center text-base max-w-xs">
          Upload your PDF and ask anything. Get instant answers from your documents with AI.
        </p>

        {/* Stats */}
        <div className="relative z-10 flex gap-8 mt-10">
          <div className="text-center">
            <p className="text-white text-2xl font-bold">10K+</p>
            <p className="text-purple-200 text-xs">Documents</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">50K+</p>
            <p className="text-purple-200 text-xs">Questions Asked</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">99%</p>
            <p className="text-purple-200 text-xs">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span className="text-2xl">📄</span>
            <span className="text-purple-600 text-xl font-bold">AI Document Assistant</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back 👋</h2>
            <p className="text-gray-500 text-sm mb-8">Sign in to continue to your account</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" onClick={() => alert("Forgot password feature coming soon!")} className="text-sm text-blue-600 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Button */}
            <button onClick={() => alert("Google login coming soon!")} className="w-full border border-gray-200 hover:bg-gray-50 rounded-xl py-3 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.5 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 10-1.8 13.7-4.9l-6.3-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-3.4-11.2-8.1l-6.5 5C9.6 39.4 16.3 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.3 5.2C41.4 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-4z" />
              </svg>
              Sign in with Google
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <button onClick={onGoSignup} className="text-blue-600 font-semibold hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}
