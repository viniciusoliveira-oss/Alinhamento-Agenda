import re

with open('src/types.ts', 'r') as f:
    text = f.read()

user_old = """export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  teamId?: string;
}"""
user_new = """export interface User {
  id: string;
  uid?: string; // Firebase uid
  name: string;
  role: Role;
  username: string;
  teamId?: string;
  managerId?: string;
  requirePasswordChange?: boolean;
}"""
text = text.replace(user_old, user_new)

sit_old = """export interface Situation {
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
}"""
sit_new = """export interface Situation {
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
}"""
text = text.replace(sit_old, sit_new)

with open('src/types.ts', 'w') as f:
    f.write(text)
