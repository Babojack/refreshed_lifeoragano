import { useState, useEffect } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["Miete", "Lebensmittel", "Transport", "Freizeit", "Gesundheit", "Kleidung", "Versicherung", "Abonnements", "Sonstiges"];
const CAT_EMOJIS = { Miete: "🏠", Lebensmittel: "🛒", Transport: "🚗", Freizeit: "🎉", Gesundheit: "💊", Kleidung: "👗", Versicherung: "🛡️", Abonnements: "📱", Sonstiges: "📦" };

const fmtMonth = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (d) => d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });

export default function BudgetModule() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", category: "Sonstiges", type: "ausgabe", recurring: true });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  useEffect(() => { setItems([]); }, []);
  const load = () => setItems([]);

  const monthKey = fmtMonth(currentMonth);

  // Items visible for the current month:
  // - recurring items always show
  // - non-recurring items show if their month_key matches (or fallback: created_date month)
  const visibleItems = items.filter(item => {
    if (item.recurring) return true;
    const itemMonth = item.month_key || fmtMonth(new Date(item.created_date));
    return itemMonth === monthKey;
  });

  const recurringItems = items.filter(i => i.recurring);
  const recurringAusgaben = recurringItems.filter(i => i.type === "ausgabe").reduce((s, i) => s + i.amount, 0);
  const recurringEinnahmen = recurringItems.filter(i => i.type === "einnahme").reduce((s, i) => s + i.amount, 0);

  const isPaid = (item) => (item.paid_months || []).includes(monthKey);

  const togglePaid = (item) => {
    const paid_months = item.paid_months || [];
    const next = paid_months.includes(monthKey)
      ? paid_months.filter(m => m !== monthKey)
      : [...paid_months, monthKey];
    // Update state immediately, then sync to backend
    setItems(prev => prev.map(x => x.id === item.id ? { ...x, paid_months: next } : x));
    // Firebase: TODO update
  };

  const toggleRecurring = (item) => {
    const next = !item.recurring;
    const update = { recurring: next };
    if (!next) update.month_key = monthKey;
    setItems(prev => prev.map(x => x.id === item.id ? { ...x, ...update } : x));
    // Firebase: TODO update
  };

  const save = async () => {
    if (!form.name || !form.amount) return;
    const data = { ...form, amount: Number(form.amount), paid_months: [] };
    if (!form.recurring) data.month_key = monthKey; // store which month this one-time item belongs to
    // Firebase: TODO create
    setForm({ name: "", amount: "", category: "Sonstiges", type: "ausgabe", recurring: true });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    // Firebase: TODO delete
    setItems(i => i.filter(x => x.id !== id));
  };

  const paidItems = visibleItems.filter(i => (i.paid_months || []).includes(monthKey));
  const einnahmen = paidItems.filter(i => i.type === "einnahme").reduce((s, i) => s + i.amount, 0);
  const ausgaben = paidItems.filter(i => i.type === "ausgabe").reduce((s, i) => s + i.amount, 0);
  const balance = einnahmen - ausgaben;

  const plannedEinnahmen = visibleItems.filter(i => i.type === "einnahme").reduce((s, i) => s + i.amount, 0);
  const plannedAusgaben = visibleItems.filter(i => i.type === "ausgabe").reduce((s, i) => s + i.amount, 0);

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    total: visibleItems.filter(i => (i.paid_months || []).includes(monthKey) && i.type === "ausgabe" && i.category === cat).reduce((s, i) => s + i.amount, 0),
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  const fmt = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const prevMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div className="space-y-6">
      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-white border border-[#E8E8E0] rounded-xl px-4 py-3">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-[#F5F5F0]"><ChevronLeft className="w-5 h-5 text-[#8A8A80]" /></button>
        <span className="font-black text-[#1A1A1A] uppercase tracking-wider text-sm">{monthLabel(currentMonth)}</span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-[#F5F5F0]"><ChevronRight className="w-5 h-5 text-[#8A8A80]" /></button>
      </div>

      {/* Recurring Overview */}
      {recurringItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-700">Wiederkehrende Posten</h3>
            <span className="ml-auto text-[10px] font-bold text-blue-500">{recurringItems.length} Einträge</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white rounded-lg p-2.5 text-center">
              <div className="text-sm font-black text-green-600">+{fmt(recurringEinnahmen)} €</div>
              <div className="text-[10px] font-bold text-[#8A8A80] uppercase tracking-wider">Einnahmen</div>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center">
              <div className="text-sm font-black text-red-500">-{fmt(recurringAusgaben)} €</div>
              <div className="text-[10px] font-bold text-[#8A8A80] uppercase tracking-wider">Ausgaben</div>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center">
              <div className={`text-sm font-black ${recurringEinnahmen - recurringAusgaben >= 0 ? "text-[#E85D26]" : "text-red-500"}`}>
                {recurringEinnahmen - recurringAusgaben >= 0 ? "+" : ""}{fmt(recurringEinnahmen - recurringAusgaben)} €
              </div>
              <div className="text-[10px] font-bold text-[#8A8A80] uppercase tracking-wider">Netto</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recurringItems.map(item => (
              <span key={item.id} className="flex items-center gap-1 text-[10px] font-bold bg-white border border-blue-100 rounded-full px-2 py-1 text-blue-700">
                {CAT_EMOJIS[item.category]} {item.name}
                <span className={item.type === "einnahme" ? "text-green-500" : "text-red-400"}>
                  {item.type === "einnahme" ? "+" : "-"}{fmt(item.amount)}€
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-xl font-black text-green-700">{fmt(einnahmen)} €</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-green-600">Einnahmen</div>
          {plannedEinnahmen !== einnahmen && (
            <div className="text-[10px] text-green-500 mt-0.5">geplant: {fmt(plannedEinnahmen)} €</div>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <div className="text-xl font-black text-red-600">{fmt(ausgaben)} €</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-red-500">Ausgaben</div>
          {plannedAusgaben !== ausgaben && (
            <div className="text-[10px] text-red-400 mt-0.5">geplant: {fmt(plannedAusgaben)} €</div>
          )}
        </div>
        <div className={`border rounded-xl p-4 text-center ${balance >= 0 ? "bg-[#FEF0EB] border-[#E85D26]" : "bg-red-50 border-red-200"}`}>
          <div className="text-xl font-black" style={{ color: balance >= 0 ? "#E85D26" : "#ef4444" }}>
            {balance >= 0 ? "+" : ""}{fmt(balance)} €
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A80]">Bilanz</div>
          <div className="text-[10px] text-[#8A8A80] mt-0.5">nur erledigte</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {byCategory.length > 0 && (
        <div className="bg-white border border-[#E8E8E0] rounded-xl p-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-3">Ausgaben nach Kategorie (erledigt)</h3>
          <div className="space-y-2">
            {byCategory.map(({ cat, total }) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-base w-6">{CAT_EMOJIS[cat]}</span>
                <span className="text-xs font-bold text-[#1A1A1A] w-28 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-[#F5F5F0] rounded-full">
                  <div className="h-full bg-[#E85D26] rounded-full"
                    style={{ width: ausgaben > 0 ? `${Math.round(total / ausgaben * 100)}%` : "0%" }} />
                </div>
                <span className="text-xs font-black text-[#E85D26] w-20 text-right">{fmt(total)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      <div>
        <div className="flex justify-end mb-3">
          <button onClick={() => setShowForm(!showForm)} className="accent-btn flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Posten
          </button>
        </div>

        {showForm && (
          <div className="bg-[#F5F5F0] border border-[#E8E8E0] rounded-xl p-4 mb-4 space-y-3">
            <div className="text-xs font-bold text-[#8A8A80] uppercase tracking-wider mb-1">
              Neuer Posten für <span className="text-[#1A1A1A]">{monthLabel(currentMonth)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white font-medium col-span-2"
                placeholder="Bezeichnung (z.B. Miete, Netflix...)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input type="number" className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
                placeholder="Betrag (€)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              <select className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
                value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="ausgabe">Ausgabe</option>
                <option value="einnahme">Einnahme</option>
              </select>
              <select className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-white col-span-2"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <label className="flex items-center gap-2 col-span-2 cursor-pointer">
                <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))}
                  className="w-4 h-4 accent-[#E85D26]" />
                <span className="text-sm font-medium text-[#1A1A1A]">Monatlich wiederkehrend</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold text-[#8A8A80] uppercase tracking-wider">Abbrechen</button>
              <button onClick={save} className="accent-btn px-4 py-2 text-xs">Speichern</button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          {visibleItems.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-[#E8E8E0] rounded-xl">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-xs font-bold text-[#C0C0B8] uppercase tracking-wider">Keine Einträge für diesen Monat</p>
            </div>
          )}
          {[...visibleItems.filter(i => !isPaid(i)), ...visibleItems.filter(i => isPaid(i))].map(item => {
            const paid = isPaid(item);
            return (
              <div key={item.id + monthKey}
                onClick={() => togglePaid(item)}
                className={`border rounded-xl px-4 py-3 flex items-center gap-3 group transition-all cursor-pointer select-none
                  ${paid ? "bg-green-50 border-green-200 opacity-80" : "bg-white border-[#E8E8E0] hover:border-[#1A1A1A] hover:bg-[#FAFAFA]"}`}>

                <span className="text-lg w-7">{CAT_EMOJIS[item.category] || "📦"}</span>

                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${paid ? "line-through text-[#8A8A80]" : "text-[#1A1A1A]"}`}>{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-[#8A8A80] font-medium">{item.category}</span>
                    <button onClick={e => { e.stopPropagation(); toggleRecurring(item); }}
                      className={`flex items-center gap-0.5 text-[10px] font-bold rounded-full px-2 py-0.5 transition-all ${item.recurring ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : "bg-[#F5F5F0] text-[#8A8A80] hover:bg-blue-50 hover:text-blue-400"}`}>
                      <RefreshCw className="w-2.5 h-2.5" />
                      {item.recurring ? "monatlich" : "einmalig"}
                    </button>
                    {paid && <span className="text-[10px] font-bold text-green-500">✓ erledigt</span>}
                  </div>
                </div>

                <span className={`text-sm font-black ${item.type === "einnahme" ? "text-green-600" : paid ? "text-green-500" : "text-[#E85D26]"}`}>
                  {item.type === "einnahme" ? "+" : "-"}{fmt(item.amount)} €
                </span>

                <button onClick={e => { e.stopPropagation(); remove(item.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}