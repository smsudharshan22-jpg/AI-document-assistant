import { useState, useRef, useEffect } from "react";
import Profile from "./Profile";
import Settings from "./Settings";
import MyDocuments from "./MyDocuments";
import RecentChats from "./RecentChats";
import Notifications from "./Notifications";

const API = "https://ai-document-assistant-2-6uc4.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function parseHighlights(text) {
  const parts = [];
  const regex = /<highlight>(.*?)<\/highlight>/gs;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "highlight", content: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);
  const [chatLog, setChatLog] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifList, setNotifList] = useState([
    { icon: "🎉", text: "Welcome to AI Document Assistant!", time: "Just now" }
  ]);
  const fileRef = useRef();
  const bottomRef = useRef();

  useEffect(() => { loadDocuments(); loadRecentChats(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function loadDocuments() {
    try {
      const res = await fetch(`${API}/documents`, { headers: authHeaders() });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setDocuments((data.documents || []).map(d => ({
        id: d.id, name: d.filename, pages: d.page_count,
        uploaded: new Date(d.uploaded_at).toLocaleDateString(), session_id: d.id,
      })));
    } catch (e) { console.error(e); }
  }

  async function loadRecentChats() {
    try {
      const res = await fetch(`${API}/chats/recent`, { headers: authHeaders() });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setChatLog((data.chats || []).map(c => ({
        question: c.question,
        answer: c.answer.replace(/<highlight>|<\/highlight>/g, ""),
        docName: c.filename, document_id: c.document_id,
        time: new Date(c.created_at).toLocaleString(),
      })));
    } catch (e) { console.error(e); }
  }

  async function handleFile(file) {
    if (!file?.name.endsWith(".pdf")) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API}/upload`, { method: "POST", headers: authHeaders(), body: form });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const newDoc = { id: data.session_id, name: data.filename, pages: data.page_count, uploaded: "Just now", session_id: data.session_id };
      setDocuments(prev => [newDoc, ...prev]);
      setNotifList(prev => [{ icon: "📄", text: `${newDoc.name} uploaded`, time: "Just now" }, ...prev]);
      openDoc(newDoc);
    } catch (e) { alert(e.message); }
    finally { setUploading(false); }
  }

  async function openDoc(doc) {
    setActiveDoc(doc); setActivePage("chat"); setLoading(true);
    try {
      const res = await fetch(`${API}/chats/${doc.session_id}`, { headers: authHeaders() });
      const data = await res.json();
      setMessages([
        { role: "ai", content: `Hi ${currentUser?.name?.split(" ")[0] || "there"}! 👋 Ask me anything about **${doc.name}**.` },
        ...(data.chats || []).flatMap(c => ([{ role: "user", content: c.question }, { role: "ai", content: c.answer }]))
      ]);
    } catch (e) {
      setMessages([{ role: "ai", content: `Hi! Ask me anything about **${doc.name}**.` }]);
    } finally { setLoading(false); }
  }

  async function handleAsk(questionOverride) {
    const question = questionOverride || input.trim();
    if (!question || !activeDoc || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ session_id: activeDoc.session_id, question })
      });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
      setChatLog(prev => [{ question, answer: data.answer.replace(/<highlight>|<\/highlight>/g, ""), document_id: activeDoc.session_id, docName: activeDoc.name, time: "Just now" }, ...prev]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", content: `Error: ${e.message}` }]);
    } finally { setLoading(false); }
  }

  const quickActions = ["Summarize", "Key Points", "Explain", "MCQs", "Find Topics"];
  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "documents", icon: "📄", label: "My Documents" },
    { id: "chats", icon: "💬", label: "Recent Chats" },
    { id: "shared", icon: "👥", label: "Shared with me" },
    { id: "trash", icon: "🗑️", label: "Trash" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col flex-shrink-0`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center"><span className="text-white text-lg">📄</span></div>
            <span className="text-gray-800 font-bold text-sm">AI Doc Assistant</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => {
              if (item.id === "shared" || item.id === "trash") { alert(`${item.label} coming soon!`); }
              else { setActivePage(item.id); }
            }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activePage === item.id ? "bg-purple-50 text-purple-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-1">
          <p className="text-xs text-gray-400 font-semibold px-3 mb-2">ACCOUNT</p>
          <button onClick={() => setActivePage("profile")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activePage === "profile" ? "bg-purple-50 text-purple-600" : "text-gray-500 hover:bg-gray-50"}`}><span>👤</span><span>Profile</span></button>
          <button onClick={() => setActivePage("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activePage === "settings" ? "bg-purple-50 text-purple-600" : "text-gray-500 hover:bg-gray-50"}`}><span>⚙️</span><span>Settings</span></button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-500"><span>🚪</span><span>Logout</span></button>
        </div>
        <div className="p-4">
          <div className="bg-purple-50 rounded-2xl p-4 flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Questions Asked</p><p className="text-2xl font-bold text-purple-600">{chatLog.length}</p></div>
            <span className="text-2xl">❓</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 text-xl">☰</button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {activePage === "dashboard" ? "Dashboard" : activePage === "chat" ? activeDoc?.name : activePage === "documents" ? "My Documents" : activePage === "chats" ? "Recent Chats" : activePage === "profile" ? "My Profile" : activePage === "settings" ? "Settings" : "Dashboard"}
              </h1>
              <p className="text-xs text-gray-400">Welcome back, {currentUser?.name} 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            {!["chat", "profile", "settings"].includes(activePage) && (
              <button onClick={() => fileRef.current.click()} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition">
                <span>+</span> Upload New PDF
              </button>
            )}
            <button onClick={() => setShowNotifs(!showNotifs)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200 relative">
              🔔
              {notifList.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{notifList.length}</span>}
            </button>
            {showNotifs && <Notifications notifications={notifList} onClose={() => setShowNotifs(false)} />}
            <button onClick={() => setActivePage("profile")} className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">{currentUser?.name?.[0] || "S"}</button>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </header>

        {activePage === "dashboard" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input placeholder="Search documents..." className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-purple-400 transition" />
            </div>
            {documents.length === 0 && (
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition mb-6 ${dragOver ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-300 bg-white"}`}>
                <div className="text-5xl mb-4">{uploading ? "⏳" : "📂"}</div>
                <p className="text-gray-700 font-semibold">{uploading ? "Uploading..." : "Drop your PDF here"}</p>
                <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
              </div>
            )}
            {documents.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">My Documents</h2>
                  <button onClick={() => fileRef.current.click()} className="text-purple-600 text-sm font-medium hover:underline">+ Upload New</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {documents.map(doc => (
                    <button key={doc.id} onClick={() => openDoc(doc)} className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-md hover:border-purple-200 transition">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3"><span className="text-red-500 text-sm font-bold">PDF</span></div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{doc.pages} Pages</p>
                      <p className="text-xs text-gray-400">{doc.uploaded}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
            {chatLog.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">Recent Chats</h2>
                  <button onClick={() => setActivePage("chats")} className="text-purple-600 text-sm font-medium hover:underline">View all</button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                  {chatLog.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => setActivePage("chats")}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm">💬</div>
                        <p className="text-sm text-gray-700 font-medium truncate max-w-xs">{c.question}</p>
                      </div>
                      <div className="text-right"><p className="text-xs text-gray-400">{c.docName}</p><p className="text-xs text-gray-300">{c.time}</p></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activePage === "documents" && <MyDocuments documents={documents} onOpenDoc={openDoc} onBack={() => setActivePage("dashboard")} />}
        {activePage === "chats" && <RecentChats chatLog={chatLog} onOpenChat={(doc) => { const found = documents.find(d => d.session_id === doc?.document_id); if (found) openDoc(found); }} onBack={() => setActivePage("dashboard")} />}
        {activePage === "settings" && <Settings onBack={() => setActivePage("dashboard")} />}
        {activePage === "profile" && (
          <Profile user={currentUser} onBack={() => setActivePage("dashboard")}
            onUpdateUser={async (updated) => {
              setCurrentUser(updated);
              localStorage.setItem("user", JSON.stringify(updated));
              try { await fetch(`${API}/profile`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ name: updated.name, phone: updated.phone, bio: updated.bio }) }); }
              catch (e) { console.error(e); }
            }} />
        )}

        {activePage === "chat" && activeDoc && (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <button onClick={() => setActivePage("dashboard")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 mb-3">← Back</button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><span className="text-red-500 text-xs font-bold">PDF</span></div>
                  <div><p className="text-xs font-semibold text-gray-800 truncate w-32">{activeDoc.name}</p><p className="text-xs text-gray-400">{activeDoc.pages} Pages</p></div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <p className="text-xs text-gray-400 font-semibold mb-2">PAGES</p>
                {Array.from({ length: Math.min(activeDoc.pages || 5, 10) }, (_, i) => (
                  <div key={i} className={`rounded-xl border-2 p-2 cursor-pointer transition ${i === 0 ? "border-purple-400 bg-purple-50" : "border-gray-100 hover:border-purple-200"}`}>
                    <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center mb-1"><span className="text-gray-300 text-2xl">📄</span></div>
                    <p className="text-xs text-center text-gray-500">Page {i + 1}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-4">
                <button className="text-sm font-semibold text-purple-600 border-b-2 border-purple-600 pb-1">AI Chat</button>
                <button className="text-sm text-gray-400 hover:text-gray-600">Chat History</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                    {m.role === "ai" && <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>}
                    <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-purple-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm"}`}>
                      {m.role === "ai" ? parseHighlights(m.content).map((p, j) => p.type === "highlight" ? <mark key={j} className="bg-purple-100 text-purple-700 px-1 rounded not-italic">{p.content}</mark> : <span key={j} style={{ whiteSpace: "pre-wrap" }}>{p.content}</span>) : m.content}
                    </div>
                    {m.role === "user" && <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">{currentUser?.name?.[0] || "S"}</div>}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">AI</div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="bg-white border-t border-gray-100 p-4">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {quickActions.map(action => (
                    <button key={action} onClick={() => handleAsk(action)} className="flex-shrink-0 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg transition">{action}</button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAsk()} placeholder="Ask anything..." disabled={loading} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition" />
                  <button onClick={() => handleAsk()} disabled={loading || !input.trim()} className="w-11 h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition">➤</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
