import React, { useState, useEffect } from 'react';
import { Situation, SituationType } from '../types';
import { useAppContext } from '../context/AppContext';

interface NewSituationModalProps {
  isOpen: boolean;
  onClose: () => void;
  situation?: Situation | null;
  mode: 'create' | 'view' | 'edit';
}

export const NewSituationModal = ({ isOpen, onClose, situation, mode }: NewSituationModalProps) => {
  const { addSituation, updateSituation, predefinedReasons, periods, currentUser, teams, users } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [attendantName, setAttendantName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [type, setType] = useState<SituationType>('erro');
  const [predefinedReasonId, setPredefinedReasonId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [voalleProtocol, setVoalleProtocol] = useState('');
  const [osReport, setOsReport] = useState('');
  const [situationReport, setSituationReport] = useState('');

  useEffect(() => {
    if (situation) {
      setTitle(situation.title);
      setDate(situation.date);
      setAuthorName(situation.authorName);
      setAttendantName(situation.attendantName);
      setManagerName(situation.managerName);
      setTeamName(situation.teamName);
      setType(situation.type);
      setPredefinedReasonId(situation.predefinedReasonId || '');
      setPeriodId(situation.periodId);
      setVoalleProtocol(situation.voalleProtocol);
      setOsReport(situation.osReport);
      setSituationReport(situation.situationReport);
    } else {
      if (periods.length > 0) setPeriodId(periods[0].id);
      setAuthorName(currentUser?.name || '');
    }
  }, [situation, periods, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    const payload = {
      title, 
      date,
      authorName,
      attendantName,
      managerName,
      teamName,
      type, 
      predefinedReasonId, 
      periodId,
      voalleProtocol,
      osReport,
      situationReport
    };
    
    if (mode === 'create') {
      addSituation(payload);
    } else if (mode === 'edit' && situation) {
      updateSituation(situation.id, payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const relevantPredefined = predefinedReasons.filter(r => r.type === type);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0F172A] rounded-2xl border border-[#334155] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-[#334155] bg-[#050A12]/50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'create' ? 'Nova Situação' : mode === 'edit' ? 'Editar Situação' : 'Visualizar Situação'}
          </h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white transition-colors">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="situation-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Linha 1 */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Título da Situação</label>
              <input readOnly={isReadOnly} required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>

            {/* Linha 2 */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Data da Ocorrência</label>
              <input readOnly={isReadOnly} required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Período da Ocorrência</label>
              <select disabled={isReadOnly} required value={periodId} onChange={(e) => setPeriodId(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Usuário de Registro</label>
              <input readOnly type="text" value={authorName} className="w-full bg-[#050A12]/50 border border-[#334155]/50 rounded-lg p-3 text-sm text-[#94A3B8] focus:outline-none cursor-not-allowed" />
            </div>

            {/* Linha 3 */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Atendente</label>
              <select disabled={isReadOnly} required value={attendantName} onChange={(e) => setAttendantName(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="">Selecione um atendente</option>
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
                {/* Fallback caso o nome já salvo não esteja na lista de atendentes */}
                {attendantName && !users.find(u => u.name === attendantName) && (
                  <option value={attendantName}>{attendantName}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Gestor do Atendente</label>
              <select disabled={isReadOnly} required value={managerName} onChange={(e) => setManagerName(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="">Selecione um gestor</option>
                {users.filter(u => u.role === 'gestor' || u.role === 'supervisor').map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
                {/* Fallback caso o nome já salvo não esteja na lista de gestores */}
                {managerName && !users.find(u => u.name === managerName && (u.role === 'gestor' || u.role === 'supervisor')) && (
                  <option value={managerName}>{managerName}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Equipe</label>
              <select disabled={isReadOnly} required value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="">Selecione uma equipe</option>
                {teams.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
                {/* Fallback caso a equipe já salva não esteja na lista */}
                {teamName && !teams.find(t => t.name === teamName) && (
                  <option value={teamName}>{teamName}</option>
                )}
              </select>
            </div>

            {/* Linha 4 */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Tipo de Situação</label>
              <select disabled={isReadOnly} value={type} onChange={(e) => { setType(e.target.value as SituationType); setPredefinedReasonId(''); }} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="erro">Erro / Falha</option>
                <option value="cancelamento">Cancelamento</option>
                <option value="reagendamento">Reagendamento</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Motivo Pré-definido</label>
              <select disabled={isReadOnly} value={predefinedReasonId} onChange={(e) => setPredefinedReasonId(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="">Outro (especificar no relato)</option>
                {relevantPredefined.map(pr => (
                  <option key={pr.id} value={pr.id}>{pr.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Protocolo Voalle</label>
              <input readOnly={isReadOnly} type="text" value={voalleProtocol} onChange={(e) => setVoalleProtocol(e.target.value)} placeholder="Opcional" className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>

            {/* Protocolo do sistema (só exibe se já existir) */}
            {situation && situation.systemProtocol && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">Protocolo do Sistema</span>
                  <span className="text-sm font-mono text-[#E2E8F0] font-bold">{situation.systemProtocol}</span>
                </div>
              </div>
            )}

            {/* Linha 5: Relatos */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Relato da O.S.</label>
              <textarea readOnly={isReadOnly} required rows={3} value={osReport} onChange={(e) => setOsReport(e.target.value)} placeholder="Descreva os dados da Ordem de Serviço" className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50 resize-none"></textarea>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Relato da Situação Ocorrida</label>
              <textarea readOnly={isReadOnly} required rows={4} value={situationReport} onChange={(e) => setSituationReport(e.target.value)} placeholder="Descreva os detalhes da situação que ocorreu" className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50 resize-none"></textarea>
            </div>

          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-[#334155] bg-[#050A12]/50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-colors">
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button form="situation-form" type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-colors">
              {mode === 'create' ? 'Gerar Protocolo e Salvar' : 'Salvar Alterações'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
