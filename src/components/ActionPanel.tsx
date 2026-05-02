import React, { useState, useEffect } from 'react';
import { useSound } from '../hooks/useSound';

interface ActionPanelProps {
  sendAction: (type: string, amount?: number) => void;
  callAmount: number;
  isMyTurn: boolean;
  minBuyIn?: number;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ sendAction, callAmount, isMyTurn, minBuyIn = 1000 }) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  const { playSound } = useSound();

  // Initialiser le montant de relance quand c'est mon tour
  useEffect(() => {
    if (isMyTurn) {
      // Minimum raise est généralement callAmount + bigBlind, ou au moins 2x callAmount
      const minRaise = callAmount > 0 ? callAmount * 2 : 200;
      setRaiseAmount(minRaise);
    }
  }, [isMyTurn, callAmount]);

  const adjustRaise = (amount: number) => {
    setRaiseAmount(prev => Math.max(0, prev + amount));
  };

  const handleAction = (type: string, amount?: number) => {
    if (type === 'all-in') playSound('allin');
    else playSound(type as any);
    sendAction(type, amount);
  };

  return (
    <div className={`relative flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-black/80 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl transition-all ${isMyTurn ? 'opacity-100 scale-100' : 'opacity-40 pointer-events-none scale-95'}`}>
        {/* PRESET RAISES */}
        {isMyTurn && (
          <div className="grid grid-cols-3 gap-1.5 w-full justify-center mb-2">
            {[100, 500, 1000, 5000].map(amt => (
              <button 
                key={amt} 
                onClick={() => adjustRaise(amt)}
                className="px-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[9px] font-bold text-gray-300 transition-colors"
              >
                +{amt.toLocaleString()}
              </button>
            ))}
            <button 
              onClick={() => setRaiseAmount(callAmount * 2 || 400)}
              className="px-1 py-1.5 col-span-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-md text-[9px] font-bold text-yellow-500 transition-colors"
            >
              Relance 2x
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 w-full max-w-[400px]">
          <button 
            onClick={() => handleAction('fold')} 
            className="py-2.5 sm:py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-black text-red-500 uppercase text-[10px] sm:text-xs transition-all active:scale-95"
          >
            Fold
          </button>
          <button 
            onClick={() => handleAction(callAmount > 0 ? 'call' : 'check')} 
            className="py-2.5 sm:py-3.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl font-black text-blue-500 uppercase text-[10px] sm:text-xs transition-all active:scale-95"
          >
            {callAmount > 0 ? `Call ${callAmount.toLocaleString()}` : 'Check'}
          </button>
          <button 
            onClick={() => handleAction('all-in')} 
            className="py-2.5 sm:py-3.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl font-black text-yellow-500 uppercase text-[10px] sm:text-xs transition-all active:scale-95"
          >
            All-In
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-[400px] mt-1">
          <div className="relative flex-1 flex items-center">
            <input 
              type="number" 
              value={raiseAmount || ''} 
              onChange={(e) => setRaiseAmount(e.target.value === '' ? 0 : Number(e.target.value))} 
              className="w-full bg-black/40 text-white font-black py-2.5 sm:py-3 px-4 rounded-xl border border-white/10 text-center text-sm sm:text-base focus:border-yellow-500 outline-none transition-colors"
              placeholder="Montant..."
            />
          </div>
          <button 
            onClick={() => handleAction('raise', raiseAmount)} 
            className="px-6 sm:px-10 bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 sm:py-3 rounded-xl font-black uppercase text-xs sm:text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          >
            Raise {raiseAmount > 0 ? raiseAmount.toLocaleString() : ''}
          </button>
        </div>
    </div>
  );
};
