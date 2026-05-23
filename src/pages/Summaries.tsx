import { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO, isSameMonth } from 'date-fns';
import { AlertCircle } from 'lucide-react';

export function Summaries() {
  const { transactions, categories, goals } = useStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM'));

  const filteredTransactions = transactions.filter(t => 
    isSameMonth(parseISO(t.date), new Date(`${selectedDate}-01T00:00:00`))
  );

  const despesas = filteredTransactions.filter(t => t.type === 'despesa');

  const orcamentoXRealizado = categories
    .filter(c => c.type === 'despesa' || c.type === 'ambos')
    .map(cat => {
      const limit = goals.categoryLimits[cat.id] || 0;
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
    .filter(cat => cat.limit > 0 || cat.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Resumos & Orçamentos</h1>
          <p className="text-secondary">Acompanhe seus limites de gastos</p>
        </div>
        <input 
          type="month" 
          className="form-control" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="card">
        <h3 className="mb-6 text-primary">Orçado x Realizado (Mensal)</h3>
        
        {orcamentoXRealizado.length > 0 ? (
          <div className="flex flex-col gap-6">
            {orcamentoXRealizado.map(cat => (
              <div key={cat.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.color }} />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(cat.spent)} 
                    {cat.limit > 0 && (
                      <span className="text-secondary font-normal"> / {formatCurrency(cat.limit)}</span>
                    )}
                  </div>
                </div>

                {cat.limit > 0 && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${cat.isOverLimit ? 'bg-danger' : cat.percent > 80 ? 'bg-warning' : 'bg-primary'}`} 
                      style={{ width: `${Math.min(cat.percent, 100)}%` }}
                    ></div>
                  </div>
                )}
                
                {cat.limit > 0 && cat.isOverLimit && (
                  <div className="text-xs text-danger flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> Limite ultrapassado em {formatCurrency(cat.spent - cat.limit)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-8">
            Nenhum dado para este mês.
          </div>
        )}
      </div>
    </div>
  );
}
