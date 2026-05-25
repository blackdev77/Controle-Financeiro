import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Category } from '../types';

const DEFAULT_COLORS = ['#34D399', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#eab308', '#ef4444'];

export function CategoryModal() {
  const { isCategoryModalOpen, categoryToEdit, closeCategoryModal, addCategory, updateCategory, categories } = useStore();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'receita' | 'despesa' | 'ambos'>('despesa');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type as any);
      setColor(categoryToEdit.color && categoryToEdit.color !== '#94a3b8' ? categoryToEdit.color : DEFAULT_COLORS[0]);
    } else {
      setName('');
      setType('despesa');
      const nextColor = DEFAULT_COLORS[categories.length % DEFAULT_COLORS.length];
      setColor(nextColor);
    }
  }, [categoryToEdit, isCategoryModalOpen, categories.length]);

  if (!isCategoryModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    if (categoryToEdit) {
      await updateCategory(categoryToEdit.id, {
        name,
        type,
        color
      });
    } else {
      await addCategory({
        name,
        type,
        color,
        icon: 'Tag'
      });
    }
    
    closeCategoryModal();
  };

  return (
    <div className="modal-overlay" onClick={closeCategoryModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="m-0 text-xl font-medium tracking-tight text-primary">
            {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button onClick={closeCategoryModal} className="text-secondary hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="flex items-center gap-4 mb-6 justify-center">
              <div 
                style={{ 
                  backgroundColor: `${color}20`, 
                  color: color,
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Tag size={32} />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Nome da Categoria</label>
              <input 
                type="text" 
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Alimentação, Transporte..."
              />
            </div>
            
            <div className="form-group mb-4">
              <label className="form-label">Tipo</label>
              <select 
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Cor</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DEFAULT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              <div className="flex gap-3 items-center mt-2">
                <input 
                  type="color" 
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="text-xs text-secondary">Cor customizada</span>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeCategoryModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
