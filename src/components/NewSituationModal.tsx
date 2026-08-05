import React, { useState, useEffect } from 'react';
import { Situation, SituationType } from '../types';
import { useAppContext } from '../context/AppContext';
import { Image as ImageIcon } from 'lucide-react';

interface NewSituationModalProps {
  isOpen: boolean;
  onClose: () => void;
  situation?: Situation | null;
  mode: 'create' | 'view' | 'edit';
}

export const NewSituationModal = ({ isOpen, onClose, situation, mode }: NewSituationModalProps) => {
  const { addSituation, updateSituation, predefinedReasons, periods, currentUser } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [report, setReport] = useState('');
  const [type, setType] = useState<SituationType>('erro');
  const [predefinedReasonId, setPredefinedReasonId] = useState('');
  const [reason, setReason] = useState('');
  const [attendantName, setAttendantName] = useState(currentUser?.name || '');
  const [date, setDate] = useState('');
  const [periodId, setPeriodId] = useState('');

  useEffect(() => {
    if (situation) {
      setTitle(situation.title);
      setReport(situation.report);
      setType(situation.type);
      setPredefinedReasonId(situation.predefinedReasonId || '');
      setReason(situation.reason);
      setAttendantName(situation.attendantName);
      setDate(situation.date);
      setPeriodId(situation.periodId);
    } else {
      if (periods.length > 0) setPeriodId(periods[0].id);
    }
  }, [situation, periods]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    const payload = {
      title, report, type, predefinedReasonId, reason, attendantName, date, periodId
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
      <div className="bg-[#0F172A] rounded-2xl border border-[#334155] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-[#334155] bg-[#050A12]/50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'create' ? 'Nova Situação' : mode === 'edit' ? 'Editar Situação' : 'Visualizar Situação'}
          </h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white transition-colors">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form id="situation-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Título Resumido</label>
              <input readOnly={isReadOnly} required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Tipo</label>
              <select disabled={isReadOnly} value={type} onChange={(e) => { setType(e.target.value as SituationType); setPredefinedReasonId(''); }} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="erro">Erro / Falha</option>
                <option value="cancelamento">Cancelamento</option>
                <option value="reagendamento">Reagendamento</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Motivo Predefinido</label>
              <select disabled={isReadOnly} value={predefinedReasonId} onChange={(e) => setPredefinedReasonId(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="">Outro (escrever abaixo)</option>
                {relevantPredefined.map(pr => (
                  <option key={pr.id} value={pr.id}>{pr.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Técnico / Atendente</label>
              <input readOnly={isReadOnly} required type="text" value={attendantName} onChange={(e) => setAttendantName(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Data da Ocorrência</label>
              <input readOnly={isReadOnly} required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Período</label>
              <select disabled={isReadOnly} value={periodId} onChange={(e) => setPeriodId(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Motivo / Causa (Detalhado)</label>
              <input readOnly={isReadOnly} required type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Relato Completo</label>
              <textarea readOnly={isReadOnly} required rows={4} value={report} onChange={(e) => setReport(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50 resize-none"></textarea>
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-[#334155] bg-[#050A12]/50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-colors">
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button form="situation-form" type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-colors">
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
