import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    dashboard_content = f.read()

with open('src/pages/Situations.tsx', 'r') as f:
    situations_content = f.read()

# For Dashboard: remove modal, situations table, filters. Keep charts and export.
# The table starts at <div className="bg-[#0F172A] rounded-2xl shadow-2xl border border-[#334155] overflow-hidden">
dashboard_content = re.sub(r'<div className="bg-\[#0F172A\] rounded-2xl shadow-2xl border border-\[#334155\] overflow-hidden">.*?(?=</div>\s*</div>\s*\);\s*};)', '', dashboard_content, flags=re.DOTALL)
dashboard_content = dashboard_content.replace('export const Dashboard = () => {', 'export const Dashboard = () => {')

# For Situations: keep the table, modal, filters, but remove the charts grid.
# The charts grid starts at <DragDropContext onDragEnd={handleDragEnd}> and ends before the table.
situations_content = re.sub(r'<DragDropContext onDragEnd=\{handleDragEnd\}>.*?</DragDropContext>', '', situations_content, flags=re.DOTALL)
situations_content = situations_content.replace('export const Dashboard = () => {', 'export const Situations = () => {')

# Remove exports from Situations (keep in dashboard)
situations_content = re.sub(r'const exportExcel =.*?};', '', situations_content, flags=re.DOTALL)
situations_content = re.sub(r'const exportPDF =.*?};', '', situations_content, flags=re.DOTALL)
# Remove export buttons
situations_content = re.sub(r'<div className="flex gap-2">.*?<button.*?exportExcel.*?</button>.*?<button.*?exportPDF.*?</button>.*?</div>', '', situations_content, flags=re.DOTALL)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(dashboard_content)

with open('src/pages/Situations.tsx', 'w') as f:
    f.write(situations_content)
