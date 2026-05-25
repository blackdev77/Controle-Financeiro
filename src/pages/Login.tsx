import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-4">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[var(--surface-hover)] p-3 rounded-2xl mb-4 text-[var(--primary-color)]">
            <Wallet size={32} />
          </div>
          <h1 className="text-2xl mb-2 text-center">Bem-vindo ao FinControl</h1>
          <p className="text-secondary text-center">Acesse sua conta para continuar</p>
        </div>

        {error && (
          <div className="bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/20 text-[var(--danger-color)] p-3 rounded-lg mb-6 flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="form-group mb-4">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="form-group mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label !mb-0">Senha</label>
              <a href="#" className="text-sm text-[var(--primary-color)] hover:underline" onClick={(e) => { e.preventDefault(); alert('Funcionalidade em desenvolvimento'); }}>
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-secondary">
          Ainda não tem uma conta?{' '}
          <Link to="/register" className="text-[var(--primary-color)] font-medium hover:underline">
            Crie sua conta
          </Link>
        </p>
      </div>
    </div>
  );
}
