import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChartCard } from '../components/ChartCard';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function Reports() {
  const { transactions, categories } = useStore();
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Outros';
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#94a3b8';

  const yearTransactions = transactions.filter(t => getYear(parseISO(t.date)) === selectedYear);

  // Line Chart Data: Receitas x Despesas por Mês
  const monthlyData = Array.from({ length: 12 }).map((_, i) => {
    const monthTrans = yearTransactions.filter(t => getMonth(parseISO(t.date)) === i);
    const rec = monthTrans.filter(t => t.type === 'receita').reduce((a, b) => a + b.amount, 0);
    const des = monthTrans.filter(t => t.type === 'despesa').reduce((a, b) => a + b.amount, 0);
    return {
      name: format(new Date(selectedYear, i, 1), 'MMM', { locale: ptBR }).toUpperCase(),
      Receitas: rec,
      Despesas: des
    };
  });

  // Pie Chart Data: Despesas por Categoria
  const gastosPorCategoria: Record<string, number> = {};
  yearTransactions.filter(t => t.type === 'despesa').forEach(t => {
    gastosPorCategoria[t.categoryId] = (gastosPorCategoria[t.categoryId] || 0) + t.amount;
  });

  const categoryPieData = Object.entries(gastosPorCategoria)
    .map(([id, amount]) => ({
      name: getCategoryName(id),
      value: amount,
      color: getCategoryColor(id)
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Bar Chart Data: Maiores Despesas
  const topExpensesData = [...categoryPieData].slice(0, 7);

  // Metrics
  const totalDespesas = categoryPieData.reduce((acc, curr) => acc + curr.value, 0);
  const mediaMensalDespesas = totalDespesas / 12; // Simple average for the year

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ marginBottom: 0 }}>Relatórios Analíticos</h1>
          <p className="text-secondary">Visão detalhada do seu desempenho em {selectedYear}</p>
        </div>
        <select 
          className="form-control" 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{ width: 120 }}
        >
          {Array.from({length: 5}).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6 md:grid-cols-1">
        <div className="card">
          <h3 className="text-secondary mb-2 text-sm">Total Gasto ({selectedYear})</h3>
          <div className="text-2xl font-bold text-danger">{formatCurrency(totalDespesas)}</div>
        </div>
        <div className="card">
          <h3 className="text-secondary mb-2 text-sm">Média de Gasto Mensal</h3>
          <div className="text-2xl font-bold text-warning">{formatCurrency(mediaMensalDespesas)}</div>
        </div>
        <div className="card">
          <h3 className="text-secondary mb-2 text-sm">Maior Gasto</h3>
          <div className="text-2xl font-bold">{topExpensesData[0] ? topExpensesData[0].name : '-'}</div>
          {topExpensesData[0] && <div className="text-muted text-sm">{formatCurrency(topExpensesData[0].value)}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <ChartCard title="Evolução Mensal (Receitas x Despesas)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend />
              <Line type="monotone" dataKey="Receitas" stroke="var(--success-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Despesas" stroke="var(--danger-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-1 mb-6">
        <ChartCard title="Composição de Despesas">
          {categoryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(props) => {
                    const percentVal = props?.percent || 0;
                    return `${props.name} (${(percentVal * 100).toFixed(0)}%)`;
                  }}
                  labelLine={false}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted">Sem dados para exibir.</div>
          )}
        </ChartCard>

        <ChartCard title="Top Categorias (Gastos)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topExpensesData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
              <XAxis type="number" tickFormatter={(value) => `R$${value}`} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={80} />
              <Tooltip 
                cursor={{ fill: 'var(--surface-hover)' }}
                contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                {topExpensesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

    </div>
  );
}
