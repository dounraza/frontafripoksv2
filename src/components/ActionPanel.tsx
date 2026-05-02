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
    console.log(`Action: ${type}, Amount: ${amount}`);
    if (type === 'all-in') playSound('allin');
    else playSound(type as any);
    sendAction(type, amount);
  };

  return (
    <div className={`relative flex flex-col gap-1.5 p-2 pb-4 bg-black/90 rounded-t-2xl border-t border-white/10 backdrop-blur-xl shadow-2xl transition-all ${isMyTurn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        
        {/* PRESET RAISES + INPUT */}
        {isMyTurn && (
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {[100, 500, 1000, 5000].map(amt => (
              <button 
                key={amt} 
                onClick={() => adjustRaise(amt)}
                className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold text-gray-300"
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-1.5 w-full items-center">
            <input 
              type="number" 
              value={raiseAmount || ''} 
              onChange={(e) => setRaiseAmount(e.target.value === '' ? 0 : Number(e.target.value))} 
              className="col-span-1 h-full bg-black/40 text-white font-black px-2 rounded-lg border border-white/10 text-center text-[10px] focus:border-yellow-500 outline-none" 
              placeholder="Mise"
            />
            <button 
              onClick={() => { console.log('Raise clicked'); handleAction('raise', raiseAmount); }} 
              className="col-span-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-black uppercase text-[10px] shadow-[0_0_10px_rgba(234,179,8,0.3)]"
            >
              Raise {raiseAmount > 0 ? raiseAmount.toLocaleString() : ''}
            </button>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          <button onClick={() => handleAction('fold')} className="py-2 bg-red-500/10 border border-red-500/30 rounded-lg font-black text-red-500 uppercase text-[10px]">Fold</button>
          <button onClick={() => handleAction(callAmount > 0 ? 'call' : 'check')} className="py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg font-black text-blue-500 uppercase text-[10px]">
            {callAmount > 0 ? `Call ${callAmount.toLocaleString()}` : 'Check'}
          </button>
          <button onClick={() => handleAction('all-in')} className="py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg font-black text-yellow-500 uppercase text-[10px]">All-In</button>
        </div>
    </div>
  );
};
