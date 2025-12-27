import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AppTheme } from '../types';
import { THEME_STYLES } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme: AppTheme;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, theme }) => {
  if (!isOpen) return null;

  const styles = THEME_STYLES[theme];

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className={`relative w-full max-w-2xl md:min-h-[500px] ${styles.card} border ${styles.border} rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col`}>
        <div className={`flex items-center justify-between p-4 border-b ${styles.border}`}>
          <h2 className={`text-lg font-bold ${styles.text}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:${styles.bg} ${styles.subText} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
