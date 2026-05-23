import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="card h-full flex flex-col">
      <h3 className="text-secondary mb-4" style={{ fontSize: '1rem' }}>{title}</h3>
      <div className="flex-1" style={{ minHeight: '250px' }}>
        {children}
      </div>
    </div>
  );
}
