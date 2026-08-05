import re

with open('src/pages/Login.tsx', 'r') as f:
    text = f.read()

# Add import for firebase auth things
text = text.replace("import { ShieldCheck, Lock, Mail } from 'lucide-react';", "import { ShieldCheck, Lock, Mail, UserPlus } from 'lucide-react';\nimport { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';\nimport { doc, setDoc } from 'firebase/firestore';\nimport { auth, db } from '../lib/firebase';")

bootstrap_func = """  const handleBootstrap = async () => {
    setIsLoading(true);
    setError('');
    try {
      const email = 'admin@sistema.local';
      const result = await createUserWithEmailAndPassword(auth, email, 'Mudar@123');
      const adminUser = {
        id: result.user.uid,
        uid: result.user.uid,
        name: 'Administrador',
        username: email,
        role: 'admin',
        requirePasswordChange: true
      };
      await setDoc(doc(db, 'users', result.user.uid), adminUser);
      // Wait for AppContext to catch the auth state change
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Administrador já foi criado. Faça login com admin@sistema.local');
      } else {
        setError(err.message || 'Erro ao criar administrador.');
      }
    } finally {
      setIsLoading(false);
    }
  };
"""

text = text.replace("const handleSubmit = async", bootstrap_func + "\n  const handleSubmit = async")

button_code = """          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg mt-2 shadow-[0_0_20px_rgba(8,145,178,0.3)] uppercase tracking-widest text-xs transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processando...' : (isChangingPassword ? 'ALTERAR SENHA' : 'ENTRAR NO SISTEMA')}
            </button>
          </div>
          
          {!isChangingPassword && (
            <div className="pt-4 border-t border-[#334155] mt-6">
              <button
                type="button"
                onClick={handleBootstrap}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-transparent hover:bg-white/5 border border-[#334155] text-[#94A3B8] font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all disabled:opacity-50"
              >
                <UserPlus size={16} /> Inicializar Sistema (Admin)
              </button>
            </div>
          )}"""

text = re.sub(r'<div>\s*<button\s*type="submit"[\s\S]*?</button>\s*</div>', button_code, text)

with open('src/pages/Login.tsx', 'w') as f:
    f.write(text)
