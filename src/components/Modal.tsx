import React from 'react';
import { XCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-yellow-500 italic uppercase tracking-tighter">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <XCircle className="w-6 h-6 text-gray-500 hover:text-white"/>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
