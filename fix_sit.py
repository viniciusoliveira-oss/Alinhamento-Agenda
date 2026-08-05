import re
with open('src/pages/Situations.tsx', 'r') as f:
    text = f.read()

# Replace any references to exportMenuOpen etc with just empty strings or delete the buttons
# The export button is in a relative div:
text = re.sub(r'<div className="relative">.*?</div>\s*</div>\s*\)\s*}', '', text, flags=re.DOTALL)
text = re.sub(r'<button[^>]*setExportMenuOpen.*?</button>', '', text, flags=re.DOTALL)
text = re.sub(r'\{exportMenuOpen && \(.*?\)\}', '', text, flags=re.DOTALL)

with open('src/pages/Situations.tsx', 'w') as f:
    f.write(text)
