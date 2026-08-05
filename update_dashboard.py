import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    text = f.read()

# Add import for googleSheets
import_statement = "import { exportToGoogleSheets } from '../lib/googleSheets';\n"
text = text.replace("import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';", "import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';\n" + import_statement)

# Add state for loading
state_statement = "const [exportMenuOpen, setExportMenuOpen] = useState(false);\n  const [isExporting, setIsExporting] = useState(false);\n"
text = text.replace("const [exportMenuOpen, setExportMenuOpen] = useState(false);", state_statement)

# Add handler for export
handler_statement = """  const handleExportGoogleSheets = async () => {
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
"""
text = text.replace("  const handleExportCSV = () => {", handler_statement + "\n  const handleExportCSV = () => {")

# Add button to dropdown
button_statement = """              <button onClick={handleExportGoogleSheets} className="block w-full text-left px-4 py-3 text-sm text-[#E2E8F0] hover:bg-white/5 transition-colors font-medium border-t border-[#334155]">Exportar Google Sheets</button>"""
text = text.replace("              <button onClick={handleExportPDF}", button_statement + "\n              <button onClick={handleExportPDF}")

# Disable main button if loading
export_btn_replace = """          <button 
            onClick={() => !isExporting && setExportMenuOpen(!exportMenuOpen)}
            className={`flex items-center gap-2 bg-[#334155] text-[#E2E8F0] px-4 py-2.5 rounded-lg hover:bg-[#334155]/80 transition-all font-bold text-xs uppercase tracking-widest ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download size={18} />
            {isExporting ? 'Exportando...' : 'Exportar'}
            <ChevronDown size={14} />
          </button>"""
text = re.sub(r'<button\s+onClick=\{\(\) => setExportMenuOpen\(\!exportMenuOpen\)\}\s+className="flex items-center gap-2 bg-\[#334155\].*?</button>', export_btn_replace, text, flags=re.DOTALL)


with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(text)
