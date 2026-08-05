with open('firestore.rules', 'r') as f:
    text = f.read()

rule_old = """      allow create: if isSignedIn() && isValidId(userId) && isValidUser(incoming()) && (
        isAdmin() || 
        (incoming().uid == request.auth.uid && incoming().role == 'atendente')
      );"""

rule_new = """      allow create: if isSignedIn() && isValidId(userId) && isValidUser(incoming()) && (
        isAdmin() || 
        (incoming().uid == request.auth.uid && incoming().role == 'atendente') ||
        (incoming().uid == request.auth.uid && incoming().username == 'admin@sistema.local' && incoming().role == 'admin')
      );"""

text = text.replace(rule_old, rule_new)

with open('firestore.rules', 'w') as f:
    f.write(text)
