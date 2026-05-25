import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { 
  Account, 
  Transaction, 
  Category, 
  Goals, 
  UserSettings
} from '../types';

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  goals: Goals;
  settings: UserSettings;
  loading: boolean;
  initialized: boolean;

  // Init Data
  fetchData: () => Promise<void>;

  // Actions
  addTransaction: (t: Omit<Transaction, 'id' | 'tenantId'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addCategory: (c: Omit<Category, 'id' | 'tenantId'>) => Promise<void>;
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addAccount: (a: Omit<Account, 'id' | 'tenantId'>) => Promise<void>;
  updateAccount: (id: string, a: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  deleteUserAllData: () => Promise<void>;
  
  updateSettings: (s: Partial<UserSettings>) => void;
  updateGoals: (g: Partial<Goals>) => void;

  // UI State
  isTransactionModalOpen: boolean;
  transactionToEdit: Transaction | null;
  openTransactionModal: (tx?: Transaction) => void;
  closeTransactionModal: () => void;

  isAccountModalOpen: boolean;
  accountToEdit: Account | null;
  openAccountModal: (acc?: Account) => void;
  closeAccountModal: () => void;

  isCategoryModalOpen: boolean;
  categoryToEdit: Category | null;
  openCategoryModal: (cat?: Category) => void;
  closeCategoryModal: () => void;

  transactionFilters: {
    startDate: string;
    endDate: string;
    type: string;
    category: string;
    search: string;
  };
  setTransactionFilters: (filters: Partial<AppState['transactionFilters']>) => void;
}

export const useStore = create<AppState>((set) => ({
  accounts: [],
  transactions: [],
  categories: [],
  goals: { monthlyEconomyPercent: 20, categoryLimits: {} },
  settings: { name: 'Usuário', currency: 'BRL', fiscalYearStart: 0, theme: 'dark' },
  loading: false,
  initialized: false,

  isTransactionModalOpen: false,
  transactionToEdit: null,
  isAccountModalOpen: false,
  accountToEdit: null,
  isCategoryModalOpen: false,
  categoryToEdit: null,
  transactionFilters: { startDate: '', endDate: '', type: '', category: '', search: '' },

  fetchData: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    set({ loading: true });

    try {
      const [accRes, catRes, txRes] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: true }),
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('transactions').select('*').order('date', { ascending: false })
      ]);

      if (accRes.error) throw accRes.error;
      if (catRes.error) throw catRes.error;
      if (txRes.error) throw txRes.error;

      // Mapper to keep compatibility with UI components expecting camelCase
      const mappedTransactions = (txRes.data || []).map(t => ({
        ...t,
        accountId: t.account_id,
        categoryId: t.category_id,
        toAccountId: t.to_account_id,
        paymentMethod: t.payment_method
      }));

      set({ 
        accounts: accRes.data || [],
        categories: catRes.data || [],
        transactions: mappedTransactions,
        initialized: true,
        loading: false
      });
    } catch (error) {
      console.error("Erro ao buscar dados do Supabase:", error);
      set({ loading: false, initialized: true });
    }
  },

  setTransactionFilters: (filters) => set((state) => ({
    transactionFilters: { ...state.transactionFilters, ...filters }
  })),

  openTransactionModal: (tx) => set({ isTransactionModalOpen: true, transactionToEdit: tx || null }),
  closeTransactionModal: () => set({ isTransactionModalOpen: false, transactionToEdit: null }),

  openAccountModal: (acc) => set({ isAccountModalOpen: true, accountToEdit: acc || null }),
  closeAccountModal: () => set({ isAccountModalOpen: false, accountToEdit: null }),

  openCategoryModal: (cat) => set({ isCategoryModalOpen: true, categoryToEdit: cat || null }),
  closeCategoryModal: () => set({ isCategoryModalOpen: false, categoryToEdit: null }),

  addTransaction: async (t) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: session.user.id,
        account_id: t.accountId,
        category_id: t.type !== 'transferencia' ? t.categoryId : null,
        to_account_id: t.type === 'transferencia' ? t.toAccountId : null,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        payment_method: t.paymentMethod,
        status: t.status
      }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir transação:", error);
      return;
    }

    if (data) {
      set(state => {
        const rawTx = data as any;
        const newTx = {
          ...rawTx,
          accountId: rawTx.account_id,
          categoryId: rawTx.category_id,
          toAccountId: rawTx.to_account_id,
          paymentMethod: rawTx.payment_method
        } as Transaction;
        return { 
          transactions: [newTx, ...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      });
      
      // TODO: Disparar update de saldo no Supabase via RPC ou atualizar a tabela accounts diretamente
      // Para o MVP, estamos calculando localmente na view de Dashboard e atualizando o state acima.
    }
  },

  updateTransaction: async (id, updates) => {
    // ... simplificado ...
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const rawTx = data as any;
      const mappedTx = {
        ...rawTx,
        accountId: rawTx.account_id,
        categoryId: rawTx.category_id,
        toAccountId: rawTx.to_account_id,
        paymentMethod: rawTx.payment_method
      } as Transaction;
      set(state => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...mappedTx } : t)
      }));
    }
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
    }
  },

  addCategory: async (c) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase.from('categories').insert([{
      user_id: session.user.id,
      name: c.name,
      type: c.type,
      color: c.color || '#94a3b8'
    }]).select().single();

    if (!error && data) {
      set(state => ({ categories: [...state.categories, data as Category] }));
    }
  },

  updateCategory: async (id, updates) => {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (!error && data) {
      set(state => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...data as Category } : c) }));
    }
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
    }
  },

  addAccount: async (a) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase.from('accounts').insert([{
      user_id: session.user.id,
      name: a.name,
      type: a.type,
      balance: a.balance || 0
    }]).select().single();

    if (!error && data) {
      set(state => ({ accounts: [...state.accounts, data as Account] }));
    }
  },

  updateAccount: async (id, updates) => {
    const { data, error } = await supabase.from('accounts').update(updates).eq('id', id).select().single();
    if (!error && data) {
      set(state => ({ accounts: state.accounts.map(acc => acc.id === id ? { ...acc, ...data as Account } : acc) }));
    }
  },

  deleteAccount: async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) {
      set(state => ({ accounts: state.accounts.filter(acc => acc.id !== id) }));
    }
  },

  updateSettings: (s) => set((state) => ({
    settings: { ...state.settings, ...s }
  })),

  updateGoals: (g) => set((state) => ({
    goals: { ...state.goals, ...g }
  })),

  deleteUserAllData: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    // Deleta os dados das tabelas publicas para respeitar o direito ao esquecimento da LGPD
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', session.user.id),
      supabase.from('accounts').delete().eq('user_id', session.user.id),
      supabase.from('categories').delete().eq('user_id', session.user.id)
    ]);
    
    // Limpa estado local
    set({ accounts: [], categories: [], transactions: [] });
    // Faz logout final
    await supabase.auth.signOut();
  },

}));
