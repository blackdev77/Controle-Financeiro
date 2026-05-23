import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorClass?: string;
}

export function StatCard({ title, value, icon, trend, colorClass = 'text-primary' }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-secondary m-0" style={{ fontSize: '0.875rem', marginBottom: 0 }}>{title}</h3>
        <div className={colorClass}>{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      {trend && (
        <div className="flex items-center gap-2" style={{ fontSize: '0.75rem' }}>
          <span className={trend.isPositive ? 'text-success' : 'text-danger'}>
            {trend.value}
          </span>
          <span className="text-muted">vs mês passado</span>
        </div>
      )}
    </div>
  );
}
