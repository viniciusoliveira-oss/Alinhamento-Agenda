import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Download, ChevronDown, GripHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { exportToGoogleSheets } from '../lib/googleSheets';


export const Dashboard = () => {
  const { situations, currentUser, predefinedReasons, users, teams } = useAppContext();
  
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_widget_order');
    return saved ? JSON.parse(saved) : ['type', 'reason', 'attendant', 'team', 'month'];
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(widgetOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgetOrder(items);
    localStorage.setItem('nexus_widget_order', JSON.stringify(items));
  };

  const currentMonthSituations = useMemo(() => {
    const now = new Date();
    return situations.filter(s => {
      const date = new Date(s.date + 'T12:00:00');
      return isSameMonth(date, now);
    });
  }, [situations]);

  const typeData = useMemo(() => {
    const counts = { erro: 0, cancelamento: 0, reagendamento: 0 };
    currentMonthSituations.forEach(s => {
      if (counts[s.type] !== undefined) counts[s.type]++;
    });
    return [
      { name: 'Erro/Falha', value: counts.erro },
      { name: 'Cancelamento', value: counts.cancelamento },
      { name: 'Reagendamento', value: counts.reagendamento },
    ];
  }, [currentMonthSituations]);

  const reasonData = useMemo(() => {
    const counts: Record<string, number> = {};
    currentMonthSituations.forEach(s => {
      let label = s.reason;
      if (s.predefinedReasonId) {
        const pr = predefinedReasons.find(r => r.id === s.predefinedReasonId);
        if (pr) label = pr.label;
      }
      counts[label] = (counts[label] || 0) + 1;
    });
    const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], idx) => ({ name, value, fill: colors[idx % colors.length] }));
  }, [currentMonthSituations, predefinedReasons]);

  const attendantData = useMemo(() => {
    const counts: Record<string, number> = {};
    currentMonthSituations.forEach(s => {
      counts[s.attendantName] = (counts[s.attendantName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [currentMonthSituations]);

  const teamData = useMemo(() => {
    const counts: Record<string, number> = {};
    currentMonthSituations.forEach(s => {
      const user = users.find(u => u.name.toLowerCase() === s.attendantName.toLowerCase());
      if (user && user.teamId) {
        const team = teams.find(t => t.id === user.teamId);
        if (team) {
          counts[team.name] = (counts[team.name] || 0) + 1;
        }
      } else {
        counts['Sem Equipe'] = (counts['Sem Equipe'] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [currentMonthSituations, users, teams]);

  const monthData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });
    
    const countsByDay: Record<string, number> = {};
    days.forEach(d => {
      countsByDay[format(d, 'yyyy-MM-dd')] = 0;
    });

    currentMonthSituations.forEach(s => {
      if (countsByDay[s.date] !== undefined) {
        countsByDay[s.date]++;
      }
    });

    return days.map(d => ({
      date: format(d, 'dd/MM'),
      count: countsByDay[format(d, 'yyyy-MM-dd')]
    }));
  }, [currentMonthSituations]);

  const handleExportGoogleSheets = async () => {
    setIsExporting(true);
    setExportMenuOpen(false);
    try {
      const data = situations.map(s => [s.date, s.type, s.reason, s.attendantName, s.report]);
      const headers = ['Data', 'Tipo', 'Motivo', 'Atendente', 'Relato'];
      const url = await exportToGoogleSheets(data, headers, "Relatório de Situações - Alinhamentos CX");
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      alert("Erro ao exportar para o Google Sheets.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Tipo,Motivo,Atendente,Relato\n"
      + situations.map(e => `${e.date},${e.type},${e.reason},${e.attendantName},"${e.report.replace(/"/g, '""')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "situacoes.csv");
    document.body.appendChild(link);
    link.click();
    setExportMenuOpen(false);
  };

  const handleExportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(situations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Situações");
    XLSX.writeFile(wb, "situacoes.xlsx");
    setExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Situações", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Data', 'Tipo', 'Motivo', 'Atendente']],
      body: situations.map(s => [s.date, s.type, s.reason, s.attendantName]),
    });
    doc.save('situacoes.pdf');
    setExportMenuOpen(false);
  };

  const getWidgetTitle = (id: string) => {
    switch(id) {
      case 'type': return 'Por Tipo de Situação';
      case 'reason': return 'Por Motivos';
      case 'attendant': return 'Por Atendente';
      case 'team': return 'Por Equipe';
      case 'month': return 'Ocorrências do Mês';
      default: return '';
    }
  };

  const renderWidgetContent = (id: string) => {
    switch(id) {
      case 'type': return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#050A12', borderColor: '#334155', borderRadius: '8px', color: '#E2E8F0' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      );
      case 'reason': return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reasonData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                  {reasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#050A12', borderColor: '#334155', borderRadius: '8px', color: '#E2E8F0' }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#E2E8F0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
      );
      case 'attendant': return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendantData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#050A12', borderColor: '#334155', borderRadius: '8px', color: '#E2E8F0' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      );
      case 'team': return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#050A12', borderColor: '#334155', borderRadius: '8px', color: '#E2E8F0' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      );
      case 'month': return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#050A12', borderColor: '#334155', borderRadius: '8px', color: '#E2E8F0' }} />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
      );
    }
  };

  return (
    <div className="p-8 max-w-[1600px] w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E2E8F0] tracking-tight">Visão Geral</h1>
          <p className="text-[#94A3B8] mt-1 text-sm">Acompanhe as métricas e exporte os relatórios.</p>
        </div>
        
        <div className="flex gap-3 relative">
                    <button 
            onClick={() => !isExporting && setExportMenuOpen(!exportMenuOpen)}
            className={`flex items-center gap-2 bg-[#334155] text-[#E2E8F0] px-4 py-2.5 rounded-lg hover:bg-[#334155]/80 transition-all font-bold text-xs uppercase tracking-widest ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download size={18} />
            {isExporting ? 'Exportando...' : 'Exportar'}
            <ChevronDown size={14} />
          </button>
          {exportMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl z-50 overflow-hidden">
              <button onClick={handleExportCSV} className="block w-full text-left px-4 py-3 text-sm text-[#E2E8F0] hover:bg-white/5 transition-colors font-medium">Exportar CSV</button>
              <button onClick={handleExportXLSX} className="block w-full text-left px-4 py-3 text-sm text-[#E2E8F0] hover:bg-white/5 transition-colors font-medium border-t border-[#334155]">Exportar XLSX</button>
              <button onClick={handleExportGoogleSheets} className="block w-full text-left px-4 py-3 text-sm text-[#E2E8F0] hover:bg-white/5 transition-colors font-medium border-t border-[#334155]">Exportar Google Sheets</button>
              <button onClick={handleExportPDF} className="block w-full text-left px-4 py-3 text-sm text-[#E2E8F0] hover:bg-white/5 transition-colors font-medium border-t border-[#334155]">Exportar PDF</button>
            </div>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-widgets" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {widgetOrder.map((widgetId, index) => {
                const draggableProps: any = {
                  key: widgetId,
                  draggableId: widgetId,
                  index,
                  isDragDisabled: currentUser?.role !== 'admin'
                };
                return (
                <Draggable {...draggableProps}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-[#0F172A] p-6 rounded-2xl shadow-2xl border ${snapshot.isDragging ? 'border-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.3)] z-50 relative' : 'border-[#334155]'}`}
                      style={provided.draggableProps.style}
                    >
                      <div className="flex items-center justify-between mb-6 group" {...provided.dragHandleProps}>
                        <h3 className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest">{getWidgetTitle(widgetId)}</h3>
                        {currentUser?.role === 'admin' && (
                          <div className={`p-1 rounded-md ${snapshot.isDragging ? 'text-cyan-400' : 'text-[#334155] group-hover:text-cyan-500'} cursor-grab active:cursor-grabbing transition-colors`}>
                            <GripHorizontal size={20} />
                          </div>
                        )}
                      </div>
                      {renderWidgetContent(widgetId)}
                    </div>
                  )}
                </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
