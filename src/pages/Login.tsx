import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.trim() && password.trim()) {
      const success = login(username.trim(), password.trim());
      if (success) {
        navigate('/');
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } else {
      setError('Por favor, preencha usuário e senha.');
    }
  };

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

        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="sr-only">
              Nome de Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none block w-full px-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="Nome de usuário (ex: admin, joao.silva)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none block w-full px-4 py-3 bg-[#050A12] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500/50 transition-colors mt-4"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg mt-2 shadow-[0_0_20px_rgba(8,145,178,0.3)] uppercase tracking-widest text-xs transition-all"
            >
              ENTRAR NO SISTEMA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

