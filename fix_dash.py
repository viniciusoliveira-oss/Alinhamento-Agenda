import re
with open('src/pages/Dashboard.tsx', 'r') as f:
    text = f.read()

# Remove the "Nova Situação" button block completely
text = re.sub(r'<button[^>]*console\.log\("Not implemented"\).*?</button>', '', text, flags=re.DOTALL)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(text)
