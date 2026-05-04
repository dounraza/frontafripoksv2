import React, { useState, useEffect } from 'react';

interface ChipPotProps {
  amount: number;
  winnerPosition?: string;
  targetX?: string;
  targetY?: string;
}

const PotChip = ({ index, stackIndex }: { index: number, stackIndex: number }) => (
  <div 
    className="w-10 h-10 transition-transform"
    style={{ 
      transform: `translateY(-${index * 3}px) rotate(${stackIndex * 15}deg)`,
      zIndex: 10 - index
    }}
  >
    <img src="/image/jeton.png" alt="chip" className="w-full h-full object-contain drop-shadow-lg" />
  </div>
);

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

  const stackCount = Math.max(Math.min(Math.ceil(amount / 500) + 1, 5), 1);

  return (
    <div className={`relative flex gap-3 items-end justify-center transition-all duration-1000 
      ${winnerPosition ? 'animate-payout pointer-events-none' : ''}
      ${isUpdating ? 'scale-110' : 'scale-100'}`}
         style={{ '--tx': targetX, '--ty': targetY } as any}>
      <style>{`
        @keyframes payout {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          80% { transform: translate(var(--tx), var(--ty)) scale(0.4); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.2); }
          50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.5); }
        }
        .animate-payout {
          animation: payout 1.5s ease-in-out forwards;
        }
        .pot-floating {
          animation: float 4s ease-in-out infinite;
        }
        .pot-glow {
            animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
      
      <div className="flex gap-1 pot-floating">
        {Array.from({ length: stackCount }).map((_, i) => (
            <div key={i} className="flex flex-col-reverse -space-y-7" style={{ animationDelay: `${i * 0.2}s` }}>
            {Array.from({ length: 2 + (i % 2) }).map((_, j) => (
                <PotChip key={j} index={j} stackIndex={i} />
            ))}
            </div>
        ))}
      </div>
      
      <div className="absolute -top-12 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-yellow-500/30 shadow-2xl pot-glow flex items-center gap-2 whitespace-nowrap transition-transform duration-500">
        <span className="text-[9px] font-black text-yellow-500/70 uppercase tracking-widest border-r border-yellow-500/20 pr-2">Pot</span>
        <span className="text-yellow-400 font-black text-lg drop-shadow-sm italic">
            {amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
