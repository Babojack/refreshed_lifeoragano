import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/firestoreService";
import { Plus, Target, Trash2, Star } from "lucide-react";
import CardDetailModal from "@/components/CardDetailModal";

const statusColor = {
  active: "bg-green-100 text-green-600",
  completed: "bg-blue-100 text-blue-600",
  paused: "bg-gray-100 text-gray-500",
};

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    target_date: "",
    progress: 0,
    status: "active",
  });

  const loadGoals = async () => {
    if (!user?.uid) return;
    const g = await getGoals(user.uid);
    setGoals(g);
    setLoading(false);
  };

  useEffect(() => {
    loadGoals();
  }, [user?.uid]);

  const createGoalHandler = async () => {
    if (!form.title.trim() || !user?.uid) return;
    const created = await createGoal(user.uid, { ...form, progress: Number(form.progress) });
    if (created) {
      setGoals((prev) => [created, ...prev]);
      setForm({
        title: "",
        description: "",
        category: "",
        target_date: "",
        progress: 0,
        status: "active",
      });
      setShowForm(false);
    }
  };

  const updateProgress = async (id, progress) => {
    await updateGoal(id, { progress: Number(progress) });
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress: Number(progress) } : g)));
  };

  const toggleStatus = async (id, current) => {
    const next =
      current === "active" ? "paused" : current === "paused" ? "active" : "completed";
    await updateGoal(id, { status: next });
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, status: next } : g)));
  };

  const deleteGoalHandler = async (id) => {
    await deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleFavorite = async (e, goal) => {
    e.stopPropagation();
    await updateGoal(goal.id, { is_favorite: !goal.is_favorite });
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, is_favorite: !g.is_favorite } : g)));
  };

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#E85D26] rounded-full"></div>
              <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">ACHIEVE</span>
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">GOALS</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="accent-btn flex items-center gap-2">
            <Plus className="w-4 h-4" /> NEW GOAL
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-[#E8E8E0] rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase text-sm tracking-wider">Create Goal</h3>
            <div className="space-y-3">
              <input
                className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
                placeholder="Goal title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0] resize-none h-20"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-[#F5F5F0]"
                  placeholder="Category (e.g. Health, Career)"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <input
                  type="date"
                  className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-[#F5F5F0]"
                  value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#8A8A80] uppercase whitespace-nowrap">Start %:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-[#F5F5F0]"
                    value={form.progress}
                    onChange={(e) => setForm({ ...form, progress: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#8A8A80] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F0] transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button onClick={createGoalHandler} className="accent-btn">
                  CREATE GOAL
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E8E8E0] rounded-xl">
            <Target className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-[#8A8A80] uppercase tracking-wider text-sm">No goals yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white border border-[#E8E8E0] rounded-xl overflow-hidden hover:border-[#1A1A1A] transition-all group cursor-pointer"
                onClick={() => setSelectedGoal(goal)}
              >
                {goal.cover_image && (
                  <img src={goal.cover_image} alt="cover" className="w-full h-32 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1A1A1A] text-base">{goal.title}</h3>
                      {goal.category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E85D26]">
                          {goal.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${statusColor[goal.status]}`}
                      >
                        {goal.status}
                      </span>
                      <button onClick={(e) => toggleFavorite(e, goal)} className="p-1 transition-all">
                        <Star
                          className={`w-3.5 h-3.5 ${goal.is_favorite ? "fill-[#E85D26] text-[#E85D26]" : "text-gray-300 opacity-0 group-hover:opacity-100"}`}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoalHandler(goal.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {goal.description && (
                    <p className="text-xs text-[#8A8A80] mb-4 line-clamp-2">{goal.description}</p>
                  )}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-[#8A8A80] uppercase tracking-wider">Progress</span>
                      <span className="text-sm font-black text-[#E85D26]">{goal.progress || 0}%</span>
                    </div>
                    <div className="relative h-2 bg-[#F0F0EB] rounded-full">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#E85D26] rounded-full transition-all"
                        style={{ width: `${goal.progress || 0}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress || 0}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateProgress(goal.id, e.target.value);
                      }}
                      className="w-full mt-2 cursor-pointer accent-[#E85D26]"
                    />
                  </div>
                  {goal.target_date && (
                    <p className="text-[10px] text-[#8A8A80] font-medium">
                      Target: {new Date(goal.target_date).toLocaleDateString("de-DE")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedGoal && (
        <CardDetailModal
          item={selectedGoal}
          parentType="goal"
          onClose={() => setSelectedGoal(null)}
          onUpdate={(updated) => {
            setSelectedGoal(updated);
            setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
          }}
        />
      )}
    </>
  );
}
