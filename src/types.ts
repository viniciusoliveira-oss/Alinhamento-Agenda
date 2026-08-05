export type Role = 'admin' | 'gestor' | 'supervisor' | 'atendente';

export interface User {
  id: string;
  uid?: string; // Firebase uid
  name: string;
  role: Role;
  username: string;
  teamId?: string;
  managerId?: string;
  requirePasswordChange?: boolean;
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
  attendantId: string;
  attendantName: string;
  openedById: string;
  openedByName?: string;
  managerId?: string;
  teamId?: string;
  reason: string;
  date: string;
  periodId: string;
  type: SituationType;
  predefinedReasonId?: string;
  createdAt: string;
  attachments?: string[];
}
