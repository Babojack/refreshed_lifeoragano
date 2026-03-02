import { useState, useEffect } from "react";
import { Plus, X, Upload, Pencil, Check } from "lucide-react";

const SEASONS = ["Alle Saisons", "Frühling", "Sommer", "Herbst", "Winter"];
const SEASON_COLORS = {
  "Frühling": "#86efac",
  "Sommer": "#fde68a",
  "Herbst": "#fdba74",
  "Winter": "#bfdbfe",
  "Alle Saisons": "#e9d5ff",
};

export default function ModeModule() {
  const [cards, setCards] = useState([]);
  const [filter, setFilter] = useState("Alle");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", season: "Alle Saisons", notes: "", image_url: "" });
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { setCards([]); }, []);
  const load = () => setCards([]);
  const uploadImage = async () => {};
  const save = async () => { setShowForm(false); setEditId(null); };
  const remove = async () => {};

  const startEdit = (card) => {
    setForm({ title: card.title, season: card.season, notes: card.notes || "", image_url: card.image_url || "" });
    setEditId(card.id); setShowForm(true);
  };

  const filtered = filter === "Alle" ? cards : cards.filter(c => c.season === filter);

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {["Alle", ...SEASONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${filter === s ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "border-[#E8E8E0] text-[#8A8A80] hover:border-[#1A1A1A]"}`}>
            {s}
          </button>
        ))}
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: "", season: "Alle Saisons", notes: "", image_url: "" }); }}
          className="ml-auto accent-btn flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Karte
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#F5F5F0] border border-[#E8E8E0] rounded-xl p-4 mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white font-medium col-span-2"
              placeholder="Titel (z.B. Sommer Kleid)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <select className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
              value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))}>
              {SEASONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-2 border border-[#E8E8E0] rounded-lg px-3 py-2 cursor-pointer bg-white hover:border-[#E85D26] transition-colors">
              {uploading ? <div className="animate-spin w-4 h-4 border-2 border-[#E85D26] border-t-transparent rounded-full" /> : <Upload className="w-4 h-4 text-[#8A8A80]" />}
              <span className="text-xs text-[#8A8A80] font-medium truncate">{form.image_url ? "Bild gewählt ✓" : "Bild hochladen"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
            <textarea className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white col-span-2 h-20 resize-none"
              placeholder="Notizen..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-xs font-bold text-[#8A8A80] hover:text-[#1A1A1A] uppercase tracking-wider">Abbrechen</button>
            <button onClick={save} className="accent-btn flex items-center gap-1.5 px-4 py-2 text-xs"><Check className="w-3.5 h-3.5" /> Speichern</button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#E8E8E0] rounded-xl">
          <p className="text-2xl mb-2">🎨</p>
          <p className="text-xs font-bold text-[#C0C0B8] uppercase tracking-wider">Noch keine Karten</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(card => (
            <div key={card.id} className="bg-white border border-[#E8E8E0] rounded-xl overflow-hidden group hover:border-[#1A1A1A] transition-all">
              <div className="aspect-square bg-[#F5F5F0] relative overflow-hidden">
                {card.image_url
                  ? <img src={card.image_url} alt={card.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
                }
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(card)} className="p-1.5 bg-white rounded-lg shadow"><Pencil className="w-3 h-3 text-[#8A8A80]" /></button>
                  <button onClick={() => remove(card.id)} className="p-1.5 bg-white rounded-lg shadow"><X className="w-3 h-3 text-red-400" /></button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{ background: SEASON_COLORS[card.season] || "#e9d5ff", color: "#1A1A1A" }}>
                    {card.season}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-bold text-sm text-[#1A1A1A]">{card.title}</p>
                {card.notes && <p className="text-[11px] text-[#8A8A80] mt-0.5 line-clamp-2">{card.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}