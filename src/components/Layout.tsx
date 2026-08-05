import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, Settings, LogOut, FileText, Users, Users2 } from 'lucide-react';

export const Layout = () => {
  const { currentUser, logout, roleColors } = useAppContext();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const roleColor = roleColors[currentUser.role] || '#0ea5e9';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/situations', icon: <FileText size={20} />, label: 'Situações' },
    ...(currentUser.role !== 'atendente'
      ? [
          { to: '/users', icon: <Users size={20} />, label: 'Usuários' },
          { to: '/teams', icon: <Users2 size={20} />, label: 'Equipes' },
        ]
      : []),
    ...(currentUser.role === 'admin'
      ? [
          { to: '/settings', icon: <Settings size={20} />, label: 'Configurações' },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen bg-[#050A12] text-[#E2E8F0] font-sans">
      <aside className="w-64 bg-[#0F172A]/80 backdrop-blur-md border-r border-[#334155] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#334155]">
          <h1 className="text-xl font-bold tracking-tight text-[#E2E8F0] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center shrink-0">
              <FileText className="text-white" size={18} />
            </div>
            <span className="truncate" title="Alinhamentos CX - Agenda, equipe">Alinhamentos CX</span>
          </h1>
        </div>
        
        <div className="p-6">
          <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1">Logado como</div>
          <div className="font-bold text-sm text-[#E2E8F0] truncate">{currentUser.name}</div>
          <div className="text-[10px] inline-block mt-2 px-2 py-1 uppercase tracking-wider rounded-full font-bold border" 
               style={{ 
                 color: roleColor, 
                 backgroundColor: `${roleColor}1a`, 
                 borderColor: `${roleColor}33` 
               }}>
            {currentUser.role}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#E2E8F0]'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#334155]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

