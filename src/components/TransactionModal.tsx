import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Transaction } from '../types';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export function TransactionModal() {
  const { 
    categories, accounts, addTransaction, updateTransaction, 
    isTransactionModalOpen, closeTransactionModal, transactionToEdit 
  } = useStore();
  
  const [type, setType] = useState<Transaction['type']>('despesa');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('pix');
  const [status, setStatus] = useState<Transaction['status']>('completed');

  useEffect(() => {
    if (isTransactionModalOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount.toString());
        setDescription(transactionToEdit.description);
        setDate(transactionToEdit.date.split('T')[0]);
        setCategoryId(transactionToEdit.categoryId);
        setAccountId(transactionToEdit.accountId);
        setToAccountId(transactionToEdit.toAccountId || '');
        setPaymentMethod(transactionToEdit.paymentMethod);
        setStatus(transactionToEdit.status);
      } else {
        // Reset form
        setType('despesa');
        setAmount('');
        setDescription('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setCategoryId('');
        setAccountId(accounts.length > 0 ? accounts[0].id : '');
        setToAccountId('');
        setPaymentMethod('pix');
        setStatus('completed');
      }
    }
  }, [isTransactionModalOpen, transactionToEdit, accounts]);

  if (!isTransactionModalOpen) return null;

  const filteredCategories = categories.filter(c => 
    type === 'transferencia' ? c.type === 'transferencia' : (c.type === type || c.type === 'ambos')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !accountId) return;
    if (type !== 'transferencia' && !categoryId) return;
    if (type === 'transferencia' && !toAccountId) return;

    // Se for transferência e não escolheu categoria específica (pois transfer pode não ter cat obrigatoria na UI visual)
    const finalCategoryId = type === 'transferencia' && !categoryId 
      ? categories.find(c => c.type === 'transferencia')?.id || '' 
      : categoryId;

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      date: new Date(date).toISOString(),
      categoryId: finalCategoryId,
      accountId,
      toAccountId: type === 'transferencia' ? toAccountId : undefined,
      paymentMethod,
      status
    };

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    closeTransactionModal();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeTransactionModal()} style={{ zIndex: 100 }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="tracking-tight font-semibold" style={{ marginBottom: 0, fontSize: '1.25rem' }}>
            {transactionToEdit ? 'Editar movimento' : 'Novo registro'}
          </h2>
          <button onClick={closeTransactionModal}>
            <X size={24} className="text-secondary" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Tipo */}
            <div className="flex p-1 mb-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-border-color">
              <div
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-all flex-1 text-center cursor-pointer ${type === 'despesa' ? 'bg-[var(--surface-color)] shadow-sm text-[var(--danger-color)]' : 'text-secondary hover:text-[var(--danger-color)]'}`}
                onClick={() => { setType('despesa'); setCategoryId(''); }}
              >
                Saída
              </div>
              <div
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-all flex-1 text-center cursor-pointer ${type === 'receita' ? 'bg-[var(--surface-color)] shadow-sm text-[var(--success-color)]' : 'text-secondary hover:text-[var(--success-color)]'}`}
                onClick={() => { setType('receita'); setCategoryId(''); }}
              >
                Entrada
              </div>
              <div
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-all flex-1 text-center cursor-pointer ${type === 'transferencia' ? 'bg-[var(--surface-color)] shadow-sm text-[var(--primary-color)]' : 'text-secondary hover:text-[var(--primary-color)]'}`}
                onClick={() => { setType('transferencia'); setCategoryId(''); }}
              >
                Transferência
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control text-2xl font-bold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                style={{ padding: '1rem', color: type === 'despesa' ? 'var(--danger-color)' : type === 'receita' ? 'var(--success-color)' : 'var(--text-primary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder={type === 'transferencia' ? "Ex: Transferência para Poupança" : "Ex: Mercado, Almoço..."}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Conta {type === 'transferencia' ? 'de Origem' : ''}</label>
                <select
                  className="form-control"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              {type === 'transferencia' ? (
                <div className="form-group">
                  <label className="form-label">Conta de Destino</label>
                  <select
                    className="form-control"
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione</option>
                    {accounts.filter(a => a.id !== accountId).map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-control"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {type !== 'transferencia' && (
                <div className="form-group">
                  <label className="form-label">Forma de Pagamento</label>
                  <select
                    className="form-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    required
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="boleto">Boleto</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="form-group m-0 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={status === 'completed'}
                  onChange={(e) => setStatus(e.target.checked ? 'completed' : 'pending')}
                />
                <span className="text-sm font-medium text-secondary">Lançamento efetuado (já afeta o saldo atual)</span>
              </label>
            </div>

          </div>
          <div className="modal-footer bg-slate-50 dark:bg-slate-900" style={{ borderRadius: '0 0 1rem 1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeTransactionModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ width: '150px' }}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
