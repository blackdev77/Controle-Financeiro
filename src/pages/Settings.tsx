import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import type { UserSettings, Goals } from '../types';
import { Download, Upload, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabase';

export function Settings() {
  const { settings, goals, categories, updateSettings, updateGoals } = useStore();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'geral' | 'metas' | 'dados' | 'seguranca'>('geral');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localSettings, setLocalSettings] = useState<UserSettings>({
    ...settings,
    name: settings.name || user?.user_metadata?.name || user?.email || ''
  });
  const [localGoals, setLocalGoals] = useState<Goals>(goals);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Update local state if global state changes externally
  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, ...settings, name: settings.name || prev.name }));
  }, [settings]);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  const isDirty = JSON.stringify({ ...localSettings, name: localSettings.name }) !== JSON.stringify({ ...settings, name: settings.name || localSettings.name }) || 
                  JSON.stringify(localGoals) !== JSON.stringify(goals);

  const handleSettingsChange = (key: keyof UserSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
  };

  const handleGoalsChange = (key: keyof Goals, value: any) => {
    setLocalGoals(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    const data = { settings, goals, categories };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `controle_financeiro_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        alert('Importação temporariamente desabilitada devido à migração para a nuvem.');
      } catch (err) {
        alert("Erro ao importar o arquivo. Verifique se é um arquivo JSON válido do sistema.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    updateGoals(localGoals);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess('Senha atualizada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    }
  };

  return (
    <div>
      <h1 className="mb-6 tracking-tight">Configurações</h1>

      <div className="card p-0 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Settings */}
        <div className="w-full md:w-64 border-r border-[var(--border-color)]">
          <button 
            className={`w-full text-left px-6 py-4 font-medium transition-colors ${activeTab === 'geral' ? 'text-[var(--primary-color)] bg-[rgba(255,255,255,0.02)] border-r-2 border-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.02)]'}`}
            onClick={() => setActiveTab('geral')}
          >
            Geral
          </button>
          <button 
            className={`w-full text-left px-6 py-4 font-medium transition-colors ${activeTab === 'metas' ? 'text-[var(--primary-color)] bg-[rgba(255,255,255,0.02)] border-r-2 border-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.02)]'}`}
            onClick={() => setActiveTab('metas')}
          >
            Metas e Orçamento
          </button>
          <button 
            className={`w-full text-left px-6 py-4 font-medium transition-colors ${activeTab === 'dados' ? 'text-[var(--primary-color)] bg-[rgba(255,255,255,0.02)] border-r-2 border-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.02)]'}`}
            onClick={() => setActiveTab('dados')}
          >
            Dados (Backup)
          </button>
          <button 
            className={`w-full text-left px-6 py-4 font-medium transition-colors ${activeTab === 'seguranca' ? 'text-[var(--primary-color)] bg-[rgba(255,255,255,0.02)] border-r-2 border-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.02)]'}`}
            onClick={() => setActiveTab('seguranca')}
          >
            Segurança
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8">
          {activeTab === 'geral' && (
            <div className="space-y-6 animate-fade-in w-full max-w-2xl">
              <h2 className="text-xl mb-4 tracking-tight">Configurações Gerais</h2>
              
              <div className="form-group w-full">
                <label className="form-label">Nome de Exibição</label>
                <input 
                  type="text" 
                  className="form-control w-full max-w-full" 
                  value={localSettings.name}
                  onChange={(e) => handleSettingsChange('name', e.target.value)}
                  style={{ width: '100%', minWidth: '100%' }}
                />
              </div>

              <div className="form-group max-w-md">
                <label className="form-label">Moeda Padrão</label>
                <select 
                  className="form-control"
                  value={localSettings.currency}
                  onChange={(e) => handleSettingsChange('currency', e.target.value)}
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div className="form-group max-w-md">
                <label className="form-label">Tema</label>
                <select 
                  className="form-control"
                  value={localSettings.theme}
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'metas' && (
            <div className="space-y-6 animate-fade-in w-full max-w-2xl">
              <h2 className="text-xl mb-4 tracking-tight">Metas de Economia</h2>
              
              <div className="form-group">
                <label className="form-label">Percentual de Economia Mensal (%)</label>
                <p className="text-sm text-secondary mb-2">Qual porcentagem da sua receita você deseja guardar/investir por mês?</p>
                <input 
                  type="number" 
                  className="form-control max-w-[200px]" 
                  min="0" max="100"
                  value={localGoals.monthlyEconomyPercent}
                  onChange={(e) => handleGoalsChange('monthlyEconomyPercent', Number(e.target.value))}
                />
              </div>

              <div className="mt-8">
                <h3 className="text-lg mb-4 tracking-tight">Limites por Categoria</h3>
                <p className="text-sm text-secondary mb-4">Defina alertas de gastos máximos para categorias específicas.</p>
                
                {categories.filter(c => c.type === 'despesa' || c.type === 'ambos').map(cat => (
                  <div key={cat.id} className="flex items-center justify-between mb-4 bg-[rgba(255,255,255,0.02)] p-3 rounded-[var(--radius-md)] border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.color }} />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-secondary text-sm">R$</span>
                      <input 
                        type="number" 
                        className="form-control !py-1 !px-2 w-28 text-right" 
                        placeholder="Sem limite"
                        value={localGoals.categoryLimits[cat.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          const newLimits = { ...localGoals.categoryLimits };
                          if (val === undefined) {
                            delete newLimits[cat.id];
                          } else {
                            newLimits[cat.id] = val;
                          }
                          handleGoalsChange('categoryLimits', newLimits);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dados' && (
            <div className="space-y-6 animate-fade-in w-full max-w-2xl">
              <h2 className="text-xl mb-4 tracking-tight">Gerenciamento de Dados</h2>
              <p className="text-secondary mb-6">Como seus dados agora são salvos na nuvem (Supabase), o backup físico é opcional.</p>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <button className="btn btn-secondary flex-1" onClick={handleExport}>
                  <Download size={18} /> Exportar Backup (JSON)
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  style={{ display: 'none' }} 
                />
                <button className="btn btn-secondary flex-1" onClick={handleImportClick}>
                  <Upload size={18} /> Importar Backup
                </button>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="space-y-6 animate-fade-in w-full max-w-2xl">
              <h2 className="text-xl mb-4 tracking-tight">Segurança</h2>
              <p className="text-secondary mb-6">Altere sua senha de acesso ao sistema.</p>
              
              <div className="form-group max-w-md">
                <label className="form-label">Nova Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-control pr-10" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
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

              <div className="form-group max-w-md">
                <label className="form-label">Confirmar Nova Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-control pr-10" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="text-[var(--danger-color)] text-sm mb-4">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="text-[var(--success-color)] text-sm mb-4">
                  {passwordSuccess}
                </div>
              )}

              <button 
                className="btn btn-primary"
                onClick={handleUpdatePassword}
                disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6 || updatingPassword}
              >
                {updatingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          )}

          {activeTab !== 'seguranca' && (
            <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-end gap-4">
              {saved && <span className="text-[var(--success-color)] text-sm font-medium animate-fade-in">Configurações salvas!</span>}
              <button 
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={saveSettings}
                disabled={!isDirty}
              >
                Salvar Alterações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
