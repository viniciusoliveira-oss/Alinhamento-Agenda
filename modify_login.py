import re

with open('src/context/AppContext.tsx', 'r') as f:
    app_context = f.read()

app_context_interface_old = "  login: (username: string) => void;"
app_context_interface_new = "  login: (username: string) => boolean;"
app_context = app_context.replace(app_context_interface_old, app_context_interface_new)

login_old = """  const login = (username: string) => {
    const existingUser = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      setState((prev) => ({ ...prev, currentUser: existingUser }));
    } else {
      // Auto-create for simplicity if not found, as per original logic, but assign atendente
      const role = username.toLowerCase() === 'admin' ? 'admin' : 'atendente';
      const user: User = {
        id: crypto.randomUUID(),
        name: username === 'admin' ? 'Administrador' : username,
        role,
        username,
      };
      setState((prev) => ({ 
        ...prev, 
        currentUser: user,
        users: [...prev.users, user] 
      }));
    }
  };"""

login_new = """  const login = (username: string): boolean => {
    const existingUser = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      setState((prev) => ({ ...prev, currentUser: existingUser }));
      return true;
    }
    return false;
  };"""

app_context = app_context.replace(login_old, login_new)

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(app_context)

with open('src/pages/Login.tsx', 'r') as f:
    login_tsx = f.read()

# Add error state
login_tsx = login_tsx.replace("const [username, setUsername] = useState('');", "const [username, setUsername] = useState('');\n  const [error, setError] = useState('');")

# Update handleSubmit
submit_old = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      navigate('/');
    }
  };"""
submit_new = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.trim()) {
      const success = login(username.trim());
      if (success) {
        navigate('/');
      } else {
        setError('Usuário não encontrado.');
      }
    }
  };"""
login_tsx = login_tsx.replace(submit_old, submit_new)

# Remove the <p> and add error display
p_old = """          <p className="mt-2 text-center text-sm text-[#94A3B8]">
            Digite "admin" para acessar como líder, ou o usuário criado.
          </p>"""
login_tsx = login_tsx.replace(p_old, "")

form_old = """        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>"""
form_new = """        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}"""
login_tsx = login_tsx.replace(form_old, form_new)

with open('src/pages/Login.tsx', 'w') as f:
    f.write(login_tsx)
