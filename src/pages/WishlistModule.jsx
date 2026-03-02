import { useState, useEffect } from "react";
import { Plus, X, Upload, Send, Trash2, ExternalLink } from "lucide-react";

const PRIORITY_COLORS = { niedrig: "bg-blue-100 text-blue-700", mittel: "bg-yellow-100 text-yellow-700", hoch: "bg-red-100 text-red-700" };

export default function WishlistModule() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", image_url: "", price: "", link: "", priority: "mittel" });
  const [uploading, setUploading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => { setItems([]); }, []);
  const load = () => setItems([]);
  const uploadImage = async () => {};
  const save = async () => { setShowForm(false); };
  const remove = async (_id) => {};
  const addComment = async (_item) => {};
  const deleteComment = async (_item, _index) => {};

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button onClick={() => setShowForm(!showForm)} className="accent-btn flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Hinzufügen
        </button>
      </div>

      {showForm && (
        <div className="bg-[#F5F5F0] border border-[#E8E8E0] rounded-xl p-4 mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white font-medium col-span-2"
              placeholder="Was möchtest du dir anschaffen?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input type="number" className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
              placeholder="Preis (€)" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            <select className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
              value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="niedrig">Niedrig</option>
              <option value="mittel">Mittel</option>
              <option value="hoch">Hoch</option>
            </select>
            <input className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
              placeholder="Link (optional)" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
            <label className="flex items-center gap-2 border border-[#E8E8E0] rounded-lg px-3 py-2 cursor-pointer bg-white hover:border-[#E85D26] transition-colors">
              {uploading ? <div className="animate-spin w-4 h-4 border-2 border-[#E85D26] border-t-transparent rounded-full" /> : <Upload className="w-4 h-4 text-[#8A8A80]" />}
              <span className="text-xs text-[#8A8A80] font-medium">{form.image_url ? "Bild gewählt ✓" : "Bild"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold text-[#8A8A80] uppercase tracking-wider">Abbrechen</button>
            <button onClick={save} className="accent-btn px-4 py-2 text-xs">Speichern</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#E8E8E0] rounded-xl">
          <p className="text-2xl mb-2">⭐</p>
          <p className="text-xs font-bold text-[#C0C0B8] uppercase tracking-wider">Wishlist ist leer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-[#E8E8E0] rounded-xl overflow-hidden hover:border-[#1A1A1A] transition-all">
              <div className="aspect-video bg-[#F5F5F0] relative overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">⭐</div>
                }
                <button onClick={() => remove(item.id)} className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow opacity-0 hover:opacity-100 group">
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1A1A1A]">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {item.price && <span className="text-sm font-black text-[#E85D26]">{item.price.toLocaleString("de-DE")} €</span>}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[#F5F5F0]"><ExternalLink className="w-3.5 h-3.5 text-[#8A8A80]" /></a>}
                    <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-[#F5F5F0]"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </div>

                {/* Comments */}
                <div className="border-t border-[#E8E8E0] pt-3 mt-3 space-y-1.5">
                  {(item.comments || []).map((c, i) => (
                    <div key={i} className="flex items-start gap-2 group/c">
                      <p className="flex-1 text-xs text-[#8A8A80] bg-[#F5F5F0] rounded-lg px-2.5 py-1.5">{c}</p>
                      <button onClick={() => deleteComment(item, i)} className="opacity-0 group-hover/c:opacity-100 p-1 hover:text-red-500 flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-[#F5F5F0]"
                      placeholder="Kommentar..."
                      value={commentInputs[item.id] || ""}
                      onChange={e => setCommentInputs(c => ({ ...c, [item.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addComment(item)}
                    />
                    <button onClick={() => addComment(item)} className="p-1.5 accent-btn px-2 py-1.5"><Send className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}