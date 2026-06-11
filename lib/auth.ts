export type LoginRole = 'admin' | 'supervisor' | 'operator';

export const ROLE_LABELS: Record<LoginRole, string> = {
  admin: 'Administrator',
  supervisor: 'Supervisor',
  operator: 'Operator',
};

export const LOGIN_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin',
    name: 'Admin',
    email: 'admin@gmail.com',
    password: 'admin2026',
    airport: 'HQ',
  },
  {
    role: 'supervisor',
    label: 'Supervisor',
    name: 'Supervisor Operasional',
    email: 'supervisor@gmail.com',
    password: 'supervisor2026',
    airport: 'CGK',
  },
  {
    role: 'operator',
    label: 'Operator',
    name: 'Operator Kargo',
    email: 'operator@gmail.com',
    password: 'operator2026',
    airport: 'CGK',
  },
] as const;

export function getLoginAccountByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return LOGIN_ACCOUNTS.find((account) => account.email === normalizedEmail);
}
