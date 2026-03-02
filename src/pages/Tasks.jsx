import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getTasks,
  getProjects,
  createTask,
  updateTask,
  deleteTask,
  getComments,
  createComment,
  deleteComment,
} from "@/lib/firestoreService";
import { Plus, CheckSquare, Circle, Clock, Trash2, Check, X, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import TaskDetailModal from "@/components/TaskDetailModal";

const priorities = ["low", "medium", "high"];
const statuses = ["todo", "in_progress", "done"];
const statusLabel = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const priorityColor = { high: "bg-red-100 text-red-600", medium: "bg-orange-100 text-orange-600", low: "bg-gray-100 text-gray-500" };

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [addingSubtask, setAddingSubtask] = useState(null);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", status: "todo", due_date: "", project_id: "" });

  const loadData = async () => {
    if (!user?.uid) return;
    setError(null);
    try {
      const [t, p] = await Promise.all([getTasks(user.uid), getProjects(user.uid)]);
      const mainTasks = t.filter((task) => !task.project_id?.startsWith("subtask:"));
      const allSubtasks = t.filter((task) => task.project_id?.startsWith("subtask:"));
      const grouped = {};
      allSubtasks.forEach((sub) => {
        const parentId = sub.project_id.replace("subtask:", "");
        if (!grouped[parentId]) grouped[parentId] = [];
        grouped[parentId].push(sub);
      });
      setTasks(mainTasks);
      setSubtasks(grouped);
      setProjects(p);
    } catch (e) {
      setError("Daten konnten nicht geladen werden. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const toggleSubtask = async (sub) => {
    const status = sub.status === "done" ? "todo" : "done";
    await updateTask(sub.id, { status });
    const parentId = sub.project_id.replace("subtask:", "");
    setSubtasks((prev) => ({
      ...prev,
      [parentId]: prev[parentId].map((s) => (s.id === sub.id ? { ...s, status } : s)),
    }));
  };

  const createTaskHandler = async () => {
    if (!form.title.trim() || !user?.uid) return;
    const created = await createTask(user.uid, form);
    if (created) {
      setTasks((prev) => [created, ...prev]);
      setForm({ title: "", description: "", priority: "medium", status: "todo", due_date: "", project_id: "" });
      setShowForm(false);
    }
  };

  const updateStatus = async (id, status) => {
    await updateTask(id, { status });
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const addSubtask = async (taskId) => {
    if (!subtaskInput.trim() || !user?.uid) return;
    const created = await createTask(user.uid, {
      title: subtaskInput,
      status: "todo",
      priority: "medium",
      project_id: `subtask:${taskId}`,
    });
    if (created) {
      setSubtasks((prev) => ({ ...prev, [taskId]: [...(prev[taskId] || []), created] }));
      setSubtaskInput("");
      setAddingSubtask(null);
    }
  };

  const deleteSubtask = async (sub) => {
    const parentId = sub.project_id.replace("subtask:", "");
    await deleteTask(sub.id);
    setSubtasks((prev) => ({ ...prev, [parentId]: prev[parentId].filter((s) => s.id !== sub.id) }));
  };

  const deleteTaskHandler = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleComments = async (taskId) => {
    const isOpen = openComments[taskId];
    setOpenComments((prev) => ({ ...prev, [taskId]: !isOpen }));
    if (!isOpen && !comments[taskId]) {
      const list = await getComments(taskId, "project");
      setComments((prev) => ({ ...prev, [taskId]: list }));
    }
  };

  const postComment = async (taskId) => {
    const text = newComment[taskId]?.trim();
    if (!text || !user?.uid) return;
    const created = await createComment(user.uid, {
      content: text,
      parent_id: taskId,
      parent_type: "project",
      created_by: user.email || user.name || "User",
    });
    if (created) {
      setComments((prev) => ({ ...prev, [taskId]: [created, ...(prev[taskId] || [])] }));
      setNewComment((prev) => ({ ...prev, [taskId]: "" }));
    }
  };

  const deleteCommentHandler = async (taskId, commentId) => {
    await deleteComment(commentId);
    setComments((prev) => ({ ...prev, [taskId]: prev[taskId].filter((c) => c.id !== commentId) }));
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const SubtaskList = ({ taskId }) => {
    const subs = subtasks[taskId] || [];
    if (subs.length === 0) return null;
    const done = subs.filter((s) => s.status === "done").length;
    return (
      <div className="mt-2 space-y-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1 flex-1 bg-[#F0F0EB] rounded-full">
            <div className="h-full bg-[#E85D26] rounded-full transition-all" style={{ width: `${Math.round((done / subs.length) * 100)}%` }} />
          </div>
          <span className="text-[10px] font-bold text-[#E85D26]">{done}/{subs.length}</span>
        </div>
        {subs.map((sub) => (
          <div
            key={sub.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group/sub ${sub.status === "done" ? "bg-green-50" : "bg-[#F5F5F0] hover:bg-[#FEF0EB]"}`}
          >
            <div
              onClick={() => toggleSubtask(sub)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${sub.status === "done" ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-[#E85D26]"}`}
            >
              {sub.status === "done" && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span
              onClick={() => toggleSubtask(sub)}
              className={`text-xs font-medium flex-1 cursor-pointer select-none ${sub.status === "done" ? "line-through text-[#8A8A80]" : "text-[#1A1A1A]"}`}
            >
              {sub.title}
            </span>
            <button onClick={() => deleteSubtask(sub)} className="opacity-0 group-hover/sub:opacity-100 p-0.5 hover:text-red-500 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#E85D26] rounded-full"></div>
            <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">MANAGE</span>
          </div>
          <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">TASKS</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="accent-btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> NEW TASK
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E8E8E0] rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase text-sm tracking-wider">Create Task</h3>
          <div className="space-y-3">
            <input
              className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
              placeholder="Task title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0] resize-none h-20"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none bg-[#F5F5F0]"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <select
                className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none bg-[#F5F5F0]"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
              <input
                type="date"
                className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-[#F5F5F0]"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
              <select
                className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none bg-[#F5F5F0]"
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-[#8A8A80] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F0] transition-colors uppercase tracking-wider">Cancel</button>
              <button onClick={createTaskHandler} className="accent-btn">CREATE TASK</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", ...statuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === s ? "bg-[#1A1A1A] text-white" : "bg-white border border-[#E8E8E0] text-[#8A8A80] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"}`}
          >
            {s === "all" ? "All" : statusLabel[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-4 text-sm text-red-600 font-medium flex items-center justify-between">
          {error}
          <button onClick={loadData} className="text-xs font-bold underline ml-4">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E8E0] rounded-xl">
          <CheckSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-[#8A8A80] uppercase tracking-wider text-sm">No tasks here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              onClick={() => updateStatus(task.id, task.status === "done" ? "todo" : "done")}
              className={`bg-white border rounded-xl px-5 py-4 transition-all group cursor-pointer select-none ${task.status === "done" ? "border-green-200 bg-green-50/40 hover:border-green-300" : "border-[#E8E8E0] hover:border-[#1A1A1A]"}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {task.status === "done" ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 group-hover:text-[#E85D26] transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${task.status === "done" ? "line-through text-[#8A8A80]" : "text-[#1A1A1A]"}`}>{task.title}</p>
                  {task.description && <p className="text-xs text-[#8A8A80] mt-0.5 truncate">{task.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.due_date && (
                    <span className="text-[10px] text-[#8A8A80] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString("de-DE")}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${priorityColor[task.priority]}`}>{task.priority}</span>
                  <select
                    value={task.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); updateStatus(task.id, e.target.value); }}
                    className="text-[10px] font-bold uppercase border border-[#E8E8E0] rounded px-2 py-1 bg-white focus:outline-none cursor-pointer"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{statusLabel[s]}</option>
                    ))}
                  </select>
                  <button onClick={(e) => { e.stopPropagation(); toggleComments(task.id); }} className="p-1 hover:text-[#1A1A1A] transition-all text-[#8A8A80] flex items-center gap-0.5" title="Kommentare">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {comments[task.id]?.length > 0 && <span className="text-[9px] font-bold">{comments[task.id].length}</span>}
                    {openComments[task.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setAddingSubtask(task.id); setSubtaskInput(""); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#E85D26] transition-all" title="Subtask hinzufügen">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteTaskHandler(task.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <SubtaskList taskId={task.id} />
              {addingSubtask === task.id && (
                <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
                    placeholder="Subtask Titel..."
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addSubtask(task.id); if (e.key === "Escape") setAddingSubtask(null); }}
                  />
                  <button onClick={() => addSubtask(task.id)} className="accent-btn px-3 py-1.5 text-xs">ADD</button>
                  <button onClick={() => setAddingSubtask(null)} className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#8A8A80]"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
              {openComments[task.id] && (
                <div className="mt-3 border-t border-[#F0F0EB] pt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                  {(comments[task.id] || []).map((c) => (
                    <div key={c.id} className="flex gap-2 group/c items-start">
                      <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                        {(c.created_by || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 bg-[#F5F5F0] rounded-xl px-3 py-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-[#8A8A80]">{c.created_by}</span>
                          {(c.created_by === user?.email || c.created_by === user?.name) && (
                            <button onClick={() => deleteCommentHandler(task.id, c.id)} className="opacity-0 group-hover/c:opacity-100 hover:text-red-500 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-[#1A1A1A] mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {(comments[task.id] || []).length === 0 && (
                    <p className="text-xs text-[#8A8A80] text-center py-1">Noch keine Kommentare</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <input
                      className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#1A1A1A] bg-white"
                      placeholder="Kommentar schreiben..."
                      value={newComment[task.id] || ""}
                      onChange={(e) => setNewComment((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && postComment(task.id)}
                    />
                    <button onClick={() => postComment(task.id)} className="accent-btn px-3 py-1.5">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            setSelectedTask(updated);
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }}
        />
      )}
    </div>
  );
}
