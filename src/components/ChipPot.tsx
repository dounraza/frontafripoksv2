import React, { useState, useEffect } from 'react';

interface ChipPotProps {
  amount: number;
  winnerPosition?: string;
  targetX?: string;
  targetY?: string;
}

export const ChipPot: React.FC<ChipPotProps> = ({ amount, winnerPosition, targetX = '0px', targetY = '0px' }) => {
  const [prevAmount, setPrevAmount] = useState(amount);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (amount > prevAmount) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 800);
      setPrevAmount(amount);
      return () => clearTimeout(timer);
    } else {
      setPrevAmount(amount);
    }
  }, [amount, prevAmount]);

  if (amount <= 0 && !winnerPosition) return null;

  return (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-1000 
      ${winnerPosition ? 'animate-payout pointer-events-none' : ''}
      ${isUpdating ? 'scale-110' : 'scale-100'}`}
         style={{ '--tx': targetX, '--ty': targetY } as any}>
      <style>{`
        @keyframes payout {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          80% { transform: translate(var(--tx), var(--ty)) scale(0.4); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
        }
        .animate-payout {
          animation: payout 1.5s ease-in-out forwards;
        }
      `}</style>
      
      {/* Jetons unique représentatif */}
      <div className="w-16 h-16 mb-1 relative">
        <img src="/image/jeton.png" alt="chip" className="w-full h-full object-contain drop-shadow-xl" />
      </div>

      <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-500/30 shadow-2xl flex items-center gap-2">
        <span className="text-[10px] font-black text-yellow-500/70 uppercase tracking-widest border-r border-yellow-500/20 pr-2">Pot</span>
        <span className="text-yellow-400 font-black text-lg drop-shadow-sm italic">
            {amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
