import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Account } from '../types';

export function AccountModal() {
  const { isAccountModalOpen, accountToEdit, closeAccountModal, addAccount, updateAccount } = useStore();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setInitialBalance(accountToEdit.balance.toString());
      setColor(accountToEdit.color || '#3b82f6');
    } else {
      setName('');
      setType('checking');
      setInitialBalance('');
      setColor('#3b82f6');
    }
  }, [accountToEdit, isAccountModalOpen]);

  if (!isAccountModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    if (accountToEdit) {
      await updateAccount(accountToEdit.id, {
        name,
        type,
        balance: parseFloat(initialBalance) || 0,
        color
      });
    } else {
      await addAccount({
        name,
        type,
        balance: parseFloat(initialBalance) || 0,
        color
      });
    }
    
    closeAccountModal();
  };

  return (
    <div className="modal-overlay" onClick={closeAccountModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="m-0 text-xl font-medium tracking-tight text-primary">
            {accountToEdit ? 'Editar Conta' : 'Nova Conta'}
          </h3>
          <button onClick={closeAccountModal} className="text-secondary hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="form-group mb-4">
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
            
            <div className="form-group mb-4">
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

            <div className="form-group mb-4">
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

            <div className="form-group mb-4">
              <label className="form-label">Cor</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color" 
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="text-sm text-secondary">{color}</span>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeAccountModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
