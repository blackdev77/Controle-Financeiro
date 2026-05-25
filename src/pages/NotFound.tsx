import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 animate-fade-in">
      <div className="w-24 h-24 bg-[var(--danger-color)]/10 text-[var(--danger-color)] rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={48} />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">Página não encontrada</h1>
      <p className="text-secondary max-w-md mb-8">
        A página que você está procurando não existe ou foi movida. Verifique o endereço digitado ou volte para o início.
      </p>
      <button 
        className="btn btn-primary"
        onClick={() => navigate('/')}
      >
        <LayoutDashboard size={20} className="mr-2" />
        Voltar para o Dashboard
      </button>
    </div>
  );
}
