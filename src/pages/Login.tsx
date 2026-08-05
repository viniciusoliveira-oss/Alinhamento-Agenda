import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, Lock, Mail, UserPlus } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login, changePassword, currentUser, isFirebaseReady } = useAppContext();
  const navigate = useNavigate();

  // If already logged in and doesn't require password change, redirect
  React.useEffect(() => {
    if (currentUser && !currentUser.requirePasswordChange) {
      navigate('/');
    } else if (currentUser && currentUser.requirePasswordChange) {
      setIsChangingPassword(true);
    }
  }, [currentUser, navigate]);

    const handleBootstrap = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (isChangingPassword) {
      if (newPassword !== confirmPassword) {
        setError('As senhas não coincidem.');
        setIsLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setIsLoading(false);
        return;
      }
      try {
        await changePassword(newPassword);
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Erro ao alterar a senha.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (email.trim() && password) {
      const emailToUse = email.includes('@') ? email.trim() : `${email.trim()}@sistema.local`;
      const success = await login(emailToUse, password);
      if (success) {
        // Redirection handled by useEffect if password change not required
      } else {
        setError('E-mail ou senha incorretos.');
      }
    }
    setIsLoading(false);
  };

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050A12] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="text-cyan-500 font-bold">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A12] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-[#0F172A] p-10 rounded-2xl shadow-2xl border border-[#334155]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center mb-6">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-center text-2xl font-bold text-[#E2E8F0] tracking-tight">
            Alinhamentos CX <span className="text-cyan-400 font-light block text-sm mt-1">Agenda, equipe</span>
          </h2>
          {isChangingPassword && (
            <p className="mt-2 text-center text-sm text-[#94A3B8]">
              Por segurança, é obrigatório alterar sua senha no primeiro acesso.
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          {!isChangingPassword ? (
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="sr-only">E-mail</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#94A3B8]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 pr-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">Senha</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#94A3B8]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="new-password" className="sr-only">Nova Senha</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#94A3B8]" />
                </div>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="confirm-password" className="sr-only">Confirmar Nova Senha</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#94A3B8]" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

                    <div>
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
          )}
        </form>
      </div>
    </div>
  );
};
