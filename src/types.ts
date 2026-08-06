export type Role = 'admin' | 'gestor' | 'supervisor' | 'atendente';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  password?: string;
  requiresPasswordChange?: boolean;
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
  date: string;
  authorName: string; // The user who registered it
  managerName: string;
  teamName: string;
  attendantName: string;
  type: SituationType;
  predefinedReasonId?: string;
  periodId: string;
  systemProtocol: string;
  voalleProtocol: string;
  osReport: string;
  situationReport: string;
  createdAt: string;
  attachments?: string[];
}
