import { useState, useEffect } from "react";
import { Star, Shirt, ShoppingBag, Calculator, Grid3x3 } from "lucide-react";
import ModeModule from "./ModeModule";
import WishlistModule from "./WishlistModule";
import BudgetModule from "./BudgetModule";

const MODULES = [
  { id: "mode", label: "Mode", icon: Shirt, emoji: "🎨", color: "#8B5CF6", description: "Outfit-Karten nach Saison" },
  { id: "wishlist", label: "Wishlist", icon: ShoppingBag, emoji: "⭐", color: "#E85D26", description: "Was ich mir anschaffen möchte" },
  { id: "budget", label: "Budget", icon: Calculator, emoji: "💰", color: "#10B981", description: "Haushaltskostenrechner" },
];

export default function AndereModule() {
  const [active, setActive] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("andere_module_favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("andere_module_favorites", JSON.stringify(next));
  };

  const activeModule = MODULES.find(m => m.id === active);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-[#E85D26] rounded-full" />
          <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">MODULE</span>
        </div>
        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">ANDERE MODULE</h1>
        <p className="text-[#8A8A80] mt-1 font-medium">Wähle ein Modul aus oder favorisiere es für das Dashboard</p>
      </div>

      {/* Module Overview */}
      {!active && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MODULES.map(mod => {
            const isFav = favorites.includes(mod.id);
            return (
              <div key={mod.id} className="bg-white border border-[#E8E8E0] rounded-2xl p-6 hover:border-[#1A1A1A] transition-all group relative">
                <button
                  onClick={() => toggleFavorite(mod.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors"
                  title={isFav ? "Aus Favoriten entfernen" : "Zum Dashboard hinzufügen"}
                >
                  <Star className={`w-4 h-4 ${isFav ? "fill-[#E85D26] text-[#E85D26]" : "text-[#C0C0B8]"}`} />
                </button>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ background: `${mod.color}18` }}>
                  {mod.emoji}
                </div>
                <h2 className="font-black text-xl text-[#1A1A1A] mb-1">{mod.label}</h2>
                <p className="text-sm text-[#8A8A80] mb-5">{mod.description}</p>
                <button onClick={() => setActive(mod.id)}
                  className="w-full accent-btn text-sm py-2.5 flex items-center justify-center gap-2">
                  <Grid3x3 className="w-4 h-4" /> Öffnen
                </button>
                {isFav && (
                  <div className="mt-3 flex items-center gap-1.5 justify-center">
                    <Star className="w-3 h-3 fill-[#E85D26] text-[#E85D26]" />
                    <span className="text-[10px] font-bold text-[#E85D26] uppercase tracking-wider">Im Dashboard sichtbar</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Module */}
      {active && activeModule && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setActive(null)}
              className="text-[#8A8A80] hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-colors">
              ← Zurück
            </button>
            <div className="w-px h-4 bg-[#E8E8E0]" />
            <span className="text-2xl">{activeModule.emoji}</span>
            <h2 className="font-black text-2xl text-[#1A1A1A]">{activeModule.label}</h2>
          </div>
          {active === "mode" && <ModeModule />}
          {active === "wishlist" && <WishlistModule />}
          {active === "budget" && <BudgetModule />}
        </div>
      )}
    </div>
  );
}