import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  getProjects,
  getTasks,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/firestoreService";
import { uploadImage } from "@/lib/storageService";
import { Plus, FolderKanban, Trash2, Calendar, Star, Upload } from "lucide-react";
import CardDetailModal from "@/components/CardDetailModal";

const COLORS = ["#E85D26", "#1A1A1A", "#3B82F6", "#22c55e", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6"];
const statusColor = { active: "bg-orange-100 text-orange-600", completed: "bg-green-100 text-green-600", archived: "bg-gray-100 text-gray-500" };

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", color: "#E85D26", status: "active", due_date: "", cover_image: "" });
  const [coverUploading, setCoverUploading] = useState(false);

  const loadData = async () => {
    if (!user?.uid) return;
    const [p, t] = await Promise.all([getProjects(user.uid), getTasks(user.uid)]);
    setProjects(p);
    setTasks(t);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const onCoverSelect = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !user?.uid) return;
    setCoverUploading(true);
    try {
      const url = await uploadImage(user.uid, file, "projects");
      if (url) setForm((f) => ({ ...f, cover_image: url }));
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  const createProjectHandler = async () => {
    if (!form.title.trim() || !user?.uid) return;
    const created = await createProject(user.uid, form);
    if (created) {
      setProjects((prev) => [created, ...prev]);
      setForm({ title: "", description: "", color: "#E85D26", status: "active", due_date: "", cover_image: "" });
      setShowForm(false);
    }
  };

  const updateStatus = async (id, status) => {
    await updateProject(id, { status });
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const deleteProjectHandler = async (id) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleFavorite = async (e, project) => {
    e.stopPropagation();
    await updateProject(project.id, { is_favorite: !project.is_favorite });
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_favorite: !p.is_favorite } : p)));
  };

  const getProjectTasks = (projectId) => tasks.filter((t) => t.project_id === projectId);

  return (
    <>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#E85D26] rounded-full"></div>
              <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">ORGANIZE</span>
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">PROJECTS</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="accent-btn flex items-center gap-2">
            <Plus className="w-4 h-4" /> NEW PROJECT
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-[#E8E8E0] rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase text-sm tracking-wider">Create Project</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E8E8E0] bg-[#F5F5F0] hover:bg-[#EBEBE5] text-sm font-medium text-[#1A1A1A]">
                  <input type="file" accept="image/*" className="hidden" onChange={onCoverSelect} disabled={coverUploading} />
                  {coverUploading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-[#E85D26] border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#8A8A80]" />
                  )}
                  {form.cover_image ? "Bild ausgetauscht" : "Cover-Bild hochladen"}
                </label>
                {form.cover_image && (
                  <img src={form.cover_image} alt="Cover" className="w-16 h-16 object-cover rounded-lg" />
                )}
              </div>
              <input
                className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0]"
                placeholder="Project title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0] resize-none h-20"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs font-bold text-[#8A8A80] uppercase tracking-wider mb-1 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-[#1A1A1A] scale-110" : "border-transparent"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <input
                  type="date"
                  className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-[#F5F5F0]"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
                <select
                  className="border border-[#E8E8E0] rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none bg-[#F5F5F0]"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#8A8A80] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F0] transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button onClick={createProjectHandler} className="accent-btn">
                  CREATE PROJECT
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E8E8E0] rounded-xl">
            <FolderKanban className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-[#8A8A80] uppercase tracking-wider text-sm">No projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const ptasks = getProjectTasks(project.id);
              const done = ptasks.filter((t) => t.status === "done").length;
              const pct = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0;
              return (
                <div
                  key={project.id}
                  className="bg-white border border-[#E8E8E0] rounded-xl overflow-hidden hover:border-[#1A1A1A] transition-all group relative cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.cover_image && (
                    <img src={project.cover_image} alt="cover" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-5">
                    <div
                      className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                      style={{ background: project.color || "#E85D26" }}
                    />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pl-2">
                        <h3 className="font-bold text-[#1A1A1A] text-base truncate">{project.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${statusColor[project.status]}`}
                        >
                          {project.status}
                        </span>
                        <button onClick={(e) => toggleFavorite(e, project)} className="p-1 transition-all">
                          <Star
                            className={`w-3.5 h-3.5 ${project.is_favorite ? "fill-[#E85D26] text-[#E85D26]" : "text-gray-300 opacity-0 group-hover:opacity-100"}`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProjectHandler(project.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-xs text-[#8A8A80] mb-4 line-clamp-2 pl-2">{project.description}</p>
                    )}
                    <div className="pl-2">
                      {ptasks.length > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-[#8A8A80] uppercase tracking-wider">
                              {done}/{ptasks.length} Tasks
                            </span>
                            <span
                              className="text-[10px] font-black"
                              style={{ color: project.color || "#E85D26" }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#F0F0EB] rounded-full">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: project.color || "#E85D26",
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {project.due_date && (
                          <span className="text-[10px] text-[#8A8A80] font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.due_date).toLocaleDateString("de-DE")}
                          </span>
                        )}
                        <select
                          value={project.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateStatus(project.id, e.target.value);
                          }}
                          className="text-[10px] font-bold uppercase border border-[#E8E8E0] rounded px-2 py-1 bg-white focus:outline-none cursor-pointer ml-auto"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProject && (
        <CardDetailModal
          item={selectedProject}
          parentType="project"
          onClose={() => setSelectedProject(null)}
          onUpdate={(updated) => {
            setSelectedProject(updated);
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          }}
          updateProject={updateProject}
        />
      )}
    </>
  );
}
