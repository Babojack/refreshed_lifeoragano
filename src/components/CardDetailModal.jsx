import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getTasksByProject,
  getTasksByGoal,
  getComments,
  createTask,
  updateTask,
  deleteTask,
  createComment,
  deleteComment,
} from "@/lib/firestoreService";
import { uploadImage } from "@/lib/storageService";
import { X, Plus, Trash2, MessageSquare, CheckSquare, Circle, Send, Paperclip, ExternalLink, Upload } from "lucide-react";

export default function CardDetailModal({ item, parentType, onClose, onUpdate, updateGoal, updateProject }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", due_date: "" });
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const [t, c] = await Promise.all([
          parentType === "project" ? getTasksByProject(user.uid, item.id) : getTasksByGoal(user.uid, item.id),
          getComments(item.id, parentType).catch(() => []),
        ]);
        const mainTasks = (t || []).filter((task) => !task.project_id?.startsWith("subtask:"));
        setTasks(mainTasks);
        setComments(Array.isArray(c) ? c : []);
      } catch (e) {
        console.error("CardDetailModal load", e);
        setError("Daten konnten nicht geladen werden.");
      }
    };
    load();
  }, [user?.uid, item.id, parentType]);

  const createTaskHandler = async () => {
    if (!newTask.title.trim() || !user?.uid) return;
    setError("");
    try {
      const taskData = {
        title: newTask.title,
        status: "todo",
        priority: "medium",
        due_date: newTask.due_date || "",
        project_id: parentType === "project" ? item.id : "",
        goal_id: parentType === "goal" ? item.id : "",
      };
      const created = await createTask(user.uid, taskData);
      if (created) {
        setTasks((prev) => [created, ...prev]);
        setNewTask({ title: "", due_date: "" });
      }
    } catch (e) {
      setError("Aufgabe konnte nicht gespeichert werden. Bitte erneut versuchen.");
      console.error("createTask", e);
    }
  };

  const toggleTask = async (task) => {
    const status = task.status === "done" ? "todo" : "done";
    await updateTask(task.id, { status });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
  };

  const deleteTaskHandler = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const postComment = async () => {
    if (!newComment.trim() || !user?.uid) return;
    setError("");
    try {
      const created = await createComment(user.uid, {
        content: newComment,
        parent_id: item.id,
        parent_type: parentType,
        created_by: user.email || user.displayName || user.name || "User",
      });
      if (created) {
        setComments((prev) => [created, ...prev]);
        setNewComment("");
      }
    } catch (e) {
      setError("Kommentar konnte nicht gespeichert werden. Bitte erneut versuchen.");
      console.error("createComment", e);
    }
  };

  const onCoverSelect = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !user?.uid) return;
    const updater = parentType === "goal" ? updateGoal : updateProject;
    if (!updater) return;
    setCoverUploading(true);
    setError("");
    try {
      const folder = parentType === "goal" ? "goals" : "projects";
      const url = await uploadImage(user.uid, file, folder);
      if (url) {
        await updater(item.id, { cover_image: url });
        onUpdate({ ...item, cover_image: url });
      }
    } catch (err) {
      setError("Bild konnte nicht hochgeladen werden.");
      console.error("cover upload", err);
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  const deleteCommentHandler = async (id) => {
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const fileName = (url) => {
    try { return decodeURIComponent(url.split("/").pop().split("?")[0]); } catch { return "Datei"; }
  };

  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative h-48 bg-[#F5F5F0] rounded-t-2xl overflow-hidden">
          {item.cover_image ? (
            <img src={item.cover_image} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#8A8A80] text-sm font-medium">No cover image</span>
            </div>
          )}
          {(updateGoal || updateProject) && (
            <label className="absolute bottom-3 left-3 bg-white/90 rounded-full p-1.5 hover:bg-white transition-colors cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={onCoverSelect} disabled={coverUploading} />
              {coverUploading ? (
                <span className="block w-4 h-4 animate-spin border-2 border-[#E85D26] border-t-transparent rounded-full" />
              ) : (
                <Upload className="w-4 h-4 text-[#1A1A1A]" />
              )}
            </label>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#1A1A1A]">{item.title}</h2>
            {item.description && <p className="text-sm text-[#8A8A80] mt-1">{item.description}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">
                Tasks <span className="text-[#E85D26]">{done}/{tasks.length}</span>
              </h3>
            </div>
            {tasks.length > 0 && (
              <div className="h-1.5 bg-[#F0F0EB] rounded-full mb-3">
                <div className="h-full bg-[#E85D26] rounded-full" style={{ width: tasks.length ? `${Math.round((done / tasks.length) * 100)}%` : "0%" }} />
              </div>
            )}
            <div className="space-y-1.5 mb-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 group/task p-2 rounded-lg hover:bg-[#F5F5F0]">
                  <button onClick={() => toggleTask(task)}>
                    {task.status === "done" ? <CheckSquare className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-300 hover:text-[#E85D26]" />}
                  </button>
                  <span className={`flex-1 text-sm ${task.status === "done" ? "line-through text-[#8A8A80]" : "text-[#1A1A1A] font-medium"}`}>{task.title}</span>
                  {task.due_date && <span className="text-[10px] text-[#8A8A80]">{new Date(task.due_date).toLocaleDateString("de-DE")}</span>}
                  <button onClick={() => deleteTaskHandler(task.id)} className="opacity-0 group-hover/task:opacity-100 p-0.5 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
                placeholder="Neue Aufgabe..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && createTaskHandler()}
              />
              <input
                type="date"
                className="border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none bg-[#F5F5F0]"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <button onClick={createTaskHandler} className="accent-btn px-3 py-2">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(item.attachments || []).length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-3">Anhänge</h3>
              <div className="space-y-1.5">
                {item.attachments.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[#F5F5F0] rounded-lg">
                    <Paperclip className="w-3.5 h-3.5 text-[#8A8A80] flex-shrink-0" />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-[#1A1A1A] hover:text-[#E85D26] truncate font-medium">{fileName(url)}</a>
                    <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 text-[#8A8A80]" /></a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Kommentare ({comments.length})
            </h3>
            <div className="space-y-3 mb-3">
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
              {comments.length === 0 && <p className="text-xs text-[#8A8A80] text-center py-3">Noch keine Kommentare</p>}
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
