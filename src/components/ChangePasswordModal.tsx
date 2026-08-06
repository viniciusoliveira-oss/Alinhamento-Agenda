import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldAlert } from 'lucide-react';

export const ChangePasswordModal = () => {
  const { currentUser, updateUser } = useAppContext();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!currentUser || !currentUser.requiresPasswordChange) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    updateUser(currentUser.id, { 
      password: newPassword, 
      requiresPasswordChange: false 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="max-w-md w-full bg-[#0F172A] p-8 rounded-2xl shadow-2xl border border-rose-500/30 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 border border-rose-500/50">
            <ShieldAlert size={32} className="text-rose-400" />
          </div>
          <h2 className="text-center text-xl font-bold text-[#E2E8F0] tracking-tight">
            Troca de Senha Obrigatória
          </h2>
          <p className="mt-2 text-center text-sm text-[#94A3B8]">
            Por ser seu primeiro acesso, é necessário cadastrar uma nova senha por motivos de segurança.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="new-password" className="sr-only">Nova Senha</label>
              <input
                id="new-password"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Nova Senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirmar Senha</label>
              <input
                id="confirm-password"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Confirme a Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.3)] uppercase tracking-widest text-xs transition-all"
          >
            ATUALIZAR SENHA E CONTINUAR
          </button>
        </form>
      </div>
    </div>
  );
};
