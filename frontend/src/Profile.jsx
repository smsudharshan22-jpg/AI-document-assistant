import { useState } from "react";

export default function Profile({ user, onBack, onUpdateUser }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onUpdateUser({ ...user, name, email, phone, bio });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
          ✅ Profile updated successfully!
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
            {name?.[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{name}</h3>
            <p className="text-gray-400 text-sm">{email}</p>
            <span className="bg-purple-50 text-purple-600 text-xs font-medium px-3 py-1 rounded-full mt-2 inline-block">
              Free Plan
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {editing ? (
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition" />
            ) : (
              <p className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">{name || "Not set"}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            {editing ? (
              <input value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition" />
            ) : (
              <p className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">{email || "Not set"}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            {editing ? (
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition" />
            ) : (
              <p className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">{phone || "Not set"}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {editing ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition resize-none" />
            ) : (
              <p className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">{bio || "Not set"}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          {editing ? (
            <>
              <button onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
                Save Changes
              </button>
              <button onClick={() => setEditing(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-6 py-2.5 rounded-xl text-sm transition">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-gray-800 mb-4">My Stats</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-purple-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-xs text-gray-500 mt-1">Documents</p>
          </div>
          <div className="text-center bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-xs text-gray-500 mt-1">Questions Asked</p>
          </div>
          <div className="text-center bg-green-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">Free</p>
            <p className="text-xs text-gray-500 mt-1">Current Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
