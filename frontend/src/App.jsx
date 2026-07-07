import { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

export default function App() {
  const [page, setPage] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setPage("app");
    } else {
      setPage("login");
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  }

  if (page === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-purple-600 text-lg font-semibold">Loading...</div>
      </div>
    );
  }
  if (page === "login") {
    return <Login
      onLogin={(u) => { setUser(u); setPage("app"); }}
      onGoSignup={() => setPage("signup")}
    />;
  }
  if (page === "signup") {
    return <Signup
      onSignup={(u) => { setUser(u); setPage("app"); }}
      onGoLogin={() => setPage("login")}
    />;
  }
  return <Dashboard user={user} onLogout={handleLogout} />;
}