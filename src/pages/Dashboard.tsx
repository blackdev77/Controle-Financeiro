import { format, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Plus, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useStore } from '../store/useStore';

export function Dashboard() {
  const { transactions, categories, accounts, goals, openTransactionModal } = useStore();

  const today = new Date();
  
  // Nível 1: Visão Geral Rápida
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  
  const currentMonthTransactions = transactions.filter(t => 
    isSameMonth(new Date(t.date), today) && t.type !== 'transferencia'
  );

  const monthlyReceitas = currentMonthTransactions
    .filter(t => t.type === 'receita')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyDespesas = currentMonthTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Nível 2: Insights Principais
  // Top Categorias de Despesa
  const despesasPorCategoria = currentMonthTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, curr) => {
      acc[curr.categoryId] = (acc[curr.categoryId] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoriasChartData = Object.entries(despesasPorCategoria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) // Top 4
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Outros',
        value: amount,
        color: cat?.color || '#94a3b8'
      };
    });

  // Nível 3: Fluxo de Caixa Futuro
  const pendingTransactions = transactions
    .filter(t => t.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="tracking-tight" style={{ marginBottom: '0.25rem' }}>Visão Executiva</h1>
          <p className="text-secondary tracking-tight">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => openTransactionModal()}>
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {/* --- NÍVEL 1: Visão Geral --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', color: 'white', borderColor: 'transparent' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="tracking-tight" style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500, margin: 0 }}>Seu patrimônio</h3>
            <DollarSign opacity={0.8} />
          </div>
          <div className="text-4xl font-bold tracking-tight mb-2">{formatCurrency(totalBalance)}</div>
          <div className="text-sm opacity-80 flex gap-2 font-medium">
            Em {accounts.length} conta(s) ativas
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-secondary m-0 tracking-tight" style={{ fontSize: '1.05rem', fontWeight: 500 }}>Entradas no mês</h3>
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--success-color)15', color: 'var(--success-color)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-primary">{formatCurrency(monthlyReceitas)}</div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-secondary m-0 tracking-tight" style={{ fontSize: '1.05rem', fontWeight: 500 }}>Saídas no mês</h3>
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--danger-color)15', color: 'var(--danger-color)' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-primary">{formatCurrency(monthlyDespesas)}</div>
        </div>
      </div>

      {/* --- NÍVEL 2: Insights --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-primary mb-6 tracking-tight" style={{ fontSize: '1.1rem' }}>Onde você mais gastou</h3>
          {categoriasChartData.length > 0 ? (
            <div className="flex items-center h-64">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriasChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoriasChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 flex flex-col gap-3 pl-4">
                {categoriasChartData.map(cat => {
                  const limit = goals?.categoryLimits?.[cat.id];
                  const isOverLimit = limit ? cat.value > limit : false;
                  
                  return (
                    <div key={cat.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color }} />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-sm">{formatCurrency(cat.value)}</span>
                        {isOverLimit && <AlertCircle size={14} className="text-danger mt-1" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted">
              <Target size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">Nenhum movimento registrado.</p>
              <p className="text-xs mt-1 text-center max-w-xs">Registre seu primeiro lançamento para visualizar insights automáticos.</p>
            </div>
          )}
        </div>

        {/* --- NÍVEL 3: Atalhos e Fluxo --- */}
        <div className="card">
          <h3 className="text-primary mb-6 tracking-tight" style={{ fontSize: '1.1rem' }}>Próximos compromissos</h3>
          {pendingTransactions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pendingTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-warning" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{t.description}</span>
                      <span className="text-xs text-muted">{format(new Date(t.date), "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${t.type === 'receita' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted flex-col bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              <AlertCircle size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">Tudo em dia.</p>
              <p className="text-xs mt-1 text-center">Nenhum compromisso financeiro pendente listado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
