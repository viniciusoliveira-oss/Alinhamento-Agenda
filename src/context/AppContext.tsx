import React, { createContext, useContext, useEffect, useState } from 'react';
import { initAuth, getAccessToken, googleSignIn, logout as googleLogout } from '../lib/googleAuth';
import { PredefinedReason, Situation, User, Team, Period, Role } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  situations: Situation[];
  predefinedReasons: PredefinedReason[];
  periods: Period[];
  roleColors: Record<Role, string>;
  isSupabaseConnected: boolean;
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
  },
  isSupabaseConnected: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('appState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultState, 
          ...parsed,
          users: parsed.users || defaultState.users,
          teams: parsed.teams || defaultState.teams,
          periods: parsed.periods || defaultState.periods,
          roleColors: parsed.roleColors || defaultState.roleColors
        };
      } catch(e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    if (initialLoadDone) {
      localStorage.setItem('appState', JSON.stringify(state));
    }
  }, [state, initialLoadDone]);

  // Load from Supabase on mount
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setInitialLoadDone(true);
        return;
      }
      
      try {
        const [usersRes, teamsRes, situationsRes, reasonsRes, periodsRes] = await Promise.all([
          supabase.from('app_users').select('*'),
          supabase.from('teams').select('*'),
          supabase.from('situations').select('*'),
          supabase.from('predefined_reasons').select('*'),
          supabase.from('periods').select('*')
        ]);

        // Check if query was successful (table exists)
        const isConnected = !usersRes.error && !teamsRes.error;
        const newState = { ...state, isSupabaseConnected: isConnected };
        
        if (isConnected) {
          newState.users = (usersRes.data || []).map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            role: u.role,
            password: u.password,
            requiresPasswordChange: u.requires_password_change,
            teamId: u.team_id
          }));
          newState.teams = (teamsRes.data || []).map(t => ({
            id: t.id,
            name: t.name,
            createdAt: t.created_at
          }));
          newState.situations = (situationsRes.data || []).map(s => ({
            id: s.id,
            title: s.title,
            date: s.date,
            authorName: s.author_name,
            attendantName: s.attendant_name,
            managerName: s.manager_name,
            teamName: s.team_name,
            type: s.type as any,
            predefinedReasonId: s.predefined_reason_id,
            periodId: s.period_id,
            systemProtocol: s.system_protocol,
            voalleProtocol: s.voalle_protocol,
            osReport: s.os_report,
            situationReport: s.situation_report,
            createdAt: s.created_at
          }));
          newState.predefinedReasons = (reasonsRes.data || []).map(r => ({
            id: r.id,
            type: r.type as any,
            label: r.label
          }));
          newState.periods = (periodsRes.data || []).map(p => ({
            id: p.id,
            label: p.label
          }));
        }

        if (isConnected) {
          if (newState.currentUser) {
            const updatedUser = newState.users.find(u => u.id === newState.currentUser!.id);
            if (updatedUser) {
              newState.currentUser = updatedUser;
            } else {
              newState.currentUser = null;
            }
          }
          setState(newState);
        }
      } catch (err) {
        console.error('Failed to sync from Supabase', err);
      } finally {
        setInitialLoadDone(true);
      }
    };
    
    loadFromSupabase();
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []);

  const login = (username: string, password?: string): boolean => {
    const existingUser = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
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

  // Helper function to sync with Supabase async
  const syncToSupabase = async (table: string, action: 'insert' | 'update' | 'delete', data: any, id?: string) => {
    if (!state.isSupabaseConnected) return;
    try {
      if (action === 'insert') {
        await supabase.from(table).insert([data]);
      } else if (action === 'update' && id) {
        await supabase.from(table).update(data).eq('id', id);
      } else if (action === 'delete' && id) {
        await supabase.from(table).delete().eq('id', id);
      }
    } catch(err) {
      console.error(`Supabase sync error on ${table}:`, err);
    }
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

    syncToSupabase('situations', 'insert', {
      id: newSituation.id,
      title: newSituation.title,
      date: newSituation.date,
      author_name: newSituation.authorName,
      attendant_name: newSituation.attendantName,
      manager_name: newSituation.managerName,
      team_name: newSituation.teamName,
      type: newSituation.type,
      predefined_reason_id: newSituation.predefinedReasonId,
      period_id: newSituation.periodId,
      system_protocol: newSituation.systemProtocol,
      voalle_protocol: newSituation.voalleProtocol,
      os_report: newSituation.osReport,
      situation_report: newSituation.situationReport,
      created_at: newSituation.createdAt
    });
  };

  const updateSituation = (id: string, updates: Partial<Situation>) => {
    setState((prev) => ({
      ...prev,
      situations: prev.situations.map(s => s.id === id ? { ...s, ...updates } : s)
    }));

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.date) updateData.date = updates.date;
    if (updates.attendantName) updateData.attendant_name = updates.attendantName;
    if (updates.managerName) updateData.manager_name = updates.managerName;
    if (updates.teamName) updateData.team_name = updates.teamName;
    if (updates.type) updateData.type = updates.type;
    if (updates.predefinedReasonId !== undefined) updateData.predefined_reason_id = updates.predefinedReasonId;
    if (updates.periodId) updateData.period_id = updates.periodId;
    if (updates.voalleProtocol !== undefined) updateData.voalle_protocol = updates.voalleProtocol;
    if (updates.osReport) updateData.os_report = updates.osReport;
    if (updates.situationReport) updateData.situation_report = updates.situationReport;

    syncToSupabase('situations', 'update', updateData, id);
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

    syncToSupabase('predefined_reasons', 'insert', {
      id: newReason.id,
      type: newReason.type,
      label: newReason.label
    });
  };

  const deletePredefinedReason = (id: string) => {
    setState((prev) => ({
      ...prev,
      predefinedReasons: prev.predefinedReasons.filter((r) => r.id !== id),
    }));
    syncToSupabase('predefined_reasons', 'delete', null, id);
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
    syncToSupabase('periods', 'insert', {
      id: newPeriod.id,
      label: newPeriod.label
    });
  };

  const deletePeriod = (id: string) => {
    setState((prev) => ({
      ...prev,
      periods: prev.periods.filter((p) => p.id !== id),
    }));
    syncToSupabase('periods', 'delete', null, id);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      password: userData.password || 'Mudar@123',
      requiresPasswordChange: userData.requiresPasswordChange ?? true,
      id: crypto.randomUUID(),
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));

    syncToSupabase('app_users', 'insert', {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      requires_password_change: newUser.requiresPasswordChange,
      team_id: newUser.teamId
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
    
    // Also update currentUser if they update their own profile
    if (state.currentUser?.id === id) {
      setState((prev) => ({
        ...prev,
        currentUser: { ...prev.currentUser!, ...updates }
      }));
    }

    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.username) updateData.username = updates.username;
    if (updates.password) updateData.password = updates.password;
    if (updates.role) updateData.role = updates.role;
    if (updates.requiresPasswordChange !== undefined) updateData.requires_password_change = updates.requiresPasswordChange;
    if (updates.teamId !== undefined) updateData.team_id = updates.teamId;

    syncToSupabase('app_users', 'update', updateData, id);
  };

  const deleteUser = (id: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
    syncToSupabase('app_users', 'delete', null, id);
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

    syncToSupabase('teams', 'insert', {
      id: newTeam.id,
      name: newTeam.name
    });
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    if (updates.name) {
      syncToSupabase('teams', 'update', { name: updates.name }, id);
    }
  };

  const deleteTeam = (id: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t.id !== id),
    }));
    syncToSupabase('teams', 'delete', null, id);
  };

  const updateRoleColor = (role: Role, color: string) => {
    setState((prev) => ({
      ...prev,
      roleColors: { ...prev.roleColors, [role]: color }
    }));
    // Colors remain purely in localStorage for now
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
