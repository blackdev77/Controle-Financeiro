export type ID = string;

export interface Tenant {
  id: ID;
  name: string;
}

export interface User {
  id: ID;
  tenantId: ID;
  name: string;
  email: string;
}

export interface Account {
  id: ID;
  tenantId: ID;
  name: string; // ex: "Conta Corrente Itaú", "Carteira"
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';
  balance: number; // Saldo inicial ou balance calculado
  color?: string;
  isArchived?: boolean;
}

export type TransactionType = 'receita' | 'despesa' | 'transferencia';

export interface Category {
  id: ID;
  tenantId: ID;
  parentId?: ID; // Para subcategorias
  name: string;
  type: TransactionType | 'ambos';
  icon: string;
  color: string;
}

export interface Transaction {
  id: ID;
  tenantId: ID;
  accountId: ID;
  toAccountId?: ID; // Apenas para transferências
  categoryId: ID;
  type: TransactionType;
  amount: number;
  date: string; // ISO 8601
  description: string;
  paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'outros';
  status: 'pending' | 'completed'; // completed afeta saldo
  recurringId?: ID;
}

export interface RecurringTransaction {
  id: ID;
  tenantId: ID;
  frequency: 'monthly' | 'weekly' | 'custom';
  accountId: ID;
  categoryId: ID;
  type: TransactionType;
  amount: number;
  description: string;
  nextDate: string;
  endDate?: string;
}

export interface AutomationRule {
  id: ID;
  tenantId: ID;
  condition: 'description_contains' | 'amount_between';
  value: string;
  applyCategoryId: ID;
}

export interface Goals {
  monthlyEconomyPercent: number;
  categoryLimits: Record<ID, number>; // Limit per categoryId
}

export interface UserSettings {
  name: string;
  currency: string;
  fiscalYearStart: number;
  theme: 'light' | 'dark';
}

export interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  recurring: RecurringTransaction[];
  rules: AutomationRule[];
  goals: Goals;
  settings: UserSettings;
}
