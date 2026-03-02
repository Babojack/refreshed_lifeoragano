import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckSquare, Target, FolderKanban, Smile, BookOpen, Rss, Zap, ArrowRight } from "lucide-react";

const features = [
  { icon: CheckSquare, title: "Tasks", desc: "Organize your daily to-dos", page: "Tasks", color: "#E85D26" },
  { icon: Target, title: "Goals", desc: "Track long-term ambitions", page: "Goals", color: "#1A1A1A" },
  { icon: FolderKanban, title: "Projects", desc: "Manage your projects", page: "Projects", color: "#E85D26" },
  { icon: Smile, title: "Mood", desc: "Log how you feel daily", page: "Mood", color: "#1A1A1A" },
  { icon: BookOpen, title: "Diary", desc: "Write your private thoughts", page: "Diary", color: "#E85D26" },
  { icon: Rss, title: "Feed", desc: "Share updates & achievements", page: "Feed", color: "#1A1A1A" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-7 h-7 text-[#E85D26]" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#E85D26] rounded-full"></div>
            <span className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase">Your Personal OS</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-[#1A1A1A] tracking-tighter mb-4">
            LIFE<span className="text-[#E85D26]">HUB</span>
          </h1>

          <p className="text-lg text-[#8A8A80] font-medium max-w-md mx-auto mb-10">
            One place for your tasks, goals, mood, diary, and more. Your personal command center.
          </p>

          <Link to={createPageUrl("Dashboard")}
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-[#E85D26] transition-all text-sm">
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <p className="text-[11px] font-bold tracking-widest text-[#8A8A80] uppercase text-center mb-6">Everything you need</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {features.map(({ icon: Icon, title, desc, page, color }) => (
            <Link key={page} to={createPageUrl(page)}
              className="bg-white border border-[#E8E8E0] rounded-xl p-5 hover:border-[#1A1A1A] transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: color === "#E85D26" ? "#FEF0EB" : "#F0F0F0" }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <h3 className="font-black text-[#1A1A1A] text-sm uppercase tracking-wider mb-1">{title}</h3>
              <p className="text-xs text-[#8A8A80] font-medium">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}