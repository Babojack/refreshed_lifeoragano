import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckSquare,
  Target,
  FolderKanban,
  Smile,
  Rss,
  Zap,
  Menu,
  X,
  Home,
  LayoutGrid
} from "lucide-react";

const navItems = [
  { name: "Dashboard", page: "Dashboard", icon: Home },
  { name: "Tasks", page: "Tasks", icon: CheckSquare },
  { name: "Goals", page: "Goals", icon: Target },
  { name: "Projects", page: "Projects", icon: FolderKanban },
  { name: "Mood", page: "Mood", icon: Smile },
  { name: "Feed", page: "Feed", icon: Rss },
  { name: "Andere Module", page: "AndereModule", icon: LayoutGrid },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        :root {
          --accent: #E85D26;
          --accent-dark: #c44d1e;
          --bg: #F5F5F0;
          --card: #FFFFFF;
          --border: #E8E8E0;
          --text: #1A1A1A;
          --muted: #8A8A80;
        }

        * { box-sizing: border-box; }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          color: var(--muted);
          transition: all 0.15s ease;
          text-decoration: none;
          letter-spacing: 0.02em;
        }
        .nav-link:hover {
          background: #F0F0EB;
          color: var(--text);
        }
        .nav-link.active {
          background: var(--text);
          color: white;
        }
        .nav-link.active svg { color: var(--accent); }

        .accent-btn {
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .accent-btn:hover { background: var(--accent-dark); }

        .card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }

        .grid-bg {
          background-image: 
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8E8E0] flex flex-col
        transform transition-transform duration-200 ease-in-out will-change-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-[#E8E8E0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#E85D26]" />
            </div>
            <span className="font-black text-xl tracking-tight text-[#1A1A1A]">LIFEHUB</span>
          </div>
          <p className="text-[11px] text-[#8A8A80] mt-1 font-medium tracking-widest uppercase">Your Personal OS</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ name, page, icon: Icon }) => (
            <Link
              key={page}
              to={createPageUrl(page)}
              className={`nav-link ${currentPageName === page ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4" />
              {name}
            </Link>
          ))}
        </nav>

        {/* Bottom accent */}
        <div className="p-4 border-t border-[#E8E8E0]">
          <div className="text-[11px] text-[#8A8A80] font-medium tracking-widest uppercase text-center">
            BETA VERSION
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-[#E8E8E0] px-6 py-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#E85D26]" />
            </div>
            <span className="font-black text-lg tracking-tight">LIFEHUB</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}