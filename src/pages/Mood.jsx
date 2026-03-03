import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getMoodEntries,
  createMoodEntry,
  getFocusModules,
  createFocusModule,
  updateFocusModule,
  deleteFocusModule,
} from "@/lib/firestoreService";
import { Plus, Filter, ChevronLeft, ChevronRight, Pencil, Check, X } from "lucide-react";

const EMOTION_TAGS = [
  { key: "Glücklich", emoji: "😊" },
  { key: "Traurig", emoji: "😔" },
  { key: "Wütend", emoji: "⚠️" },
  { key: "Reflexion", emoji: "💡" },
  { key: "Entscheidung", emoji: "🔀" },
  { key: "Muster erkannt", emoji: "🧩" },
  { key: "HR", emoji: "✨" },
];

// ── Mood categories matching screenshot style ─────────────────────────────────
const MOOD_ITEMS = [
  { key: "terrible", emoji: "😞", label: "Terrible", score: 1 },
  { key: "bad",      emoji: "😕", label: "Bad",      score: 2 },
  { key: "okay",     emoji: "😐", label: "Okay",     score: 3 },
  { key: "good",     emoji: "🙂", label: "Good",     score: 4 },
  { key: "great",    emoji: "😄", label: "Great",    score: 5 },
];

const ENERGY_ITEMS = [
  { key: "1", emoji: "🔋", label: "Leer" },
  { key: "2", emoji: "🔋", label: "Niedrig" },
  { key: "3", emoji: "⚡", label: "Mittel" },
  { key: "4", emoji: "⚡", label: "Gut" },
  { key: "5", emoji: "🚀", label: "Top" },
];

const SLEEP_ITEMS = [
  { key: "1", emoji: "😴", label: "< 4h" },
  { key: "2", emoji: "😴", label: "4-5h" },
  { key: "3", emoji: "🛏️", label: "6-7h" },
  { key: "4", emoji: "🛏️", label: "8h" },
  { key: "5", emoji: "✨", label: "9h+" },
];

const STRESS_ITEMS = [
  { key: "1", emoji: "😌", label: "Kein" },
  { key: "2", emoji: "🧘", label: "Wenig" },
  { key: "3", emoji: "😤", label: "Mittel" },
  { key: "4", emoji: "😰", label: "Hoch" },
  { key: "5", emoji: "🤯", label: "Extrem" },
];

const moodMap = Object.fromEntries(MOOD_ITEMS.map(m => [m.key, m]));

const SCORE_COLORS = {
  1: { bg: "#FEE2E2", text: "#EF4444" },
  2: { bg: "#FEF3C7", text: "#F59E0B" },
  3: { bg: "#F5F5F0", text: "#8A8A80" },
  4: { bg: "#D1FAE5", text: "#10B981" },
  5: { bg: "#D1FAE5", text: "#059669" },
};

