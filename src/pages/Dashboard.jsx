import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getTasks, getGoals, getProjects, getMoodEntries, getFocusModules } from "@/lib/firestoreService";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckSquare, Target, FolderKanban, Smile, Star, Shirt, ShoppingBag, Calculator, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import HabitTracker from "@/components/HabitTracker";
import TelegramManager from "@/components/TelegramManager";

const MODULE_META = {
  mode: { label: "Mode", emoji: "🎨", icon: Shirt, color: "#8B5CF6" },
  wishlist: { label: "Wishlist", emoji: "⭐", icon: ShoppingBag, color: "#E85D26" },
  budget: { label: "Budget", emoji: "💰", icon: Calculator, color: "#10B981" },
};

const moodEmoji = { great: "😄", good: "🙂", okay: "😐", bad: "😕", terrible: "😞" };
const moodColors = { great: "#22c55e", good: "#84cc16", okay: "#eab308", bad: "#f97316", terrible: "#ef4444" };

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [moods, setMoods] = useState([]);
  const [focusModules, setFocusModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState([
    "telegram", "stats", "focus", "favorites", "modules", "habits", "content"
  ]);

  const { user } = useAuth();

  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboard_layout");
    if (savedLayout) {
      try {
        setLayout(JSON.parse(savedLayout));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      getTasks(user.uid),
      getGoals(user.uid),
      getProjects(user.uid),
      getMoodEntries(user.uid, 7),
      getFocusModules(user.uid),
    ]).then(([t, g, p, m, fm]) => {
      const mainTasks = (t || []).filter((task) => !task.project_id?.startsWith("subtask:")).slice(0, 5);
      setTasks(mainTasks);
      setGoals(g || []);
      setProjects(p || []);
      setMoods(m || []);
      setFocusModules(fm || []);
      setLoading(false);
    });
  }, [user?.uid]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const newLayout = Array.from(layout);
    const [moved] = newLayout.splice(source.index, 1);
    newLayout.splice(destination.index, 0, moved);
    
    setLayout(newLayout);
    localStorage.setItem("dashboard_layout", JSON.stringify(newLayout));
  };

  const favoriteGoals = goals.filter(g => g.is_favorite);
  const favoriteProjects = projects.filter(p => p.is_favorite);

  const favoriteModules = (() => {
    try { return JSON.parse(localStorage.getItem("andere_module_favorites") || "[]"); } catch { return []; }
  })();

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const activeGoals = goals.filter(g => g.status === "active").length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const latestMood = moods[0];

  const stats = [
    { label: "TASKS TODAY", value: tasks.length, sub: `${doneTasks} completed`, icon: CheckSquare, page: "Tasks", color: "#E85D26" },
    { label: "ACTIVE GOALS", value: activeGoals, sub: `${goals.length} total`, icon: Target, page: "Goals", color: "#1A1A1A" },
    { label: "PROJECTS", value: activeProjects, sub: "in progress", icon: FolderKanban, page: "Projects", color: "#E85D26" },
    { label: "MOOD TODAY", value: latestMood ? moodEmoji[latestMood.mood] : "—", sub: latestMood?.mood || "not tracked", icon: Smile, page: "Mood", color: "#1A1A1A" },
  ];

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case "telegram":
        return <TelegramManager key="telegram" />;
      case "stats":
        return (
          <div key="stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, sub, icon: Icon, page, color }) => (
              <Link key={page} to={createPageUrl(page)}
                className="bg-white border border-[#E8E8E0] rounded-xl p-5 hover:border-[#1A1A1A] transition-all group block">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color === "#E85D26" ? "#FEF0EB" : "#F0F0F0" }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-[#8A8A80]">{label}</span>
                </div>
                <div className="text-3xl font-black text-[#1A1A1A]">{loading ? "—" : value}</div>
                <div className="text-xs text-[#8A8A80] font-medium mt-1">{sub}</div>
              </Link>
            ))}
          </div>
        );
      case "focus":
        return focusModules.length > 0 ? (
          <div key="focus" className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#E85D26] rounded-full" />
              <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase">Aktuelle Fokus-Module</h2>
              <Link to={createPageUrl("Mood")} className="ml-auto text-[#E85D26] text-xs font-bold uppercase tracking-wider">Bearbeiten →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1,2,3].map(slot => {
                const mod = focusModules.find(m => m.slot === slot);
                if (!mod) return (
                  <div key={slot} className="border-2 border-dashed border-[#E8E8E0] rounded-xl p-4 flex items-center justify-center min-h-[80px]">
                    <span className="text-[10px] font-bold text-[#C0C0B8] uppercase tracking-wider">Leer</span>
                  </div>
                );
                return (
                  <div key={slot} className="rounded-xl p-4" style={{ background: `${mod.color || "#E85D26"}18`, borderLeft: `3px solid ${mod.color || "#E85D26"}` }}>
                    <p className="font-bold text-[#1A1A1A] text-sm">{mod.title}</p>
                    {mod.description && <p className="text-[11px] text-[#8A8A80] mt-1">{mod.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null;
      case "favorites":
        return (favoriteGoals.length > 0 || favoriteProjects.length > 0) ? (
          <div key="favorites" className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-3.5 h-3.5 fill-[#E85D26] text-[#E85D26]" />
              <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase">Favoriten</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProjects.map(p => (
                <Link key={p.id} to={createPageUrl("Projects")} className="bg-white border border-[#E8E8E0] rounded-xl p-4 hover:border-[#1A1A1A] transition-all flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color || "#E85D26" }} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#1A1A1A] truncate">{p.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A80]">Projekt</p>
                  </div>
                </Link>
              ))}
              {favoriteGoals.map(g => (
                <Link key={g.id} to={createPageUrl("Goals")} className="bg-white border border-[#E8E8E0] rounded-xl p-4 hover:border-[#1A1A1A] transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-4 h-4 text-[#E85D26]" />
                    <p className="font-bold text-sm text-[#1A1A1A] truncate flex-1">{g.title}</p>
                  </div>
                  <div className="h-1.5 bg-[#F0F0EB] rounded-full">
                    <div className="h-full bg-[#E85D26] rounded-full" style={{ width: `${g.progress || 0}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A80]">Goal</p>
                    <span className="text-[10px] font-black text-[#E85D26]">{g.progress || 0}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null;
      case "modules":
        return favoriteModules.length > 0 ? (
          <div key="modules" className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#8B5CF6] rounded-full" />
              <h2 className="font-black text-[#1A1A1A] text-sm tracking-widest uppercase flex-1">Andere Module</h2>
              <Link to={createPageUrl("AndereModule")} className="text-[#E85D26] text-xs font-bold uppercase tracking-wider">Alle →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {favoriteModules.map(id => {
                const meta = MODULE_META[id];
                if (!meta) return null;
                return (
                  <Link key={id} to={createPageUrl("AndereModule")}
                    className="bg-white border border-[#E8E8E0] rounded-xl p-5 hover:border-[#1A1A1A] transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${meta.color}18` }}>{meta.emoji}</div>
                    <div>
                      <p className="font-black text-[#1A1A1A]">{meta.label}</p>
                      <p className="text-[10px] font-bold text-[#8A8A80] uppercase tracking-wider mt-0.5">Modul öffnen →</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null;
      case "habits":
        return <HabitTracker key="habits" />;
      case "content":
        return (
          <div key="content" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <div className="bg-white border border-[#E8E8E0] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[#1A1A1A] tracking-tight uppercase text-sm">Recent Tasks</h2>
                <Link to={createPageUrl("Tasks")} className="text-[#E85D26] text-xs font-bold uppercase tracking-wider">View All →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[#8A8A80] text-sm">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5F5F0]">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === "done" ? "bg-green-500" : task.status === "in_progress" ? "bg-[#E85D26]" : "bg-gray-300"}`} />
                      <span className={`text-sm font-medium flex-1 ${task.status === "done" ? "line-through text-[#8A8A80]" : "text-[#1A1A1A]"}`}>{task.title}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${task.priority === "high" ? "bg-red-100 text-red-600" : task.priority === "medium" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Goals */}
            <div className="bg-white border border-[#E8E8E0] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[#1A1A1A] tracking-tight uppercase text-sm">Goals</h2>
                <Link to={createPageUrl("Goals")} className="text-[#E85D26] text-xs font-bold uppercase tracking-wider">View All →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[#8A8A80] text-sm">No goals yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 4).map(goal => (
                    <div key={goal.id} className="p-3 rounded-lg hover:bg-[#F5F5F0]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-[#1A1A1A]">{goal.title}</span>
                        <span className="text-xs font-bold text-[#E85D26]">{goal.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-[#F0F0EB] rounded-full">
                        <div className="h-full bg-[#E85D26] rounded-full transition-all" style={{ width: `${goal.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mood History */}
            <div className="bg-white border border-[#E8E8E0] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[#1A1A1A] tracking-tight uppercase text-sm">Mood History</h2>
                <Link to={createPageUrl("Mood")} className="text-[#E85D26] text-xs font-bold uppercase tracking-wider">View All →</Link>
              </div>
              {loading ? (
                <div className="flex gap-2">{[1,2,3,4,5,6,7].map(i => <div key={i} className="w-10 h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : moods.length === 0 ? (
                <div className="text-center py-8">
                  <Smile className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[#8A8A80] text-sm">No mood entries</p>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {moods.slice(0, 7).map(m => (
                    <div key={m.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#F5F5F0]">
                      <span className="text-2xl">{moodEmoji[m.mood]}</span>
                      <span className="text-[10px] text-[#8A8A80] font-medium">{new Date(m.date).toLocaleDateString("de-DE", { weekday: "short" })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white border border-[#E8E8E0] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[#1A1A1A] tracking-tight uppercase text-sm">Projects</h2>
                <Link to={createPageUrl("Projects")} className="text-[#E85D26] text-xs font-bold uppercase tracking-wider">View All →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderKanban className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[#8A8A80] text-sm">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 4).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5F5F0]">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color || "#E85D26" }} />
                      <span className="text-sm font-medium text-[#1A1A1A] flex-1">{p.title}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${p.status === "completed" ? "bg-green-100 text-green-600" : p.status === "archived" ? "bg-gray-100 text-gray-500" : "bg-orange-100 text-orange-600"}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-[#E85D26] rounded-full"></div>
          <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">BETA VERSION</span>
        </div>
        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">DASHBOARD</h1>
        <p className="text-[#8A8A80] mt-1 font-medium">Your personal command center</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" type="SECTION">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {layout.map((sectionId, index) => (
                <Draggable key={sectionId} draggableId={sectionId} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative group ${snapshot.isDragging ? "opacity-50" : ""}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-5 h-5 text-[#8A8A80]" />
                      </div>
                      {renderSection(sectionId)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}