import re
with open('src/pages/Dashboard.tsx', 'r') as f:
    text = f.read()

# find `<div className="bg-[#0F172A] rounded-2xl shadow-2xl border border-[#334155] overflow-hidden">`
start_idx = text.find('<div className="bg-[#0F172A] rounded-2xl shadow-2xl border border-[#334155] overflow-hidden">')
if start_idx != -1:
    end_idx = text.rfind('</div>\n  );\n};')
    if end_idx != -1:
        text = text[:start_idx] + '\n' + text[end_idx:]

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(text)
