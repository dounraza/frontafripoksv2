import React from 'react';
import { AlertCircle, X, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, type = 'error', onClose }) => {
  const config = {
    error: {
      icon: <AlertCircle className="w-6 h-6 text-red-500" />,
      border: 'border-red-500/50',
      bg: 'from-red-950/20 to-black',
      title: 'Erreur'
    },
    success: {
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      border: 'border-green-500/50',
      bg: 'from-green-950/20 to-black',
      title: 'Succès'
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-500" />,
      border: 'border-blue-500/50',
      bg: 'from-blue-950/20 to-black',
      title: 'Information'
    }
  };

  const current = config[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`relative w-full max-w-sm bg-gradient-to-br ${current.bg} border-2 ${current.border} rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-white/5 rounded-2xl">
            {current.icon}
          </div>
          
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">
              {current.title}
            </h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-4 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-lg"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};
