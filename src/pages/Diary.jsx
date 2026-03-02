import { useState, useEffect } from "react";
import { Plus, BookOpen, Trash2, Eye, EyeOff, Edit3, X, Check } from "lucide-react";

const moodEmoji = { great: "😄", good: "🙂", okay: "😐", bad: "😕", terrible: "😞" };

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ title: "", content: "", date: new Date().toISOString().slice(0, 10), mood: "", is_private: true });

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setEntries([]);
    setLoading(false);
  };

  const createEntry = async () => { setShowForm(false); };
  const saveEdit = async () => { setEditingId(null); };
  const deleteEntry = async () => {};

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#E85D26] rounded-full"></div>
            <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">REFLECT</span>
          </div>
          <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">DIARY</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="accent-btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> NEW ENTRY
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E8E8E0] rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase text-sm tracking-wider">New Diary Entry</h3>
          <div className="space-y-3">
            <input className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
              placeholder="Title (optional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0] resize-none h-40"
              placeholder="Write your thoughts... *" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
              <input type="date" className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-[#F5F5F0]"
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <select className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none bg-[#F5F5F0]"
                value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })}>
                <option value="">No mood</option>
                {Object.entries(moodEmoji).map(([k, v]) => <option key={k} value={k}>{v} {k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
              </select>
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <div onClick={() => setForm({ ...form, is_private: !form.is_private })}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${form.is_private ? "bg-[#1A1A1A]" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_private ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A80]">Private</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-[#8A8A80] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F0] transition-colors uppercase tracking-wider">Cancel</button>
              <button onClick={createEntry} className="accent-btn">SAVE ENTRY</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry List */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#E8E8E0] rounded-xl">
              <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="font-bold text-[#8A8A80] uppercase tracking-wider text-xs">No entries yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div key={entry.id}
                  onClick={() => setSelected(entry)}
                  className={`bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all group ${selected?.id === entry.id ? "border-[#1A1A1A]" : "border-[#E8E8E0] hover:border-[#1A1A1A]"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1A1A1A] truncate">{entry.title || "Untitled"}</p>
                      <p className="text-[10px] text-[#8A8A80] font-medium mt-0.5">
                        {new Date(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                        {entry.mood && ` · ${moodEmoji[entry.mood]}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {entry.is_private && <EyeOff className="w-3 h-3 text-[#8A8A80]" />}
                      <button onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#8A8A80] mt-1 line-clamp-2">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Entry Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white border border-[#E8E8E0] rounded-xl p-6">
              {editingId === selected.id ? (
                <div className="space-y-3">
                  <input className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
                    value={editForm.title || ""} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                  <textarea className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0] resize-none h-60"
                    value={editForm.content || ""} onChange={e => setEditForm({ ...editForm, content: e.target.value })} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-semibold text-[#8A8A80] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F0] uppercase tracking-wider">
                      <X className="w-4 h-4 inline mr-1" />Cancel
                    </button>
                    <button onClick={saveEdit} className="accent-btn flex items-center gap-2">
                      <Check className="w-4 h-4" /> SAVE
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-black text-[#1A1A1A]">{selected.title || "Untitled"}</h2>
                      <p className="text-[11px] text-[#8A8A80] font-medium mt-1">
                        {new Date(selected.date).toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        {selected.mood && ` · ${moodEmoji[selected.mood]} ${selected.mood}`}
                        {selected.is_private && " · 🔒 Private"}
                      </p>
                    </div>
                    <button onClick={() => { setEditingId(selected.id); setEditForm({ title: selected.title, content: selected.content }); }}
                      className="p-2 rounded-lg hover:bg-[#F5F5F0] transition-colors">
                      <Edit3 className="w-4 h-4 text-[#8A8A80]" />
                    </button>
                  </div>
                  <div className="border-t border-[#E8E8E0] pt-4">
                    <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E8E8E0] rounded-xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-[#8A8A80] uppercase tracking-wider text-sm">Select an entry to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}