import re
with open('src/pages/Settings.tsx', 'r') as f:
    text = f.read()

content = """import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';
import { SituationType, Role } from '../types';

export const Settings = () => {
  const { 
    predefinedReasons, addPredefinedReason, deletePredefinedReason, 
    periods, addPeriod, deletePeriod,
    roleColors, updateRoleColor
  } = useAppContext();
  
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<SituationType>('cancelamento');
  
  const [newPeriod, setNewPeriod] = useState('');

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim()) {
      addPredefinedReason({ label: newLabel.trim(), type: newType });
      setNewLabel('');
    }
  };

  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPeriod.trim()) {
      addPeriod({ label: newPeriod.trim() });
      setNewPeriod('');
    }
  };
  
  const handleColorChange = (role: Role, color: string) => {
    updateRoleColor(role, color);
  };

  const renderReasons = (type: SituationType) => {
    const items = predefinedReasons.filter(r => r.type === type);
    return (
      <div className="bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden mt-4">
        <div className="px-4 py-3 bg-[#050A12]/50 border-b border-[#334155] text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
          Motivos de {type}
        </div>
        <ul className="divide-y divide-[#334155]">
          {items.length > 0 ? (
            items.map(item => (
              <li key={item.id} className="flex justify-between items-center p-4 hover:bg-white/5 transition-colors">
                <span className="text-sm text-[#E2E8F0] font-medium">{item.label}</span>
                <button
                  onClick={() => deletePredefinedReason(item.id)}
                  className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Remover motivo"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))
          ) : (
            <li className="p-4 text-sm text-[#94A3B8] text-center">Nenhum motivo cadastrado.</li>
          )}
        </ul>
      </div>
    );
  };

  const roles: { id: Role, label: string }[] = [
    { id: 'admin', label: 'Administrador' },
    { id: 'gestor', label: 'Gestor' },
    { id: 'supervisor', label: 'Supervisor' },
    { id: 'atendente', label: 'Atendente' },
  ];

  return (
    <div className="p-8 max-w-[1200px] w-full mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="text-[#94A3B8] mt-1 text-sm">Gerencie os motivos predefinidos, períodos e cores da plataforma.</p>
      </div>
      
      <div className="bg-[#0F172A] p-6 border border-[#334155] rounded-2xl shadow-2xl">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">Cores dos Perfis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {roles.map(r => (
            <div key={r.id} className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">{r.label}</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={roleColors[r.id] || '#ffffff'} 
                  onChange={(e) => handleColorChange(r.id, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-[#050A12] border border-[#334155]"
                />
                <div 
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border"
                  style={{ 
                     color: roleColors[r.id], 
                     backgroundColor: `${roleColors[r.id]}1a`, 
                     borderColor: `${roleColors[r.id]}33` 
                  }}
                >
                  {r.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0F172A] p-6 border border-[#334155] rounded-2xl shadow-2xl">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">Adicionar Novo Motivo</h2>
        <form onSubmit={handleAddReason} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as SituationType)}
              className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50"
            >
              <option value="erro">Erro / Falha</option>
              <option value="cancelamento">Cancelamento</option>
              <option value="reagendamento">Reagendamento</option>
            </select>
          </div>
          <div className="flex-[2] w-full">
            <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Descrição do Motivo</label>
            <input
              type="text"
              required
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ex: Cliente ausente"
              className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all h-[42px]"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderReasons('erro')}
        {renderReasons('cancelamento')}
        {renderReasons('reagendamento')}
      </div>

      <div className="bg-[#0F172A] p-6 border border-[#334155] rounded-2xl shadow-2xl mt-8">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">Gerenciar Períodos</h2>
        <form onSubmit={handleAddPeriod} className="flex flex-col sm:flex-row gap-4 items-end mb-6">
          <div className="flex-1 w-full">
            <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Nome do Período</label>
            <input
              type="text"
              required
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              placeholder="Ex: Fim de Semana"
              className="w-full px-3 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all h-[42px]"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </form>

        <div className="bg-[#050A12]/50 border border-[#334155] rounded-xl overflow-hidden">
          <ul className="divide-y divide-[#334155]">
            {periods.length > 0 ? (
              periods.map(period => (
                <li key={period.id} className="flex justify-between items-center p-4 hover:bg-white/5 transition-colors">
                  <span className="text-sm text-[#E2E8F0] font-medium">{period.label}</span>
                  <button
                    onClick={() => deletePeriod(period.id)}
                    className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remover período"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))
            ) : (
              <li className="p-4 text-sm text-[#94A3B8] text-center">Nenhum período cadastrado.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
"""
with open('src/pages/Settings.tsx', 'w') as f:
    f.write(content)
