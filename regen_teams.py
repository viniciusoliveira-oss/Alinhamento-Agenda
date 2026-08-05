import re
with open('src/pages/Teams.tsx', 'r') as f:
    text = f.read()

# I will rewrite the whole Teams component
content = """import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Edit2, X, Check, Users as UsersIcon } from 'lucide-react';
import { Team, User } from '../types';

export const Teams = () => {
  const { teams, users, addTeam, updateTeam, deleteTeam, updateUser, currentUser } = useAppContext();
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editManagerId, setEditManagerId] = useState('');

  const [managingMembersTeam, setManagingMembersTeam] = useState<Team | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const myTeam = teams.find(t => t.managerId === currentUser?.id) || teams.find(t => t.id === currentUser?.teamId);
  
  // Gestor/Sup can only see their team. Admin sees all.
  const visibleTeams = isAdmin ? teams : (myTeam ? [myTeam] : []);
  
  const possibleManagers = users.filter(u => u.role === 'supervisor' || u.role === 'gestor' || u.role === 'admin');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && managerId && isAdmin) {
      addTeam({ name, managerId });
      setName('');
      setManagerId('');
    }
  };

  const handleEditClick = (team: Team) => {
    setEditingTeamId(team.id);
    setEditName(team.name);
    setEditManagerId(team.managerId);
  };

  const handleSaveEdit = (id: string) => {
    updateTeam(id, { name: editName, managerId: isAdmin ? editManagerId : undefined });
    setEditingTeamId(null);
  };

  const handleToggleMember = (userId: string, isMember: boolean) => {
    if (!managingMembersTeam) return;
    updateUser(userId, { teamId: isMember ? undefined : managingMembersTeam.id });
  };

  return (
    <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Equipes</h1>
        <p className="text-[#94A3B8] mt-1 text-sm">Gerencie as equipes e seus gestores.</p>
      </div>

      {isAdmin && (
        <div className="bg-[#0F172A] p-6 border border-[#334155] rounded-2xl shadow-2xl">
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">Adicionar Nova Equipe</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Nome da Equipe</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Atendimento N1" className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Gestor Responsável</label>
              <select required value={managerId} onChange={(e) => setManagerId(e.target.value)} className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="">Selecione...</option>
                {possibleManagers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all h-[42px]">
              <Plus size={18} /> Adicionar
            </button>
          </form>
        </div>
      )}

      <div className="bg-[#0F172A] rounded-2xl shadow-2xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#050A12]/80 text-[10px] text-[#94A3B8] uppercase tracking-widest border-b border-[#334155]">
                <th className="px-6 py-4 font-bold">Nome da Equipe</th>
                <th className="px-6 py-4 font-bold">Gestor</th>
                <th className="px-6 py-4 font-bold text-center">Membros</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {visibleTeams.map(t => {
                const manager = users.find(u => u.id === t.managerId);
                const memberCount = users.filter(u => u.teamId === t.id).length;
                const isEditing = editingTeamId === t.id;
                const canEdit = isAdmin || t.id === myTeam?.id;
                
                return (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {isEditing ? (
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-2 py-1 bg-[#050A12] border border-[#334155] rounded text-sm text-[#E2E8F0]" />
                      ) : (
                        t.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#E2E8F0]">
                      {isEditing ? (
                        <select disabled={!isAdmin} value={editManagerId} onChange={(e) => setEditManagerId(e.target.value)} className="w-full px-2 py-1 bg-[#050A12] border border-[#334155] rounded text-sm text-[#E2E8F0] disabled:opacity-50">
                          {possibleManagers.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      ) : (
                        manager ? manager.name : <span className="text-rose-400">Sem gestor</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#94A3B8] text-center">
                      {memberCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingTeamId(null)} className="p-1.5 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/10 rounded-lg transition-colors" title="Cancelar">
                            <X size={16} />
                          </button>
                          <button onClick={() => handleSaveEdit(t.id)} className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Salvar">
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <>
                              <button onClick={() => setManagingMembersTeam(t)} className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Membros">
                                <UsersIcon size={16} />
                              </button>
                              <button onClick={() => handleEditClick(t)} className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Editar">
                                <Edit2 size={16} />
                              </button>
                            </>
                          )}
                          {isAdmin && (
                            <button onClick={() => deleteTeam(t.id)} className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors" title="Excluir">
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

      {managingMembersTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] rounded-2xl w-full max-w-2xl border border-[#334155] shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#050A12]/50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Membros da Equipe</h2>
                <p className="text-sm text-[#94A3B8] mt-1">{managingMembersTeam.name}</p>
              </div>
              <button 
                onClick={() => setManagingMembersTeam(null)}
                className="text-[#94A3B8] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {users.map(u => {
                  const isMember = u.teamId === managingMembersTeam.id;
                  const isOtherTeam = !!u.teamId && !isMember;
                  
                  // Only Admin can see everyone or move anyone. Manager can only see/move users with no team, or currently in their team.
                  if (!isAdmin && isOtherTeam) return null; // hide users from other teams for gestores
                  if (!isAdmin && u.role === 'admin') return null; // hide admins from managers

                  return (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-[#334155] hover:bg-white/5 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#E2E8F0]">{u.name}</span>
                        <span className="text-xs text-[#94A3B8]">{u.role} {isOtherTeam ? `• (Em outra equipe)` : ''}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isMember}
                          onChange={(e) => handleToggleMember(u.id, !e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-[#334155] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t border-[#334155] flex justify-end bg-[#050A12]/50 rounded-b-2xl">
              <button 
                onClick={() => setManagingMembersTeam(null)}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
"""

with open('src/pages/Teams.tsx', 'w') as f:
    f.write(content)
