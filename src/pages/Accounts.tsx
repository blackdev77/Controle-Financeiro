import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Wallet, Building2, CreditCard, DollarSign, Pencil, Trash2 } from 'lucide-react';
import type { Account } from '../types';
import { AccountModal } from '../components/AccountModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function Accounts() {
  const { accounts, transactions, openAccountModal, deleteAccount } = useStore();
  
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'checking': return <Building2 />;
      case 'credit_card': return <CreditCard />;
      case 'cash': return <DollarSign />;
      default: return <Wallet />;
    }
  };

  const getCalculatedBalance = (acc: Account) => {
    const accTransactions = transactions.filter(t => t.accountId === acc.id && t.status === 'completed');
    const receitas = accTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const despesas = accTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const transSaida = accTransactions.filter(t => t.type === 'transferencia').reduce((sum, t) => sum + t.amount, 0);
    const transEntrada = transactions.filter(t => t.type === 'transferencia' && t.toAccountId === acc.id && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    
    return acc.balance + receitas + transEntrada - despesas - transSaida;
  };

  const accountsWithBalance = accounts.map(acc => ({
    ...acc,
    calculatedBalance: getCalculatedBalance(acc)
  }));

  const totalBalance = accountsWithBalance.reduce((acc, curr) => acc + curr.calculatedBalance, 0);

  const handleDelete = async () => {
    if (accountToDelete) {
      await deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="tracking-tight" style={{ marginBottom: 0 }}>Contas</h1>
          <p className="text-secondary tracking-tight">Gerencie suas carteiras e contas bancárias</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAccountModal()}>
          <Plus size={18} /> Nova Conta
        </button>
      </div>

      <div className="card mb-6">
        <h3 className="text-secondary" style={{ fontSize: '1rem', fontWeight: 500 }}>Saldo Consolidado</h3>
        <div className="text-3xl font-bold mt-2 text-primary">{formatCurrency(totalBalance)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountsWithBalance.map(acc => (
          <div key={acc.id} className="card flex items-center justify-between group relative hover:border-[rgba(255,255,255,0.15)] transition-colors">
            <div className="flex items-center gap-4">
              <div 
                style={{ 
                  backgroundColor: `${acc.color || '#3b82f6'}20`, 
                  color: acc.color || '#3b82f6',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getAccountIcon(acc.type)}
              </div>
              <div>
                <h3 className="m-0" style={{ fontSize: '1rem', marginBottom: 0 }}>{acc.name}</h3>
                <div className={`font-bold mt-1 ${acc.calculatedBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(acc.calculatedBalance)}
                </div>
              </div>
            </div>
            
            {/* Ações CRUD sempre visíveis */}
            <div className="flex gap-2">
              <button 
                className="p-2 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-primary transition-colors"
                onClick={() => openAccountModal(acc)}
                title="Editar conta"
              >
                <Pencil size={16} />
              </button>
              <button 
                className="p-2 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(248,113,113,0.1)] text-danger transition-colors"
                onClick={() => setAccountToDelete(acc)}
                title="Excluir conta"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AccountModal />
      <ConfirmModal 
        isOpen={!!accountToDelete}
        title="Excluir Conta"
        message={`Tem certeza que deseja excluir a conta "${accountToDelete?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  );
}
