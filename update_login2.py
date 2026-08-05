import re

with open('src/pages/Login.tsx', 'r') as f:
    text = f.read()

submit_old = """    if (email.trim() && password) {
      const success = await login(email.trim(), password);"""

submit_new = """    if (email.trim() && password) {
      const emailToUse = email.includes('@') ? email.trim() : `${email.trim()}@sistema.local`;
      const success = await login(emailToUse, password);"""

text = text.replace(submit_old, submit_new)

with open('src/pages/Login.tsx', 'w') as f:
    f.write(text)
