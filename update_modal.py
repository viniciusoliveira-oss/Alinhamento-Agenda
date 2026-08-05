import re

with open('src/components/NewSituationModal.tsx', 'r') as f:
    text = f.read()

# Replace states
states_old = """  const [type, setType] = useState<SituationType>('erro');
  const [predefinedReasonId, setPredefinedReasonId] = useState('');
  const [reason, setReason] = useState('');
  const [attendantName, setAttendantName] = useState(currentUser?.name || '');
  const [date, setDate] = useState('');
  const [periodId, setPeriodId] = useState('');"""
states_new = """  const [type, setType] = useState<SituationType>('erro');
  const [predefinedReasonId, setPredefinedReasonId] = useState('');
  const [reason, setReason] = useState('');
  const [attendantId, setAttendantId] = useState('');
  const [date, setDate] = useState('');
  const [periodId, setPeriodId] = useState('');
  const { users } = useAppContext();"""
text = text.replace(states_old, states_new)

# Update useEffect
effect_old = """      setType(situation.type);
      setPredefinedReasonId(situation.predefinedReasonId || '');
      setReason(situation.reason);
      setAttendantName(situation.attendantName);
      setDate(situation.date);
      setPeriodId(situation.periodId);"""
effect_new = """      setType(situation.type);
      setPredefinedReasonId(situation.predefinedReasonId || '');
      setReason(situation.reason);
      setAttendantId(situation.attendantId || '');
      setDate(situation.date);
      setPeriodId(situation.periodId);"""
text = text.replace(effect_old, effect_new)

# Update handleSubmit
submit_old = """    const payload = {
      title, report, type, predefinedReasonId, reason, attendantName, date, periodId
    };"""
submit_new = """    const attendant = users.find(u => u.id === attendantId);
    
    const payload = {
      title, 
      report, 
      type, 
      predefinedReasonId, 
      reason, 
      attendantId, 
      attendantName: attendant?.name || '', 
      openedById: currentUser?.id || '',
      openedByName: currentUser?.name || '',
      managerId: attendant?.managerId || '',
      teamId: attendant?.teamId || '',
      date, 
      periodId
    };"""
text = text.replace(submit_old, submit_new)

# Update input to select for attendant
input_old = """            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Técnico / Atendente</label>
              <input readOnly={isReadOnly} required type="text" value={attendantName} onChange={(e) => setAttendantName(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50" />
            </div>"""
input_new = """            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-1">Técnico / Atendente</label>
              <select disabled={isReadOnly} required value={attendantId} onChange={(e) => setAttendantId(e.target.value)} className="w-full bg-[#050A12] border border-[#334155] rounded-lg p-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-cyan-500/50">
                <option value="">Selecione o Atendente</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>"""
text = text.replace(input_old, input_new)

with open('src/components/NewSituationModal.tsx', 'w') as f:
    f.write(text)
