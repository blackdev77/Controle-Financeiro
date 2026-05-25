import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Excluir', 
  cancelText = 'Cancelar', 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm animate-fade-in" style={{ padding: '1.5rem' }}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--danger-color)]/10 text-[var(--danger-color)] flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
          <p className="text-secondary mb-6 text-sm">
            {message}
          </p>
          <div className="flex w-full gap-3">
            <button 
              className="btn btn-secondary flex-1"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              className="btn flex-1"
              style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
