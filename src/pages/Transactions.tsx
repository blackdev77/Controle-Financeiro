import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, Search, Filter, Plus, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Transaction } from '../types';

export function Transactions() {
  const { transactions, categories, accounts, deleteTransaction, openTransactionModal, transactionFilters, setTransactionFilters } = useStore();

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteTransaction(id);
    }
  };

  const handleEdit = (t: Transaction) => {
    openTransactionModal(t);
  };

  const handleOpenModal = () => {
    openTransactionModal();
  };

  const filteredTransactions = transactions.filter(t => {
    if (transactionFilters.month) {
      const tMonth = t.date.substring(0, 7); // yyyy-MM
      if (tMonth !== transactionFilters.month) return false;
    }
    if (transactionFilters.type && t.type !== transactionFilters.type) return false;
    if (transactionFilters.category && t.categoryId !== transactionFilters.category) return false;
    if (transactionFilters.search && !t.description.toLowerCase().includes(transactionFilters.search.toLowerCase())) return false;
    return true;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Desconhecida';
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#94a3b8';
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Desconhecida';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleExportCSV = () => {
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
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ marginBottom: 0 }}>Lançamentos</h1>
          <p className="text-secondary">Gerencie suas receitas e despesas</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      <div className="card mb-6 flex flex-col md:flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-secondary" />
          <span className="font-medium text-secondary">Filtros:</span>
        </div>
        
        <div className="form-group flex-1 m-0">
          <div className="flex items-center gap-2 border border-border-color rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 focus-within:border-primary-color transition-colors">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              className="bg-transparent border-none outline-none w-full text-sm"
              placeholder="Buscar lançamento..."
              value={transactionFilters.search}
              onChange={(e) => setTransactionFilters({ search: e.target.value })}
            />
          </div>
        </div>

        <input 
          type="month" 
          className="form-control" 
          value={transactionFilters.month}
          onChange={(e) => setTransactionFilters({ month: e.target.value })}
          style={{ maxWidth: 180 }}
        />

        <select 
          className="form-control" 
          value={transactionFilters.type}
          onChange={(e) => setTransactionFilters({ type: e.target.value })}
          style={{ maxWidth: 160 }}
        >
          <option value="">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
          <option value="transferencia">Transferências</option>
        </select>

        <select 
          className="form-control" 
          value={transactionFilters.category}
          onChange={(e) => setTransactionFilters({ category: e.target.value })}
          style={{ maxWidth: 200 }}
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
        >
          <Download size={16} /> Exportar CSV
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
            {filteredTransactions.map(t => (
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
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(t.id)}>
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
      </div>

    </div>
  );
}
