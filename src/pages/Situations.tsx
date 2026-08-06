import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Filter, Eye, Edit2 } from 'lucide-react';
import { Situation, SituationType } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NewSituationModal } from '../components/NewSituationModal';

export const Situations = () => {
  const { situations, predefinedReasons, periods, currentUser } = useAppContext();
  
  const [modalState, setModalState] = useState<{isOpen: boolean, mode: 'create'|'edit'|'view', situation: Situation | null}>({
    isOpen: false,
    mode: 'create',
    situation: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPeriodId, setFilterPeriodId] = useState<string>('');
  const [filterAttendantName, setFilterAttendantName] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredSituations = useMemo(() => {
    return situations.filter(s => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        s.title.toLowerCase().includes(searchLower) || 
        (s.attendantName && s.attendantName.toLowerCase().includes(searchLower)) ||
        (s.teamName && s.teamName.toLowerCase().includes(searchLower)) ||
        (s.systemProtocol && s.systemProtocol.toLowerCase().includes(searchLower)) ||
        (s.voalleProtocol && s.voalleProtocol.toLowerCase().includes(searchLower)) ||
        (s.date && s.date.includes(searchLower));
      const matchesType = filterType ? s.type === filterType : true;
      const matchesPeriod = filterPeriodId ? s.periodId === filterPeriodId : true;
      const matchesAttendant = filterAttendantName ? s.attendantName.toLowerCase().includes(filterAttendantName.toLowerCase()) : true;
      
      return matchesSearch && matchesType && matchesPeriod && matchesAttendant;
    });
  }, [situations, searchTerm, filterType, filterPeriodId, filterAttendantName]);

  const getTypeColor = (type: SituationType) => {
    switch (type) {
      case 'erro': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'cancelamento': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'reagendamento': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="p-8 max-w-[1600px] w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E2E8F0] tracking-tight">Situações</h1>
          <p className="text-[#94A3B8] mt-1 text-sm">Gerencie os relatos e ocorrências da equipe.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setModalState({ isOpen: true, mode: 'create', situation: null })}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2.5 rounded-lg hover:bg-cyan-500 transition-all font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)]"
          >
            <Plus size={18} />
            Nova Situação
          </button>
        </div>
      </div>

      <div className="bg-[#0F172A] rounded-2xl shadow-2xl border border-[#334155] overflow-hidden">
        <div className="p-4 border-b border-[#334155] flex flex-col gap-4 bg-[#050A12]/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input 
                type="text"
                placeholder="Buscar por título, atendente, equipe, protocolo ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#E2E8F0] bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 w-full sm:w-auto justify-center uppercase tracking-widest transition-colors"
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>
          
          {filtersOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#334155]">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Tipo</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                  <option value="">Todos</option>
                  <option value="erro">Erro / Falha</option>
                  <option value="cancelamento">Cancelamento</option>
                  <option value="reagendamento">Reagendamento</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Período</label>
                <select value={filterPeriodId} onChange={(e) => setFilterPeriodId(e.target.value)} className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                  <option value="">Todos</option>
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Atendente</label>
                <input 
                  type="text" 
                  value={filterAttendantName} 
                  onChange={(e) => setFilterAttendantName(e.target.value)} 
                  placeholder="Nome do atendente"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" 
                />
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#050A12]/80 text-[10px] text-[#94A3B8] uppercase tracking-widest border-b border-[#334155]">
                <th className="px-6 py-4 font-bold">Protocolos</th>
                <th className="px-6 py-4 font-bold">Situação</th>
                <th className="px-6 py-4 font-bold">Responsável</th>
                <th className="px-6 py-4 font-bold">Data / Período</th>
                <th className="px-6 py-4 font-bold">Tipo</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredSituations.length > 0 ? (
                filteredSituations.map(s => {
                  const preReason = predefinedReasons.find(r => r.id === s.predefinedReasonId);
                  const periodObj = periods.find(p => p.id === s.periodId);
                  return (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-cyan-400 font-bold mb-1" title="Protocolo do Sistema">
                          {s.systemProtocol || '-'}
                        </div>
                        {s.voalleProtocol && (
                          <div className="text-[10px] font-mono text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded-full inline-block border border-white/10" title="Protocolo Voalle">
                            {s.voalleProtocol}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[250px] whitespace-normal break-words">
                        <div className="font-bold text-[#E2E8F0] text-sm break-words">{s.title}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-1 break-words line-clamp-2" title={s.situationReport}>{s.situationReport}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words">
                        <div className="text-sm text-[#E2E8F0] font-medium break-words">{s.attendantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm text-[#E2E8F0] font-medium">{s.date ? format(new Date(s.date + 'T12:00:00'), 'dd MMM yyyy', { locale: ptBR }) : '-'}</div>
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">{periodObj?.label || 'Desconhecido'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getTypeColor(s.type)}`}>
                          {s.type}
                        </span>
                        <div className="text-[10px] text-[#94A3B8] mt-1 break-words max-w-[150px]">{preReason ? preReason.label : 'Motivo não listado (ver relato)'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setModalState({ isOpen: true, mode: 'view', situation: s })}
                            className="p-1.5 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-white/10 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye size={18} />
                          </button>
                          {currentUser?.role !== 'atendente' && (
                            <button 
                              onClick={() => setModalState({ isOpen: true, mode: 'edit', situation: s })}
                              className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#94A3B8] text-sm">
                    Nenhuma situação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalState.isOpen && (
        <NewSituationModal 
          isOpen={modalState.isOpen} 
          onClose={() => setModalState({ isOpen: false, mode: 'create', situation: null })} 
          situation={modalState.situation}
          mode={modalState.mode}
        />
      )}
    </div>
  );
};
