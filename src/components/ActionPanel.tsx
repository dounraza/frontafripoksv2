import React, { useState, useEffect } from 'react';
import { useSound } from '../hooks/useSound';
import { getMinRaiseTo, getMaxRaiseTo } from '../utils/pokerLogic';

interface ActionPanelProps {
  sendAction: (type: string, amount?: number) => void;
  callAmount: number;
  isMyTurn: boolean;
  tableData?: any;
  myPlayer?: any;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ sendAction, callAmount, isMyTurn, tableData, myPlayer }) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  const { playSound } = useSound();

  // Initialiser le montant de relance quand c'est mon tour
  useEffect(() => {
    if (isMyTurn) {
      // Utilisation de la règle standard Poker (compatible poker-ts)
      const minRaise = getMinRaiseTo(tableData);
      const maxChips = getMaxRaiseTo(myPlayer);
      
      // On ne peut pas relancer plus que ses jetons
      setRaiseAmount(Math.min(minRaise, maxChips));
    }
  }, [isMyTurn, callAmount, tableData, myPlayer]);

  const adjustRaise = (amount: number) => {
    setRaiseAmount(prev => Math.max(0, prev + amount));
  };

  const handleAction = (type: string, amount?: number) => {
    // Si l'action est 'raise', amount est le montant total voulu sur la table
    const finalAmount = amount !== undefined ? amount : 0;
    
    console.log(`Action: ${type}, TotalAmount: ${finalAmount}`);
    if (type === 'all-in') playSound('allin');
    else playSound(type as any);
    
    // On envoie le montant total au serveur
    sendAction(type, finalAmount);
  };

  return (
    <div className={`relative flex flex-col gap-1.5 p-2 pb-4 bg-white/5 rounded-t-2xl border-t border-white/10 backdrop-blur-xl shadow-2xl transition-all ${isMyTurn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        
        {/* MESSAGE POUR LES JOUEURS EN ATTENTE (REJOINTS TARD) */}
        {!isMyTurn && myPlayer?.status === 'waiting' && tableData?.gameState === 'playing' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-t-2xl">
            <span className="text-yellow-500 font-black uppercase text-xs tracking-widest animate-pulse">
              Attente de la prochaine main...
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <button 
            onClick={() => handleAction('fold')} 
            className="py-2 bg-red-900/60 border-b-4 border-red-950 rounded-lg font-black text-red-200 uppercase text-[10px] active:border-b-0 active:translate-y-[4px] transition-all hover:bg-red-800/60"
          >
            Fold
          </button>
          <button 
            onClick={() => handleAction(callAmount > 0 ? 'call' : 'check')} 
            className="py-2 bg-blue-900/60 border-b-4 border-blue-950 rounded-lg font-black text-blue-200 uppercase text-[10px] active:border-b-0 active:translate-y-[4px] transition-all hover:bg-blue-800/60"
          >
            {callAmount > 0 ? `Call ${callAmount.toLocaleString()}` : 'Check'}
          </button>
          <button 
            onClick={() => handleAction('all-in')} 
            className="py-2 bg-yellow-600/80 border-b-4 border-yellow-900 rounded-lg font-black text-yellow-950 uppercase text-[10px] active:border-b-0 active:translate-y-[4px] transition-all hover:bg-yellow-500/80"
          >
            All-In
          </button>
        </div>

        {isMyTurn && (
          <div className="grid grid-cols-4 gap-1.5 w-full items-center mt-1">
            <input 
              type="number" 
              value={raiseAmount || ''} 
              onChange={(e) => setRaiseAmount(e.target.value === '' ? 0 : Number(e.target.value))} 
              className="col-span-1 h-full bg-black/40 text-yellow-500 font-black px-2 rounded-lg border border-yellow-500/30 text-center text-[10px] focus:border-yellow-500 outline-none" 
              placeholder="Mise"
            />
            <button 
              onClick={() => { console.log('Raise clicked'); handleAction('raise', raiseAmount); }} 
              className="col-span-3 py-2 bg-yellow-500 border-b-4 border-yellow-700 hover:bg-yellow-400 text-black rounded-lg font-black uppercase text-[10px] active:border-b-0 active:translate-y-[4px] transition-all"
            >
              Raise {raiseAmount > 0 ? raiseAmount.toLocaleString() : ''}
            </button>
          </div>
        )}
    </div>
  );
};
