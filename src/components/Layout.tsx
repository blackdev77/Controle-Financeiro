import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Landmark,
  Tags, 
  CalendarDays, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Wallet,
  Plus,
  LogOut
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { TransactionModal } from './TransactionModal';
import { OnboardingModal } from './OnboardingModal';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const openTransactionModal = useStore(state => state.openTransactionModal);
  const openAccountModal = useStore(state => state.openAccountModal);
  const openCategoryModal = useStore(state => state.openCategoryModal);
  const settings = useStore(state => state.settings);
  const fetchData = useStore(state => state.fetchData);
  const initialized = useStore(state => state.initialized);
  const loading = useStore(state => state.loading);
  const { user, signOut } = useAuth();
  
  const location = useLocation();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const handleFabClick = () => {
    if (location.pathname === '/accounts') {
      openAccountModal();
    } else if (location.pathname === '/categories') {
      openCategoryModal();
    } else if (location.pathname === '/summaries') {
      document.dispatchEvent(new CustomEvent('openBudgetModal'));
    } else {
      openTransactionModal();
    }
  };

  const showFab = !['/reports', '/settings'].includes(location.pathname);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    if (user && !initialized && !loading) {
      fetchData();
    }
  }, [user, initialized, loading, fetchData]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowRightLeft, label: 'Lançamentos' },
    { to: '/accounts', icon: Landmark, label: 'Contas' },
    { to: '/categories', icon: Tags, label: 'Categorias' },
    { to: '/summaries', icon: CalendarDays, label: 'Resumos' },
    { to: '/reports', icon: BarChart3, label: 'Relatórios' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="app-container">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setSidebarOpen(false)}
          style={{ zIndex: 35 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#050505] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center p-6 border-b border-[var(--border-color)]">
          <Wallet className="text-primary mr-3" size={28} />
          <h2 className="m-0 text-xl font-medium tracking-tight">FinControl</h2>
          <button 
            className="md:hidden ml-auto" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>
        
        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[rgba(255,255,255,0.05)] text-primary font-medium' : 'text-secondary hover:bg-[rgba(255,255,255,0.02)] hover:text-primary'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-color)]">
        {/* Header */}
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--surface-color)] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} className="text-primary" />
            </button>
            <h2 style={{ marginBottom: 0 }}>Olá, {userName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2 hidden md:flex">
              <span className="text-sm font-semibold leading-tight">{userName}</span>
              <span className="text-xs text-secondary leading-tight">{user?.email}</span>
            </div>
            {/* Quick Actions / Avatar */}
            <div 
              style={{
                width: 36, height: 36, 
                borderRadius: '50%', 
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '600'
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={signOut}
              className="text-secondary hover:text-danger ml-2 transition-colors"
              title="Sair da conta"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="content-scroll animate-fade-in">
          <Outlet />
        </div>
        
        {/* Global FAB */}
        {showFab && (
          <button 
            className="btn btn-primary" 
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              zIndex: 40
            }}
            onClick={handleFabClick}
          >
            <Plus size={28} />
          </button>
        )}

        <TransactionModal />
        <OnboardingModal />
      </main>
    </div>
  );
}
