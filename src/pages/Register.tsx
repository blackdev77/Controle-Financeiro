import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError('Você precisa concordar com os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Sua senha deve ter no mínimo 8 caracteres, contendo pelo menos 1 letra e 1 número.');
      return;
    }

    setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      if (data.session) {
        navigate('/'); // Login automático
      } else {
        setSuccess(true); // Precisará confirmar o email
      }
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
          <h1 className="text-2xl mb-2 text-center">Criar Conta</h1>
          <p className="text-secondary text-center">Comece a controlar seu futuro financeiro</p>
        </div>

        {error && (
          <div className="bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/20 text-[var(--danger-color)] p-3 rounded-lg mb-6 flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center p-6 bg-[var(--success-color)]/10 border border-[var(--success-color)]/20 rounded-xl">
            <h3 className="text-[var(--success-color)] font-semibold mb-2">Conta criada com sucesso!</h3>
            <p className="text-sm text-secondary mb-6">Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada.</p>
            <Link to="/login" className="btn btn-primary w-full">Ir para o Login</Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
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
              <label className="form-label">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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

            <div className="form-group mb-6 flex items-start gap-2">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="text-sm text-secondary cursor-pointer leading-tight">
                Concordo com os <a href="#" className="text-[var(--primary-color)] hover:underline" onClick={e => e.preventDefault()}>Termos de Uso</a> e a <a href="#" className="text-[var(--primary-color)] hover:underline" onClick={e => e.preventDefault()}>Política de Privacidade</a>.
              </label>
            </div>

            <button  
              type="submit" 
              className="btn btn-primary w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar minha conta grátis'}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm text-secondary">
          Já possui uma conta?{' '}
          <Link to="/login" className="text-[var(--primary-color)] font-medium hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
