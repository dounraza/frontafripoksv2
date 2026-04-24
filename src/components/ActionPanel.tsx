import React, { useState } from 'react';

interface ActionPanelProps {
  sendAction: (type: string, amount?: number) => void;
  callAmount: number;
  isMyTurn: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ sendAction, callAmount, isMyTurn }) => {
  console.log("ActionPanel - isMyTurn:", isMyTurn);
  const [raiseAmount, setRaiseAmount] = useState(100);

  return (
    <div className={`relative flex flex-col items-center gap-3 p-4 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl transition-all ${isMyTurn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      <div className="grid grid-cols-3 gap-2 w-[360px]">
        <button onClick={() => sendAction('fold')} className="py-3 bg-red-950/40 border border-red-500/50 rounded-xl font-black text-red-500 uppercase text-xs">Fold</button>
        <button onClick={() => sendAction(callAmount > 0 ? 'call' : 'check')} className="py-3 bg-green-950/40 border border-green-500/50 rounded-xl font-black text-green-500 uppercase text-xs">
          {callAmount > 0 ? `Call ${callAmount}` : 'Check'}
        </button>
        <button onClick={() => sendAction('all-in')} className="py-3 bg-yellow-950/40 border border-yellow-500/50 rounded-xl font-black text-yellow-500 uppercase text-xs">All-In</button>
      </div>
      <div className="flex items-center gap-2 w-[360px]">
        <input type="number" value={raiseAmount} onChange={(e) => setRaiseAmount(Number(e.target.value))} className="bg-gray-900 text-white font-black w-20 py-2.5 rounded-lg text-center text-sm" />
        <button onClick={() => sendAction('raise', raiseAmount)} className="flex-1 bg-yellow-500 text-black py-2.5 rounded-lg font-black uppercase text-sm">Raise</button>
      </div>
    </div>
  );
};
