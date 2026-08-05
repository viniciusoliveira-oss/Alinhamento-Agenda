export type Role = 'admin' | 'gestor' | 'supervisor' | 'atendente';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
}

export type SituationType = 'erro' | 'cancelamento' | 'reagendamento';

export interface PredefinedReason {
  id: string;
  type: SituationType;
  label: string;
}

export interface Period {
  id: string;
  label: string;
}

export interface Situation {
  id: string;
  title: string;
  report: string;
  attendantName: string; // Keeping for simplicity, or we could link to user
  reason: string;
  date: string;
  periodId: string;
  type: SituationType;
  predefinedReasonId?: string;
  createdAt: string;
  attachments?: string[];
}
