import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Wallet, Building2, CreditCard, DollarSign } from 'lucide-react';
import type { Account } from '../types';

export function Accounts() {
  const { accounts, addAccount } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#3b82f6');

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

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    addAccount({
      name,
      type,
      balance: parseFloat(initialBalance) || 0,
      color
    });
    
    setName('');
    setInitialBalance('');
    setIsAdding(false);
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="tracking-tight" style={{ marginBottom: 0 }}>Contas</h1>
          <p className="text-secondary tracking-tight">Gerencie suas carteiras e contas bancárias</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Nova Conta
        </button>
      </div>

      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', color: 'white', borderColor: 'transparent' }}>
        <h3 style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>Saldo Consolidado</h3>
        <div className="text-3xl font-bold mt-2">{formatCurrency(totalBalance)}</div>
      </div>

      {isAdding && (
        <div className="card mb-6 animate-fade-in border-l-4" style={{ borderLeftColor: 'var(--primary-color)' }}>
          <h3 className="mb-4 text-primary">Nova Conta</h3>
          <form onSubmit={handleAddAccount} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="form-group flex-1 m-0">
              <label className="form-label">Nome da Conta</label>
              <input 
                type="text" 
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Nubank, Itaú..."
              />
            </div>
            
            <div className="form-group m-0" style={{ minWidth: 150 }}>
              <label className="form-label">Tipo</label>
              <select 
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value as Account['type'])}
              >
                <option value="checking">Conta Corrente</option>
                <option value="savings">Poupança</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="cash">Dinheiro em espécie</option>
                <option value="investment">Investimento</option>
              </select>
            </div>

            <div className="form-group m-0" style={{ minWidth: 150 }}>
              <label className="form-label">Saldo Inicial</label>
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group m-0">
              <label className="form-label">Cor</label>
              <input 
                type="color" 
                className="form-control"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 60, padding: '0.2rem' }}
              />
            </div>

            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 md:grid-cols-1 lg:grid-cols-2">
        {accounts.map(acc => (
          <div key={acc.id} className="card flex items-center justify-between">
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
                <div className={`font-bold mt-1 ${acc.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(acc.balance)}
                </div>
              </div>
            </div>
            {/* Omitido Edit/Delete para simplificar MVP */}
          </div>
        ))}
      </div>
    </div>
  );
}
