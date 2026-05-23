import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Category } from '../types';
import { Plus, Tag } from 'lucide-react';
import * as Icons from 'lucide-react';

export function Categories() {
  const { categories, addCategory } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'receita' | 'despesa' | 'ambos'>('despesa');
  const [newCatColor, setNewCatColor] = useState('#94a3b8');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    
    addCategory({
      name: newCatName,
      type: newCatType,
      color: newCatColor,
      icon: 'Tag' // Default icon
    });
    
    setNewCatName('');
    setNewCatColor('#94a3b8');
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ marginBottom: 0 }}>Categorias</h1>
          <p className="text-secondary">Gerencie como você classifica seus lançamentos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Adicionar Categoria
        </button>
      </div>

      {isAdding && (
        <div className="card mb-6 animate-fade-in border-l-4" style={{ borderLeftColor: 'var(--primary-color)' }}>
          <h3 className="mb-4 text-primary">Nova Categoria</h3>
          <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="form-group flex-1 m-0">
              <label className="form-label">Nome</label>
              <input 
                type="text" 
                className="form-control"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                placeholder="Ex: Pets, Viagem..."
              />
            </div>
            
            <div className="form-group m-0" style={{ minWidth: 150 }}>
              <label className="form-label">Tipo</label>
              <select 
                className="form-control"
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as any)}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>

            <div className="form-group m-0">
              <label className="form-label">Cor</label>
              <input 
                type="color" 
                className="form-control"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: 60, padding: '0.2rem' }}
              />
            </div>

            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat: Category) => {
          const IconComp = (Icons as any)[cat.icon] || Tag;
          
          return (
            <div key={cat.id} className="card flex items-center gap-4">
              <div 
                style={{ 
                  backgroundColor: `${cat.color}20`, 
                  color: cat.color,
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconComp size={24} />
              </div>
              <div>
                <h3 className="m-0" style={{ fontSize: '1rem', marginBottom: 0 }}>{cat.name}</h3>
                <span className="badge mt-1" style={{ fontSize: '0.7rem' }}>
                  {cat.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
