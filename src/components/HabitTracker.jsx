import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getHabits, createHabit, deleteHabit } from "@/lib/firestoreService";
import { Plus, X, Check, Flame } from "lucide-react";

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function TimeSince({ start }) {
  const now = useNow();
  const diff = now - new Date(start);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex gap-3 mt-2 flex-wrap">
      {[
        { val: days, label: "Tage" },
        { val: hours, label: "Std" },
        { val: minutes, label: "Min" },
        { val: seconds, label: "Sek" },
      ].map(({ val, label }) => (
        <div key={label} className="text-center min-w-[44px]">
          <div className="text-2xl font-black text-[#1A1A1A] leading-none tabular-nums">
            {String(val).padStart(2, "0")}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-[#8A8A80] mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function HabitTracker() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", emoji: "🚭", start_date: "", start_time: "00:00", color: "#E85D26" });

  useEffect(() => {
    if (!user?.uid) return;
    getHabits(user.uid).then(setHabits);
  }, [user?.uid]);

  const save = async () => {
    if (!form.title || !form.start_date || !user?.uid) return;
    const isoDate = `${form.start_date}T${form.start_time}:00`;
    const created = await createHabit(user.uid, {
      title: form.title,
      emoji: form.emoji,
      start_date: isoDate,
      start_time: form.start_time,
      color: form.color,
    });
    if (created) {
      setHabits((prev) => [...prev, created]);
      setForm({ title: "", emoji: "🚭", start_date: "", start_time: "00:00", color: "#E85D26" });
      setShowForm(false);
    }
  };

  const remove = async (id) => {
    await deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-3.5 h-3.5 text-[#E85D26]" />
        <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase flex-1">Habit Tracker</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold uppercase tracking-wider text-[#E85D26] hover:text-[#c44d1e] transition-colors"
        >
          {showForm ? "Abbrechen" : "+ Hinzufügen"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E8E8E0] rounded-xl p-4 mb-4 space-y-3">
          <div className="flex gap-2">
            <input
              className="w-12 border border-[#E8E8E0] rounded-lg px-2 py-2 text-center text-lg focus:outline-none bg-[#F5F5F0]"
              value={form.emoji}
              onChange={e => setForm({ ...form, emoji: e.target.value })}
              placeholder="🚭"
            />
            <input
              className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-[#F5F5F0] font-medium"
              placeholder="Titel, z.B. Nicht geraucht"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A80] block mb-1">Startdatum</label>
              <input
                type="date"
                className="w-full border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-[#F5F5F0]"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A80] block mb-1">Uhrzeit</label>
              <input
                type="time"
                className="w-full border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-[#F5F5F0]"
                value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A80] block mb-1">Farbe</label>
              <input
                type="color"
                className="h-10 w-12 border border-[#E8E8E0] rounded-lg cursor-pointer bg-[#F5F5F0]"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
              />
            </div>
          </div>
          <button onClick={save} className="accent-btn flex items-center gap-2 w-full justify-center">
            <Check className="w-4 h-4" /> Speichern
          </button>
        </div>
      )}

      {habits.length === 0 && !showForm && (
        <div className="border-2 border-dashed border-[#E8E8E0] rounded-xl p-6 text-center">
          <p className="text-[11px] font-bold text-[#C0C0B8] uppercase tracking-wider">Noch keine Habits – füge deinen ersten hinzu!</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {habits.map(habit => (
          <div
            key={habit.id}
            className="bg-white border border-[#E8E8E0] rounded-xl p-5 relative group hover:border-[#1A1A1A] transition-all"
            style={{ borderLeft: `4px solid ${habit.color || "#E85D26"}` }}
          >
            <button
              onClick={() => remove(habit.id)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#F5F5F0]"
            >
              <X className="w-3.5 h-3.5 text-[#8A8A80]" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{habit.emoji || "🚭"}</span>
              <p className="font-black text-[#1A1A1A] text-sm uppercase tracking-wide">{habit.title}</p>
            </div>
            <p className="text-[10px] text-[#8A8A80] font-medium">
              Seit {new Date(habit.start_date).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} Uhr
            </p>
            <TimeSince start={habit.start_date} />
          </div>
        ))}
      </div>
    </div>
  );
}