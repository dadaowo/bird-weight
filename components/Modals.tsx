import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 className="text-xl font-bold text-stone-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-5 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, type = 'danger' 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-stone-600 font-medium hover:bg-stone-200 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors ${
              type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            確認{title}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${type === 'danger' ? 'bg-rose-100 text-rose-500' : 'bg-amber-100 text-amber-600'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-stone-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
