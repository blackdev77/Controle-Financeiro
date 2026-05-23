import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const openTransactionModal = useStore(state => state.openTransactionModal);
  const settings = useStore(state => state.settings);
  const fetchData = useStore(state => state.fetchData);
  const initialized = useStore(state => state.initialized);
  const loading = useStore(state => state.loading);
  const { user, signOut } = useAuth();
  
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

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
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#050505] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="sidebar-header">
          <Wallet className="text-primary" size={28} />
          <h2 className="m-0" style={{ marginBottom: 0, fontSize: '1.25rem' }}>FinControl</h2>
          <button 
            className="md:hidden" 
            style={{ marginLeft: 'auto' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
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
          onClick={() => openTransactionModal()}
        >
          <Plus size={28} />
        </button>

        <TransactionModal />
      </main>
    </div>
  );
}
