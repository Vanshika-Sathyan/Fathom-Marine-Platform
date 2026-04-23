import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Award, BookOpen, Heart, Brain,
  LogOut, Menu, X, Anchor
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/credentials', icon: Award, label: 'Credentials' },
  { to: '/lms', icon: BookOpen, label: 'Learning' },
  { to: '/wellbeing', icon: Heart, label: 'Wellbeing' },
  { to: '/ai-insights', icon: Brain, label: 'AI Insights' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
          <Anchor className="text-blue-400 shrink-0" size={28} />
          {sidebarOpen && <span className="font-bold text-lg tracking-wide">Fathom Marine</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-blue-400">{user.role}</p>
            </div>
          )}
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-slate-300 font-medium">Fathom Digital Platform</h1>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}