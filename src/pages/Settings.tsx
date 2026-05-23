import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { UserSettings, Goals } from '../types';
import { Download, Upload } from 'lucide-react';

export function Settings() {
  const { settings, goals, categories, updateSettings, updateGoals } = useStore();
  const [activeTab, setActiveTab] = useState<'geral' | 'metas' | 'dados'>('geral');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSettingsChange = (key: keyof UserSettings, value: any) => {
    updateSettings({ [key]: value });
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
  };

  const handleGoalsChange = (key: keyof Goals, value: any) => {
    updateGoals({ [key]: value });
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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8">
          {activeTab === 'geral' && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <h2 className="text-xl mb-4 tracking-tight">Configurações Gerais</h2>
              
              <div className="form-group">
                <label className="form-label">Nome de Exibição</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={settings.name}
                  onChange={(e) => handleSettingsChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Moeda Padrão</label>
                <select 
                  className="form-control"
                  value={settings.currency}
                  onChange={(e) => handleSettingsChange('currency', e.target.value)}
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tema</label>
                <select 
                  className="form-control"
                  value={settings.theme}
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'metas' && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <h2 className="text-xl mb-4 tracking-tight">Metas de Economia</h2>
              
              <div className="form-group">
                <label className="form-label">Percentual de Economia Mensal (%)</label>
                <p className="text-sm text-secondary mb-2">Qual porcentagem da sua receita você deseja guardar/investir por mês?</p>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0" max="100"
                  value={goals.monthlyEconomyPercent}
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
                        className="form-control !py-1 !px-2 w-24 text-right" 
                        placeholder="Sem limite"
                        value={goals.categoryLimits[cat.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          const newLimits = { ...goals.categoryLimits };
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
            <div className="space-y-6 animate-fade-in max-w-xl">
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

          <div className="mt-8 pt-6 border-t border-border-color flex items-center justify-end gap-4">
            {saved && <span className="text-success text-sm font-medium animate-fade-in">Configurações salvas!</span>}
            <button className="btn btn-primary" onClick={saveSettings}>Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
}
