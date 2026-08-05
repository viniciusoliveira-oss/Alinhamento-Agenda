import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Role, User } from '../types';

export const Users = () => {
  const { users, teams, addUser, updateUser, deleteUser, currentUser } = useAppContext();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>('atendente');
  const [teamId, setTeamId] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>('atendente');
  const [editTeamId, setEditTeamId] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const myTeam = teams.find(t => t.managerId === currentUser?.id) || teams.find(t => t.id === currentUser?.teamId);
  const isManager = currentUser?.role === 'gestor' || currentUser?.role === 'supervisor';

  const visibleUsers = isAdmin ? users : users.filter(u => u.teamId === myTeam?.id || u.id === currentUser?.id);
  const visibleTeams = isAdmin ? teams : (myTeam ? [myTeam] : []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && username && role) {
      addUser({ name, username, role, teamId: isAdmin ? (teamId || undefined) : myTeam?.id });
      setName('');
      setUsername('');
      setRole('atendente');
      setTeamId('');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditRole(user.role);
    setEditTeamId(user.teamId || '');
  };

  const handleSaveEdit = (id: string) => {
    updateUser(id, { name: editName, role: editRole, teamId: editTeamId || undefined });
    setEditingUserId(null);
  };

  return (
    <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Usuários</h1>
        <p className="text-[#94A3B8] mt-1 text-sm">Gerencie os usuários que têm acesso à plataforma.</p>
      </div>

      <div className="bg-[#0F172A] p-6 border border-[#334155] rounded-2xl shadow-2xl">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">Adicionar Novo Usuário</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Nome</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Nome de Usuário</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="login.usuario" className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Perfil</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
              <option value="atendente">Atendente</option>
              {(isAdmin || isManager) && <option value="supervisor">Supervisor</option>}
              {isAdmin && <option value="gestor">Gestor</option>}
              {isAdmin && <option value="admin">Administrador</option>}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Equipe</label>
            <select value={isAdmin ? teamId : (myTeam?.id || '')} disabled={!isAdmin} onChange={(e) => setTeamId(e.target.value)} className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50 disabled:opacity-50">
              {isAdmin && <option value="">Nenhuma</option>}
              {visibleTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all h-[42px]">
            <Plus size={18} /> Adicionar
          </button>
        </form>
      </div>

      <div className="bg-[#0F172A] rounded-2xl shadow-2xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#050A12]/80 text-[10px] text-[#94A3B8] uppercase tracking-widest border-b border-[#334155]">
                <th className="px-6 py-4 font-bold">Nome</th>
                <th className="px-6 py-4 font-bold">Usuário (Login)</th>
                <th className="px-6 py-4 font-bold">Perfil</th>
                <th className="px-6 py-4 font-bold">Equipe</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {visibleUsers.map(u => {
                const team = teams.find(t => t.id === u.teamId);
                const isEditing = editingUserId === u.id;
                const canEdit = isAdmin || (isManager && u.id !== currentUser?.id && u.role !== 'admin' && u.role !== 'gestor'); 
                const canDelete = isAdmin || (isManager && u.id !== currentUser?.id && u.role !== 'admin' && u.role !== 'gestor');
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {isEditing ? (
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-2 py-1 bg-[#050A12] border border-[#334155] rounded text-sm text-[#E2E8F0]" />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#E2E8F0]">{u.username}</td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value as Role)} className="w-full px-2 py-1 bg-[#050A12] border border-[#334155] rounded text-sm text-[#E2E8F0]">
                          <option value="atendente">Atendente</option>
                          <option value="supervisor">Supervisor</option>
                          {isAdmin && <option value="gestor">Gestor</option>}
                          {isAdmin && <option value="admin">Administrador</option>}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[#E2E8F0] border border-white/20">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#94A3B8]">
                      {isEditing ? (
                        <select value={editTeamId} disabled={!isAdmin} onChange={(e) => setEditTeamId(e.target.value)} className="w-full px-2 py-1 bg-[#050A12] border border-[#334155] rounded text-sm text-[#E2E8F0] disabled:opacity-50">
                          {isAdmin && <option value="">Nenhuma</option>}
                          {visibleTeams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      ) : (
                        team ? team.name : '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingUserId(null)} className="p-1.5 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/10 rounded-lg transition-colors" title="Cancelar">
                            <X size={16} />
                          </button>
                          <button onClick={() => handleSaveEdit(u.id)} className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Salvar">
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <button onClick={() => handleEditClick(u)} className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Editar">
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => deleteUser(u.id)} className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors" title="Excluir">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
