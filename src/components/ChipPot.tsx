import React, { useState, useEffect } from 'react';

interface ChipPotProps {
  amount: number;
  winnerPosition?: string;
  targetX?: string;
  targetY?: string;
}

const PotChip = ({ color, index, stackIndex }: { color: any, index: number, stackIndex: number }) => (
  <div 
    className="w-12 h-12 rounded-full border-[3px] border-dashed flex items-center justify-center shadow-2xl transition-transform"
    style={{ 
      backgroundColor: color.main,
      borderColor: 'rgba(255,255,255,0.4)',
      boxShadow: `0 ${index * 2 + 2}px 0 rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.4)`,
      transform: `translateY(-${index * 4}px) rotate(${stackIndex * 15}deg)`,
      backgroundImage: `
        repeating-conic-gradient(from 0deg, rgba(255,255,255,0.2) 0deg 20deg, transparent 20deg 40deg),
        radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3), transparent)
      `,
    }}
  >
    <div className="w-6 h-6 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="w-full h-full rounded-full border-[0.5px] border-white/10" />
    </div>
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

  const getChipColor = (i: number) => {
    const colors = [
      { main: '#10b981', stripe: '#ffffff' }, // Green
      { main: '#1f2937', stripe: '#ffffff' }, // Black
      { main: '#8b5cf6', stripe: '#ffffff' }, // Purple
      { main: '#f59e0b', stripe: '#ffffff' }, // Orange
      { main: '#ef4444', stripe: '#ffffff' }  // Red
    ];
    return colors[i % colors.length];
  };

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
      
      <div className="flex gap-2 pot-floating">
        {Array.from({ length: stackCount }).map((_, i) => (
            <div key={i} className="flex flex-col-reverse -space-y-8" style={{ animationDelay: `${i * 0.2}s` }}>
            {Array.from({ length: 2 + (i % 2) }).map((_, j) => (
                <PotChip key={j} color={getChipColor(i)} index={j} stackIndex={i} />
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
