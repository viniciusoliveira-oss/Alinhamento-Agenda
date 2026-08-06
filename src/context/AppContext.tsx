import React, { createContext, useContext, useEffect, useState } from 'react';
import { initAuth, getAccessToken, googleSignIn, logout as googleLogout } from '../lib/googleAuth';
import { PredefinedReason, Situation, User, Team, Period, Role } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  situations: Situation[];
  predefinedReasons: PredefinedReason[];
  periods: Period[];
  roleColors: Record<Role, string>;
}

interface AppContextType extends AppState {
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  addSituation: (situation: Omit<Situation, 'id' | 'createdAt' | 'systemProtocol'>) => void;
  updateSituation: (id: string, situation: Partial<Situation>) => void;
  addPredefinedReason: (reason: Omit<PredefinedReason, 'id'>) => void;
  deletePredefinedReason: (id: string) => void;
  addPeriod: (period: Omit<Period, 'id'>) => void;
  deletePeriod: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  updateRoleColor: (role: Role, color: string) => void;
}

const defaultState: AppState = {
  currentUser: null,
  users: [
    { id: 'u1', name: 'Administrador', username: 'admin', role: 'admin', password: 'admin', requiresPasswordChange: true },
  ],
  teams: [],
  situations: [],
  predefinedReasons: [
    { id: '1', type: 'cancelamento', label: 'Cliente ausente' },
    { id: '2', type: 'cancelamento', label: 'Endereço incorreto' },
    { id: '3', type: 'reagendamento', label: 'Erro interno' },
    { id: '4', type: 'reagendamento', label: 'Falta de material' },
    { id: '5', type: 'erro', label: 'Falha de Hardware' },
    { id: '6', type: 'erro', label: 'Instabilidade de Rede' },
  ],
  periods: [
    { id: 'p1', label: 'Manhã' },
    { id: 'p2', label: 'Tarde' },
    { id: 'p3', label: 'Noite' },
    { id: 'p4', label: 'Madrugada' },
  ],
  roleColors: {
    admin: '#ef4444', // red
    gestor: '#f59e0b', // amber
    supervisor: '#8b5cf6', // violet
    atendente: '#0ea5e9' // sky
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('appState');
    if (saved) {
      // Need to ensure new state properties exist if migrating from old state
      const parsed = JSON.parse(saved);
      return { 
        ...defaultState, 
        ...parsed,
        users: parsed.users || defaultState.users,
        teams: parsed.teams || defaultState.teams,
        periods: parsed.periods || defaultState.periods,
        roleColors: parsed.roleColors || defaultState.roleColors
      };
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);
  
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []);


  const login = (username: string, password?: string): boolean => {
    const existingUser = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    // Admin backdoor for prototype or if password matches
    if (existingUser) {
      if (!existingUser.password || existingUser.password === password) {
        setState((prev) => ({ ...prev, currentUser: existingUser }));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    googleLogout();
    setState((prev) => ({ ...prev, currentUser: null }));
  };


  const addSituation = (situationData: Omit<Situation, 'id' | 'createdAt' | 'systemProtocol'>) => {
    const newSituation: Situation = {
      ...situationData,
      id: crypto.randomUUID(),
      systemProtocol: Math.floor(10000000 + Math.random() * 90000000).toString(),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      situations: [newSituation, ...prev.situations],
    }));
  };

  const updateSituation = (id: string, updates: Partial<Situation>) => {
    setState((prev) => ({
      ...prev,
      situations: prev.situations.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const addPredefinedReason = (reasonData: Omit<PredefinedReason, 'id'>) => {
    const newReason: PredefinedReason = {
      ...reasonData,
      id: crypto.randomUUID(),
    };
    setState((prev) => ({
      ...prev,
      predefinedReasons: [...prev.predefinedReasons, newReason],
    }));
  };

  const deletePredefinedReason = (id: string) => {
    setState((prev) => ({
      ...prev,
      predefinedReasons: prev.predefinedReasons.filter((r) => r.id !== id),
    }));
  };

  const addPeriod = (periodData: Omit<Period, 'id'>) => {
    const newPeriod: Period = {
      ...periodData,
      id: crypto.randomUUID(),
    };
    setState((prev) => ({
      ...prev,
      periods: [...prev.periods, newPeriod],
    }));
  };

  const deletePeriod = (id: string) => {
    setState((prev) => ({
      ...prev,
      periods: prev.periods.filter((p) => p.id !== id),
    }));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
  };

  const deleteUser = (id: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
  };

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: crypto.randomUUID(),
    };
    setState((prev) => ({
      ...prev,
      teams: [...prev.teams, newTeam],
    }));
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTeam = (id: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== id),
    }));
  };

  const updateRoleColor = (role: Role, color: string) => {
    setState((prev) => ({
      ...prev,
      roleColors: { ...prev.roleColors, [role]: color }
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        addSituation,
        updateSituation,
        addPredefinedReason,
        deletePredefinedReason,
        addPeriod,
        deletePeriod,
        addUser,
        updateUser,
        deleteUser,
        addTeam,
        updateTeam,
        deleteTeam,
        updateRoleColor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
