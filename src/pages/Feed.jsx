import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Heart, Image, Type, Star, Trash2, X, Upload, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";

const postTypes = [
  { key: "text", icon: Type, label: "Text" },
  { key: "image", icon: Image, label: "Image" },
  { key: "status", icon: Star, label: "Status" },
  { key: "achievement", icon: Star, label: "Achievement" },
];

const statusEmojis = ["🔥", "💪", "🎯", "✅", "🚀", "💡", "🌟", "😊", "😤", "🧠", "☕", "🎵"];

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ content: "", image_url: "", status_emoji: "", status_text: "", post_type: "text" });
  const [comments, setComments] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleImageUpload = async () => {};
  const createPost = async () => {};
  const toggleLike = async () => {};
  const deletePost = async () => {};
  const isLiked = () => false;
  const toggleComments = async (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };
  const postComment = async () => {};
  const deleteComment = async () => {};

  const typeColors = {
    text: "bg-gray-100 text-gray-600",
    image: "bg-blue-100 text-blue-600",
    status: "bg-yellow-100 text-yellow-600",
    achievement: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#E85D26] rounded-full"></div>
            <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">SHARE</span>
          </div>
          <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">FEED</h1>
        </div>

      </div>

      {/* Create Post - always visible */}
      <div className="bg-white border border-[#E8E8E0] rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1A1A1A] uppercase text-sm tracking-wider">Create Post</h3>
          </div>

          {/* Post Type Selector */}
          <div className="flex gap-2 mb-4">
            {postTypes.map(({ key, label }) => (
              <button key={key} onClick={() => setForm({ ...form, post_type: key })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${form.post_type === key ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F0] text-[#8A8A80] hover:text-[#1A1A1A]"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Status emoji picker */}
            {(form.post_type === "status" || form.post_type === "achievement") && (
              <div>
                <p className="text-xs font-bold text-[#8A8A80] uppercase tracking-wider mb-2">Emoji</p>
                <div className="flex gap-2 flex-wrap">
                  {statusEmojis.map(e => (
                    <button key={e} onClick={() => setForm({ ...form, status_emoji: e })}
                      className={`text-xl p-1.5 rounded-lg transition-all ${form.status_emoji === e ? "bg-[#1A1A1A]" : "hover:bg-[#F5F5F0]"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea className="w-full border border-[#E8E8E0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-[#F5F5F0] resize-none h-28"
              placeholder={form.post_type === "achievement" ? "Share your achievement..." : form.post_type === "status" ? "What's your status?" : "What's on your mind?"}
              value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />

            {/* Image upload */}
            {(form.post_type === "image" || form.post_type === "text") && (
              <div>
                {form.image_url ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={form.image_url} alt="upload" className="w-full h-48 object-cover" />
                    <button onClick={() => setForm({ ...form, image_url: "" })}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E8E8E0] rounded-xl py-6 cursor-pointer hover:border-[#E85D26] transition-colors">
                    {uploading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-[#E85D26] border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#8A8A80]" />
                        <span className="text-xs font-bold text-[#8A8A80] uppercase tracking-wider">Upload Image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button onClick={createPost} className="accent-btn">POST</button>
            </div>
          </div>
        </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E8E0] rounded-xl">
          <div className="text-5xl mb-3">📢</div>
          <p className="font-bold text-[#8A8A80] uppercase tracking-wider text-sm">Feed wird auf Firebase umgestellt. Bald wieder verfügbar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-[#E8E8E0] rounded-xl overflow-hidden hover:border-[#1A1A1A] transition-all group">
              {/* Post header */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-black text-sm">
                    {post.created_by ? post.created_by[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">{post.created_by || "Anonymous"}</p>
                    <p className="text-[10px] text-[#8A8A80] font-medium">
                      {new Date(post.created_date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${typeColors[post.post_type] || typeColors.text}`}>
                    {post.post_type}
                  </span>
                  {post.created_by === user?.email && (
                    <button onClick={() => deletePost(post.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status badge */}
              {post.status_emoji && (
                <div className="px-5 py-2">
                  <span className="text-2xl">{post.status_emoji}</span>
                </div>
              )}

              {/* Image */}
              {post.image_url && (
                <img src={post.image_url} alt="post" className="w-full max-h-96 object-cover" />
              )}

              {/* Content */}
              {post.content && (
                <div className="px-5 py-3">
                  <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 pt-2 border-t border-[#F0F0EB] flex items-center gap-4 pb-3">
                <button onClick={() => toggleLike(post)}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isLiked(post) ? "text-red-500" : "text-[#8A8A80] hover:text-red-500"}`}>
                  <Heart className={`w-4 h-4 ${isLiked(post) ? "fill-red-500" : ""}`} />
                  {post.likes || 0}
                </button>
                <button onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#8A8A80] hover:text-[#1A1A1A] transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  {comments[post.id]?.length || 0}
                  {openComments[post.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Comments section */}
              {openComments[post.id] && (
                <div className="px-5 pb-4 border-t border-[#F0F0EB] pt-3 space-y-3 bg-[#FAFAF8]">
                  {(comments[post.id] || []).map(c => (
                    <div key={c.id} className="flex gap-2 group/c">
                      <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {c.created_by?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 bg-white border border-[#E8E8E0] rounded-xl px-3 py-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-[#8A8A80]">{c.created_by}</span>
                          {c.created_by === user?.email && (
                            <button onClick={() => deleteComment(post.id, c.id)} className="opacity-0 group-hover/c:opacity-100 hover:text-red-500 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[#1A1A1A] mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {(comments[post.id] || []).length === 0 && (
                    <p className="text-xs text-[#8A8A80] text-center py-1">Noch keine Kommentare</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <input
                      className="flex-1 border border-[#E8E8E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A1A1A] bg-white"
                      placeholder="Kommentar schreiben..."
                      value={newComment[post.id] || ""}
                      onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && postComment(post.id)}
                    />
                    <button onClick={() => postComment(post.id)} className="accent-btn px-3 py-2">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}