function MoodCalendar({ entries }) {
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();

  // Build map: "YYYY-MM-DD" -> avg score
  const dayMap = {};
  entries.forEach(e => {
    const key = e.date?.slice(0, 10);
    if (!key) return;
    const d = new Date(key);
    if (d.getFullYear() === year && d.getMonth() === month) {
      if (!dayMap[key]) dayMap[key] = [];
      dayMap[key].push(e.mood_score || 3);
    }
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  // Adjust for Monday start
  const startOffset = (firstDow + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = calMonth.toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  return (
    <div className="bg-white border border-[#E8E8E0] rounded-2xl p-5 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-[#E85D26] rounded-full" />
        <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase flex-1">Stimmungs-Kalender</h2>
        <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-[#F5F5F0]">
          <ChevronLeft className="w-4 h-4 text-[#8A8A80]" />
        </button>
        <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider min-w-[120px] text-center">{monthName}</span>
        <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-[#F5F5F0]">
          <ChevronRight className="w-4 h-4 text-[#8A8A80]" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-[#8A8A80] py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const key = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const scores = dayMap[key];
          const avg = scores ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;
          const colors = avg ? SCORE_COLORS[avg] : null;
          const isToday = key === todayKey;
          const emoji = avg ? MOOD_ITEMS.find(m => m.score === avg)?.emoji : null;

          return (
            <div
              key={key}
              title={avg ? `Ø ${avg}/5` : ""}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-bold transition-all
                ${isToday ? "ring-2 ring-[#E85D26]" : ""}
              `}
              style={colors ? { background: colors.bg, color: colors.text } : { background: "#F5F5F0", color: "#C0C0B8" }}
            >
              {emoji && <span className="text-base leading-none">{emoji}</span>}
              <span className={`leading-none mt-0.5 ${colors ? "" : "text-[#C0C0B8]"}`}>{day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 justify-center flex-wrap">
        {MOOD_ITEMS.map(m => (
          <div key={m.key} className="flex items-center gap-1 text-[10px] font-bold text-[#8A8A80]">
            <span>{m.emoji}</span> {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function TileGroup({ title, items, selected, onSelect, accent = "#E85D26" }) {
  return (
    <div className="bg-white border border-[#E8E8E0] rounded-2xl p-5">
      <h3 className="font-black text-[#1A1A1A] text-sm mb-4 tracking-wide">{title}</h3>
      <div className="flex gap-1 sm:gap-2 justify-between">
        {items.map(item => {
          const isSelected = selected === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex flex-col items-center gap-1 sm:gap-1.5 flex-1 py-2 sm:py-3 px-0.5 rounded-xl transition-all ${
                isSelected ? "bg-[#FEF0EB] ring-2 ring-[#E85D26]" : "hover:bg-[#F5F5F0]"
              }`}
            >
              <span className="text-xl sm:text-2xl">{item.emoji}</span>
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-[#E85D26]" : "text-[#8A8A80]"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SLOT_COLORS = ["#E85D26", "#3B82F6", "#8B5CF6"];

function FocusModules({ userId }) {
  const [modules, setModules] = useState([null, null, null]);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({ title: "", description: "", color: "#E85D26" });

  useEffect(() => {
    if (!userId) return;
    getFocusModules(userId).then((data) => {
      const arr = [null, null, null];
      data.forEach((m) => { if (m.slot >= 1 && m.slot <= 3) arr[m.slot - 1] = m; });
      setModules(arr);
    });
  }, [userId]);

  const startEdit = (i, mod) => {
    setEditing(i);
    setEditVal(mod ? { title: mod.title, description: mod.description || "", color: mod.color || SLOT_COLORS[i] } : { title: "", description: "", color: SLOT_COLORS[i] });
  };

  const saveEdit = async (i) => {
    if (!userId) return;
    const mod = modules[i];
    if (mod) {
      await updateFocusModule(mod.id, { ...editVal, slot: i + 1 });
      const arr = [...modules]; arr[i] = { ...mod, ...editVal }; setModules(arr);
    } else {
      const created = await createFocusModule(userId, { ...editVal, slot: i + 1 });
      const arr = [...modules]; arr[i] = created; setModules(arr);
    }
    setEditing(null);
  };

  const clearSlot = async (i) => {
    const mod = modules[i];
    if (mod) await deleteFocusModule(mod.id);
    const arr = [...modules]; arr[i] = null; setModules(arr);
    if (editing === i) setEditing(null);
  };

  return (
    <div className="bg-white border border-[#E8E8E0] rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-[#E85D26] rounded-full" />
        <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase">Aktuelle Fokus-Module</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {modules.map((mod, i) => (
          <div key={i} className="relative group">
            {editing === i ? (
              <div className="border-2 border-[#E85D26] rounded-xl p-3 space-y-2">
                <input
                  className="w-full border border-[#E8E8E0] rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none bg-[#F5F5F0]"
                  placeholder="Titel..."
                  value={editVal.title}
                  onChange={e => setEditVal({ ...editVal, title: e.target.value })}
                  autoFocus
                />
                <input
                  className="w-full border border-[#E8E8E0] rounded-lg px-2 py-1.5 text-xs focus:outline-none bg-[#F5F5F0]"
                  placeholder="Beschreibung..."
                  value={editVal.description}
                  onChange={e => setEditVal({ ...editVal, description: e.target.value })}
                />
                <div className="flex gap-1 justify-end">
                  <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-[#F5F5F0]"><X className="w-3.5 h-3.5 text-[#8A8A80]" /></button>
                  <button onClick={() => saveEdit(i)} className="p-1 rounded bg-[#E85D26] text-white"><Check className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ) : mod ? (
              <div className="rounded-xl p-4 h-full" style={{ background: `${mod.color || SLOT_COLORS[i]}18`, borderLeft: `3px solid ${mod.color || SLOT_COLORS[i]}` }}>
                <p className="font-bold text-[#1A1A1A] text-sm leading-tight">{mod.title}</p>
                {mod.description && <p className="text-[11px] text-[#8A8A80] mt-1">{mod.description}</p>}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                  <button onClick={() => startEdit(i, mod)} className="p-1 rounded bg-white shadow"><Pencil className="w-3 h-3 text-[#8A8A80]" /></button>
                  <button onClick={() => clearSlot(i)} className="p-1 rounded bg-white shadow"><X className="w-3 h-3 text-red-400" /></button>
                </div>
              </div>
            ) : (
              <button onClick={() => startEdit(i, null)}
                className="w-full h-full min-h-[80px] border-2 border-dashed border-[#E8E8E0] rounded-xl flex flex-col items-center justify-center gap-1 hover:border-[#E85D26] transition-colors">
                <Plus className="w-4 h-4 text-[#C0C0B8]" />
                <span className="text-[10px] font-bold text-[#C0C0B8] uppercase tracking-wider">Modul {i + 1}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Mood() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Alle");
  const [form, setForm] = useState({
    mood: "",
    energy: "",
    sleep: "",
    stress: "",
    emotionTags: [],
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const loadEntries = async () => {
    if (!user?.uid) return;
    const e = await getMoodEntries(user.uid);
    setEntries(e);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, [user?.uid]);

  const createEntry = async () => {
    if (!form.mood || !user?.uid) return;
    const moodScore = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
    const tags = [];
    if (form.energy) tags.push(`energy:${form.energy}`);
    if (form.sleep) tags.push(`sleep:${form.sleep}`);
    if (form.stress) tags.push(`stress:${form.stress}`);
    form.emotionTags.forEach((t) => tags.push(`emotion:${t}`));
    const created = await createMoodEntry(user.uid, {
      mood: form.mood,
      mood_score: moodScore[form.mood],
      note: form.note,
      date: form.date,
      energy: form.energy,
      sleep: form.sleep,
      stress: form.stress,
      emotion_tags: form.emotionTags,
    });
    if (created) {
      const withTags = { ...created, tags };
      setEntries((prev) => [withTags, ...prev]);
      setForm({ mood: "", energy: "", sleep: "", stress: "", emotionTags: [], note: "", date: new Date().toISOString().slice(0, 10) });
      setShowForm(false);
    }
  };

  const getTag = (entry, prefix) => {
    if (entry.tags) {
      const t = entry.tags.find((x) => x.startsWith(prefix + ":"));
      return t ? t.split(":")[1] : null;
    }
    if (prefix === "energy") return entry.energy;
    if (prefix === "sleep") return entry.sleep;
    if (prefix === "stress") return entry.stress;
    return null;
  };

  const avgScore = entries.length
    ? (entries.reduce((s, e) => s + (e.mood_score || 3), 0) / entries.length).toFixed(1)
    : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#E85D26] rounded-full" />
            <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">TRACK</span>
          </div>
          <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">MOOD TRACKER</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="accent-btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> LOG MOOD
        </button>
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-[#E8E8E0] rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-[#1A1A1A]">{entries.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A80]">Einträge</div>
          </div>
          <div className="bg-white border border-[#E8E8E0] rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-[#E85D26]">{avgScore}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A80]">Ø Score</div>
          </div>
          <div className="bg-white border border-[#E8E8E0] rounded-xl p-4 text-center">
            <div className="text-2xl">{entries[0] ? moodMap[entries[0].mood]?.emoji : "—"}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A80]">Heute</div>
          </div>
        </div>
      )}

      {/* Focus Modules */}
      <FocusModules userId={user?.uid} />

      {/* Gefühls-Tags + Notizen – immer sichtbar */}
      <div className="bg-white border border-[#E8E8E0] rounded-2xl p-5 mb-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#E85D26] rounded-full" />
            <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase">Gefühls-Tags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map(tag => (
              <div key={tag.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E8E0] bg-[#F5F5F0] text-xs font-bold text-[#8A8A80]">
                <span>{tag.emoji}</span>{tag.key}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase mb-3">Notizen</h2>
          <textarea
            className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0] resize-none h-24"
            placeholder="Gedanken festhalten..."
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />
        </div>
      </div>

      {/* Log Form */}
      {showForm && (
        <div className="mb-6 space-y-3">
          <TileGroup title="Stimmung" items={MOOD_ITEMS} selected={form.mood} onSelect={v => setForm({ ...form, mood: v })} />
          <TileGroup title="Energie" items={ENERGY_ITEMS} selected={form.energy} onSelect={v => setForm({ ...form, energy: v })} />
          <TileGroup title="Schlaf" items={SLEEP_ITEMS} selected={form.sleep} onSelect={v => setForm({ ...form, sleep: v })} />
          <TileGroup title="Stress" items={STRESS_ITEMS} selected={form.stress} onSelect={v => setForm({ ...form, stress: v })} />

          {/* Gefühls-Tags auswählbar */}
          <div className="bg-white border border-[#E8E8E0] rounded-2xl p-5">
            <h3 className="font-black text-[#1A1A1A] text-sm mb-4 tracking-wide">Gefühls-Tags</h3>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAGS.map(tag => {
                const isSelected = form.emotionTags.includes(tag.key);
                return (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      emotionTags: isSelected ? form.emotionTags.filter(t => t !== tag.key) : [...form.emotionTags, tag.key],
                    })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isSelected ? "bg-[#FEF0EB] border-[#E85D26] text-[#E85D26]" : "border-[#E8E8E0] bg-[#F5F5F0] text-[#8A8A80] hover:border-[#E85D26]"}`}
                  >
                    <span>{tag.emoji}</span>{tag.key}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#E8E8E0] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <input type="date" className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-[#F5F5F0]"
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-[#8A8A80] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F0] transition-colors uppercase tracking-wider">Abbrechen</button>
                <button onClick={createEntry} className="accent-btn" disabled={!form.mood}>SPEICHERN</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      {entries.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-[#8A8A80]" />
            <span className="text-xs font-bold text-[#8A8A80] uppercase tracking-wider">Filter</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Alle", ...EMOTION_TAGS.map(t => t.key)].map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${filter === f ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#E8E8E0] text-[#8A8A80] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"}`}>
                {f !== "Alle" && <span>{EMOTION_TAGS.find(t => t.key === f)?.emoji}</span>}
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E8E0] rounded-xl">
          <p className="text-3xl mb-3">😐</p>
          <p className="font-bold text-[#8A8A80] uppercase tracking-wider text-sm">Noch keine Einträge</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.filter((entry) => {
            if (filter === "Alle") return true;
            return (entry.tags || []).includes(`emotion:${filter}`) || (entry.emotion_tags || []).includes(filter);
          }).map((entry) => {
            const m = moodMap[entry.mood];
            const energyVal = getTag(entry, "energy");
            const sleepVal = getTag(entry, "sleep");
            const stressVal = getTag(entry, "stress");
            return (
              <div key={entry.id} className="bg-white border border-[#E8E8E0] rounded-xl px-5 py-4 flex items-center gap-4 hover:border-[#1A1A1A] transition-all">
                <span className="text-3xl flex-shrink-0">{m?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-bold text-sm text-[#1A1A1A]">{m?.label}</span>
                    <span className="text-[10px] font-bold text-[#8A8A80] uppercase tracking-wider">
                      {new Date(entry.date).toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {energyVal && <span className="text-[10px] text-[#8A8A80]">⚡ Energie {ENERGY_ITEMS[Number(energyVal)-1]?.label}</span>}
                    {sleepVal && <span className="text-[10px] text-[#8A8A80]">🛏️ Schlaf {SLEEP_ITEMS[Number(sleepVal)-1]?.label}</span>}
                    {stressVal && <span className="text-[10px] text-[#8A8A80]">🧠 Stress {STRESS_ITEMS[Number(stressVal)-1]?.label}</span>}
                  </div>
                  {/* Emotion tags on entry */}
                  {(() => {
                    const emotionKeys = (entry.tags || []).filter((t) => t.startsWith("emotion:")).map((t) => t.replace("emotion:", ""));
                    const keys = emotionKeys.length ? emotionKeys : (entry.emotion_tags || []);
                    if (keys.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {keys.map((key) => {
                          const tag = EMOTION_TAGS.find((e) => e.key === key);
                          return (
                            <span key={key} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#F5F5F0] border border-[#E8E8E0] text-[10px] font-bold text-[#8A8A80]">
                              {tag?.emoji} {key}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {entry.note && <p className="text-xs text-[#8A8A80] mt-1">{entry.note}</p>}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FEF0EB] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-[#E85D26]">{entry.mood_score}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mood Calendar */}
      {!loading && <MoodCalendar entries={entries} />}
    </div>
  );
}