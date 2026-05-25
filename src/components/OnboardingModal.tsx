import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { supabase } from '../services/supabase';
import { Wallet, Target, Landmark, ChevronRight, Check } from 'lucide-react';
import type { Account } from '../types';

export function OnboardingModal() {
  const { user } = useAuth();
  const { updateSettings, updateGoals, addAccount } = useStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Preferences
  const [currency, setCurrency] = useState('BRL');
  const [theme, setTheme] = useState<'dark'|'light'>('dark');

  // Step 2: Goals
  const [economyPercent, setEconomyPercent] = useState('20');

  // Step 3: Initial Account
  const [accName, setAccName] = useState('Minha Conta');
  const [accType, setAccType] = useState<Account['type']>('checking');
  const [accBalance, setAccBalance] = useState('');

  // Se o usuário não estiver logado ou já completou o onboarding, não renderizar o modal.
  // Note: a lógica de exibir ou não também pode ser controlada pelo Layout.
  if (!user || user?.user_metadata?.onboarding_completed) {
    return null;
  }

  const handleNext = () => setStep(s => s + 1);

  const handleFinish = async () => {
    setLoading(true);

    // Save preferences
    updateSettings({ currency, theme });
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save goals
    updateGoals({ monthlyEconomyPercent: Number(economyPercent) || 0 });

    // Create initial account
    if (accName) {
      await addAccount({
        name: accName,
        type: accType,
        balance: parseFloat(accBalance) || 0,
        color: '#3b82f6'
      });
    }

    // Update user metadata so this doesn't show again
    await supabase.auth.updateUser({
      data: { onboarding_completed: true }
    });

    setLoading(false);
    // Reload page to ensure states are clean or rely on reactive state.
    // Reactive state in Layout will hide this component automatically since user_metadata updates.
    window.location.reload(); 
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-content max-w-md w-full animate-fade-in p-8 text-center flex flex-col items-center">
        
        {step === 1 && (
          <div className="flex flex-col items-center w-full animate-fade-in">
            <div className="w-16 h-16 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full flex items-center justify-center mb-6">
              <Wallet size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao FinControl!</h2>
            <p className="text-secondary mb-8 text-sm">
              Vamos configurar sua conta rapidamente para você começar da melhor forma.
            </p>
            
            <div className="w-full text-left space-y-4 mb-8">
              <div className="form-group mb-0">
                <label className="form-label">Moeda Principal</label>
                <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano (US$)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Tema de Preferência</label>
                <select className="form-control" value={theme} onChange={e => setTheme(e.target.value as any)}>
                  <option value="dark">Escuro (Recomendado)</option>
                  <option value="light">Claro</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary w-full flex justify-center items-center gap-2 h-12" onClick={handleNext}>
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center w-full animate-fade-in">
            <div className="w-16 h-16 bg-[var(--success-color)]/10 text-[var(--success-color)] rounded-full flex items-center justify-center mb-6">
              <Target size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Meta de Economia</h2>
            <p className="text-secondary mb-8 text-sm">
              Qual porcentagem da sua renda mensal você gostaria de poupar ou investir?
            </p>
            
            <div className="w-full text-left space-y-4 mb-8">
              <div className="form-group mb-0 relative">
                <input 
                  type="number" 
                  className="form-control text-2xl h-14 font-bold text-center pr-8" 
                  value={economyPercent} 
                  onChange={e => setEconomyPercent(e.target.value)}
                  min="0" max="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-secondary">%</span>
              </div>
            </div>

            <button className="btn btn-primary w-full flex justify-center items-center gap-2 h-12" onClick={handleNext}>
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center w-full animate-fade-in">
            <div className="w-16 h-16 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-full flex items-center justify-center mb-6">
              <Landmark size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Primeira Conta</h2>
            <p className="text-secondary mb-8 text-sm">
              Crie sua conta principal e informe o saldo atual para darmos início.
            </p>
            
            <div className="w-full text-left space-y-4 mb-8">
              <div className="form-group mb-0">
                <label className="form-label">Nome da Conta</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={accName} 
                  onChange={e => setAccName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Carteira..."
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Tipo</label>
                <select className="form-control" value={accType} onChange={e => setAccType(e.target.value as any)}>
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Saldo Atual (R$)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={accBalance} 
                  onChange={e => setAccBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <button 
              className="btn btn-primary w-full flex justify-center items-center gap-2 h-12" 
              onClick={handleFinish}
              disabled={loading || !accName}
            >
              {loading ? 'Finalizando...' : 'Concluir e Acessar'} <Check size={18} />
            </button>
          </div>
        )}

        {/* Indicadores de Passo */}
        <div className="flex gap-2 mt-8">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${step === i ? 'w-8 bg-[var(--primary-color)]' : 'w-2 bg-[var(--border-color)]'}`} 
            />
          ))}
        </div>
        
      </div>
    </div>
  );
}
