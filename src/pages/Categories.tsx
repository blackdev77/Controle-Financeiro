import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Category } from '../types';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CategoryModal } from '../components/CategoryModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function Categories() {
  const { categories, transactions, openCategoryModal, deleteCategory } = useStore();

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  const handleDeleteClick = (cat: Category) => {
    setCategoryToDelete(cat);
  };

  const getTransactionsCount = (catId: string) => {
    return transactions.filter(t => t.categoryId === catId).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ marginBottom: 0 }}>Categorias</h1>
          <p className="text-secondary">Gerencie como você classifica seus lançamentos</p>
        </div>
        <button className="btn btn-primary md:hidden" onClick={() => openCategoryModal()}>
          <Plus size={18} /> Nova
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat: Category) => {
          const IconComp = (Icons as any)[cat.icon] || Tag;
          const isGrey = cat.color === '#94a3b8' || !cat.color;
          // Apply a default color dynamically if it's still grey from legacy data
          const displayColor = isGrey ? '#3b82f6' : cat.color;
          
          return (
            <div key={cat.id} className="card flex items-center justify-between group relative hover:border-[rgba(255,255,255,0.15)] transition-colors">
              <div className="flex items-center gap-4">
                <div 
                  style={{ 
                    backgroundColor: `${displayColor}20`, 
                    color: displayColor,
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

              {/* Ações Hover */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button 
                  className="p-2 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-primary"
                  onClick={() => openCategoryModal(cat)}
                  title="Editar categoria"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  className="p-2 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(248,113,113,0.1)] text-danger"
                  onClick={() => handleDeleteClick(cat)}
                  title="Excluir categoria"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CategoryModal />
      <ConfirmModal 
        isOpen={!!categoryToDelete}
        title="Excluir Categoria"
        message={
          categoryToDelete && getTransactionsCount(categoryToDelete.id) > 0
            ? `Esta categoria possui ${getTransactionsCount(categoryToDelete.id)} lançamento(s). Deseja excluí-la mesmo assim? Esta ação não pode ser desfeita.`
            : `Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"? Esta ação não pode ser desfeita.`
        }
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
