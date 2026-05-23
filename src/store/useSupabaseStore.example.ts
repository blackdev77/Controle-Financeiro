import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { Transaction, Category, Account } from '../types';

interface SupabaseStore {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  loading: boolean;
  
  // Actions
  fetchInitialData: (userId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useSupabaseStore = create<SupabaseStore>((set) => ({
  transactions: [],
  categories: [],
  accounts: [],
  loading: false,

  fetchInitialData: async (_userId: string) => {
    set({ loading: true });
    
    // O Supabase usa Row Level Security, então teoricamente você não precisa passar
    // `eq('user_id', userId)`, mas é uma boa prática para queries se o RLS permitir admins.
    
    // 1. Fetch Accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Fetch Categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    // 3. Fetch Transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    set({ 
      accounts: accounts || [], 
      categories: categories || [], 
      transactions: transactions || [],
      loading: false 
    });
  },

  addTransaction: async (transactionData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        { 
          ...transactionData, 
          user_id: session.user.id // Vincula ao usuário logado
        }
      ])
      .select()
      .single();

    if (!error && data) {
      set(state => ({
        transactions: [data, ...state.transactions]
      }));
    } else {
      console.error('Erro ao salvar transação:', error);
    }
  },

  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id); // RLS garante que ele só pode deletar se o id for dele

    if (!error) {
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
    }
  }
}));
