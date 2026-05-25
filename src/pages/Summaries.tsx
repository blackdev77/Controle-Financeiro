import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, ChevronLeft, ChevronRight, Pencil, Check, X } from 'lucide-react';

export function Summaries() {
  const { transactions, categories, goals, updateGoals } = useStore();
  
  // Custom month selector state
  const [currentDate, setCurrentDate] = useState(new Date());

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Handle global event for FAB
  useEffect(() => {
    const handleOpenBudgetModal = () => {
      // Just focus or scroll to budget section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.addEventListener('openBudgetModal', handleOpenBudgetModal);
    return () => document.removeEventListener('openBudgetModal', handleOpenBudgetModal);
  }, []);

  const filteredTransactions = transactions.filter(t => 
    isSameMonth(parseISO(t.date), currentDate)
  );

  const despesas = filteredTransactions.filter(t => t.type === 'despesa');

  const orcamentoXRealizado = categories
    .filter(c => c.type === 'despesa' || c.type === 'ambos')
    .map(cat => {
      const limit = goals.categoryLimits?.[cat.id] || 0;
      const spent = despesas
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      
      return {
        ...cat,
        limit,
        spent,
        percent,
        isOverLimit: limit > 0 && spent > limit
      };
    })
    .sort((a, b) => {
      // Sort by spending first, then by limit
      if (b.spent !== a.spent) return b.spent - a.spent;
      return b.limit - a.limit;
    });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSaveBudget = (catId: string) => {
    const newLimit = parseFloat(editValue) || 0;
    updateGoals({
      categoryLimits: {
        ...goals.categoryLimits,
        [catId]: newLimit
      }
    });
    setEditingCatId(null);
  };

  const startEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditValue(currentLimit > 0 ? currentLimit.toString() : '');
  };

  const getProgressBarColor = (percent: number) => {
    if (percent > 90) return 'bg-[var(--danger-color)]';
    if (percent > 70) return 'bg-[var(--warning-color)]';
    return 'bg-[var(--success-color)]';
  };

  const nextMonth = () => setCurrentDate(d => addMonths(d, 1));
  const prevMonth = () => setCurrentDate(d => subMonths(d, 1));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Resumos & Orçamentos</h1>
          <p className="text-secondary">Acompanhe seus limites de gastos</p>
        </div>
        
        {/* Dropdown/Seletor de Mês Customizado */}
        <div className="flex items-center gap-3 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-2">
          <button className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-secondary transition-colors" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>
          <div className="font-medium min-w-[120px] text-center capitalize text-[var(--text-primary)]">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <button className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] text-secondary transition-colors" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-6 text-primary">Orçado x Realizado (Mensal)</h3>
        
        {orcamentoXRealizado.length > 0 ? (
          <div className="flex flex-col gap-6">
            {orcamentoXRealizado.map(cat => (
              <div key={cat.id} className="flex flex-col gap-2 p-3 -mx-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: cat.color }} />
                    <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
                  </div>
                  
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        className="form-control"
                        style={{ width: 120, padding: '0.25rem 0.5rem', height: 32 }}
                        placeholder="0.00"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveBudget(cat.id);
                          if (e.key === 'Escape') setEditingCatId(null);
                        }}
                      />
                      <button className="p-1.5 rounded bg-[var(--success-color)] text-[#000]" onClick={() => handleSaveBudget(cat.id)}>
                        <Check size={16} />
                      </button>
                      <button className="p-1.5 rounded bg-[var(--surface-hover)] text-secondary" onClick={() => setEditingCatId(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-3 cursor-pointer group/edit"
                      onClick={() => startEdit(cat.id, cat.limit)}
                    >
                      <div className="text-sm font-medium">
                        <span className="text-[var(--text-primary)]">{formatCurrency(cat.spent)}</span>
                        {cat.limit > 0 ? (
                          <span className="text-secondary font-normal"> / {formatCurrency(cat.limit)}</span>
                        ) : (
                          <span className="text-muted font-normal text-xs ml-2 italic">Sem limite</span>
                        )}
                      </div>
                      <button className="p-1.5 rounded bg-[rgba(255,255,255,0.05)] text-secondary opacity-0 group-hover:opacity-100 group-hover/edit:text-primary transition-all">
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {cat.limit > 0 && (
                  <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2.5 overflow-hidden mt-1">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressBarColor(cat.percent)}`} 
                      style={{ width: `${Math.min(cat.percent, 100)}%` }}
                    ></div>
                  </div>
                )}
                
                {cat.limit > 0 && cat.isOverLimit && (
                  <div className="text-xs text-[var(--danger-color)] flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle size={12} /> Limite ultrapassado em {formatCurrency(cat.spent - cat.limit)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-8">
            Nenhuma categoria de despesa cadastrada.
          </div>
        )}
      </div>
    </div>
  );
}
