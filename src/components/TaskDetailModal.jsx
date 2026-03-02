import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getTasks,
  getComments,
  createTask,
  updateTask,
  deleteTask,
  createComment,
  deleteComment,
} from "@/lib/firestoreService";
import { X, Plus, Trash2, CheckSquare, Send, MessageSquare, Check } from "lucide-react";

export default function TaskDetailModal({ task, onClose, onUpdate }) {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const [t, c] = await Promise.all([
        getTasks(user.uid),
        getComments(task.id, "project"),
      ]);
      const subs = (t || []).filter((x) => x.project_id === `subtask:${task.id}`);
      setSubtasks(subs);
      setComments(c || []);
    };
    load();
  }, [user?.uid, task.id]);

  const createSubtask = async () => {
    if (!newSubtask.trim() || !user?.uid) return;
    const created = await createTask(user.uid, {
      title: newSubtask,
      status: "todo",
      priority: "medium",
      project_id: `subtask:${task.id}`,
    });
    if (created) {
      setSubtasks((prev) => [...prev, created]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = async (sub) => {
    const status = sub.status === "done" ? "todo" : "done";
    await updateTask(sub.id, { status });
    setSubtasks((prev) => prev.map((s) => (s.id === sub.id ? { ...s, status } : s)));
  };

  const deleteSubtask = async (id) => {
    await deleteTask(id);
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const postComment = async () => {
    if (!newComment.trim() || !user?.uid) return;
    const created = await createComment(user.uid, {
      content: newComment,
      parent_id: task.id,
      parent_type: "project",
      created_by: user.email || user.name || "User",
    });
    if (created) {
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    }
  };

  const deleteCommentHandler = async (id) => {
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const done = subtasks.filter((s) => s.status === "done").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-[#E8E8E0]">
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A]">{task.title}</h2>
            {task.description && <p className="text-sm text-[#8A8A80] mt-1">{task.description}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors ml-4 flex-shrink-0">
            <X className="w-4 h-4 text-[#8A8A80]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-3">
              Subtasks{subtasks.length > 0 && <span className="text-[#E85D26] ml-2">{done}/{subtasks.length}</span>}
            </h3>
            {subtasks.length > 0 && (
              <div className="h-1.5 bg-[#F0F0EB] rounded-full mb-3">
                <div className="h-full bg-[#E85D26] rounded-full transition-all" style={{ width: `${Math.round((done / subtasks.length) * 100)}%` }} />
              </div>
            )}
            <div className="space-y-1.5 mb-3">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtask(sub)}
                  className={`flex items-center gap-3 group/sub p-3 rounded-xl border cursor-pointer transition-all select-none ${sub.status === "done" ? "bg-green-50 border-green-200 hover:border-green-400" : "bg-[#F5F5F0] border-[#E8E8E0] hover:border-[#E85D26] hover:bg-[#FEF0EB]"}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sub.status === "done" ? "bg-green-500 border-green-500" : "border-gray-300 group-hover/sub:border-[#E85D26]"}`}>
                    {sub.status === "done" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`flex-1 text-sm font-medium ${sub.status === "done" ? "line-through text-[#8A8A80]" : "text-[#1A1A1A]"}`}>{sub.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteSubtask(sub.id); }} className="opacity-0 group-hover/sub:opacity-100 p-0.5 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
                placeholder="Neue Subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createSubtask()}
              />
              <button onClick={createSubtask} className="accent-btn px-3 py-2">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Kommentare ({comments.length})
            </h3>
            <div className="space-y-3 mb-3">
              {comments.length === 0 && <p className="text-xs text-[#8A8A80] text-center py-3">Noch keine Kommentare</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 group/c">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {(c.created_by || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 bg-[#F5F5F0] rounded-xl px-4 py-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-[#8A8A80]">{c.created_by}</span>
                      {(c.created_by === user?.email || c.created_by === user?.name) && (
                        <button onClick={() => deleteCommentHandler(c.id)} className="opacity-0 group-hover/c:opacity-100 hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-[#1A1A1A] mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
                placeholder="Kommentar schreiben..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postComment()}
              />
              <button onClick={postComment} className="accent-btn px-3 py-2">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
