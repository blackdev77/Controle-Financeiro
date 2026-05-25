import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, Search, Filter, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

export function Transactions() {
  const { transactions, categories, accounts, deleteTransaction, openTransactionModal, transactionFilters, setTransactionFilters } = useStore();

  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const handleEdit = (t: Transaction) => {
    openTransactionModal(t);
  };

  const handleOpenModal = () => {
    openTransactionModal();
  };

  const filteredTransactions = transactions.filter(t => {
    if (transactionFilters.startDate) {
      if (t.date.substring(0, 10) < transactionFilters.startDate) return false;
    }
    if (transactionFilters.endDate) {
      if (t.date.substring(0, 10) > transactionFilters.endDate) return false;
    }
    if (transactionFilters.type && t.type !== transactionFilters.type) return false;
    if (transactionFilters.category && t.categoryId !== transactionFilters.category) return false;
    if (transactionFilters.search && !t.description.toLowerCase().includes(transactionFilters.search.toLowerCase())) return false;
    return true;
  });

  // Reseta paginação ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [transactionFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Desconhecida';
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#94a3b8';
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Desconhecida';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      setToastMessage('Nenhum lançamento para exportar no período selecionado');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const headers = ['Data', 'Descricao', 'Categoria', 'Conta', 'Tipo', 'FormaPgto', 'Status', 'Valor'];
    const rows = filteredTransactions.map(t => [
      t.date.split('T')[0],
      `"${t.description}"`,
      `"${getCategoryName(t.categoryId)}"`,
      `"${getAccountName(t.accountId)}"`,
      t.type,
      t.paymentMethod,
      t.status,
      t.amount.toString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lancamentos_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setToastMessage('✅ Arquivo exportado com sucesso!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div>
      {/* Toast de Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center">
          {toastMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ marginBottom: 0 }}>Lançamentos</h1>
          <p className="text-secondary">Gerencie suas receitas e despesas</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      <div className="card mb-6 flex flex-col lg:flex-row flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-secondary" />
          <span className="font-medium text-secondary">Filtros:</span>
        </div>
        
        <div className="form-group flex-1 min-w-[200px] m-0">
          <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-lg px-3 py-[6px] bg-transparent focus-within:border-[var(--primary-color)] transition-colors h-10">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              className="bg-transparent border-none outline-none w-full text-sm"
              placeholder="Buscar lançamento..."
              value={transactionFilters.search || ''}
              onChange={(e) => setTransactionFilters({ search: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 h-10 border border-[var(--border-color)] rounded-lg px-2 bg-transparent">
          <span className="text-xs text-secondary ml-2">De:</span>
          <input 
            type="date" 
            className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)]" 
            value={transactionFilters.startDate || ''}
            onChange={(e) => setTransactionFilters({ startDate: e.target.value })}
          />
          <span className="text-xs text-secondary ml-2">Até:</span>
          <input 
            type="date" 
            className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)]" 
            value={transactionFilters.endDate || ''}
            onChange={(e) => setTransactionFilters({ endDate: e.target.value })}
          />
        </div>

        <select 
          className="form-control" 
          value={transactionFilters.type || ''}
          onChange={(e) => setTransactionFilters({ type: e.target.value })}
          style={{ width: '150px', height: '40px', padding: '0 10px' }}
        >
          <option value="">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
          <option value="transferencia">Transferências</option>
        </select>

        <select 
          className="form-control" 
          value={transactionFilters.category || ''}
          onChange={(e) => setTransactionFilters({ category: e.target.value })}
          style={{ width: '170px', height: '40px', padding: '0 10px' }}
        >
          <option value="">Todas as categorias</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        
        <button 
          className="btn btn-secondary ml-auto flex items-center gap-2"
          onClick={handleExportCSV}
          title="Exportar Lançamentos (CSV)"
          style={{ height: '40px' }}
        >
          <Download size={16} /> CSV
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th>Forma de Pgto</th>
              <th>Status</th>
              <th className="text-right">Valor</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map(t => (
              <tr key={t.id}>
                <td>{format(parseISO(t.date), 'dd/MM/yyyy')}</td>
                <td>
                  <div className="font-medium">{t.description}</div>
                </td>
                <td>
                  {t.type === 'transferencia' ? (
                    <span className="text-muted italic text-sm">Transferência</span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: `${getCategoryColor(t.categoryId)}20`, color: getCategoryColor(t.categoryId) }}>
                      {getCategoryName(t.categoryId)}
                    </span>
                  )}
                </td>
                <td>
                  {t.type === 'transferencia' ? (
                    <div className="text-sm">
                      <span className="text-danger">{getAccountName(t.accountId)}</span>
                      <br/>
                      <span className="text-success text-xs">→ {getAccountName(t.toAccountId || '')}</span>
                    </div>
                  ) : (
                    <span className="text-secondary text-sm">{getAccountName(t.accountId)}</span>
                  )}
                </td>
                <td style={{ textTransform: 'capitalize' }}>{t.paymentMethod.replace('_', ' ')}</td>
                <td>
                  {t.status === 'completed' ? (
                    <span className="badge badge-success">Efetuado</span>
                  ) : (
                    <span className="badge badge-warning">Pendente</span>
                  )}
                </td>
                <td className={`text-right font-semibold ${t.type === 'receita' ? 'text-success' : t.type === 'despesa' ? 'text-danger' : 'text-primary'}`}>
                  {t.type === 'receita' ? '+' : t.type === 'despesa' ? '-' : ''} {formatCurrency(t.amount)}
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(t)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setTransactionToDelete(t)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 text-muted">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={32} className="mb-3 opacity-40" />
                    <p className="text-sm font-medium">Nenhum lançamento encontrado.</p>
                    <p className="text-xs mt-1">Limpe os filtros ou registre sua primeira movimentação financeira.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Paginação */}
        {filteredTransactions.length > 0 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border-color)]">
            <div className="text-sm text-secondary">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium px-2">
                {currentPage} / {totalPages}
              </span>
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!transactionToDelete}
        title="Excluir Lançamento"
        message={`Deseja excluir o lançamento "${transactionToDelete?.description}" de ${transactionToDelete ? formatCurrency(transactionToDelete.amount) : ''}? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setTransactionToDelete(null)}
      />
    </div>
  );
}
