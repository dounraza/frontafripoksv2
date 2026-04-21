import React, { useState, useEffect } from 'react';

interface BetChipsProps {
  amount: number;
  shouldGather?: boolean;
}

export const BetChips: React.FC<BetChipsProps> = ({ amount, shouldGather }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (amount > 0 && !shouldGather) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
        setVisible(true);
    }
  }, [amount, shouldGather]);

  if ((amount <= 0 && !shouldGather) || !visible) return null;

  const getChipColor = (i: number) => {
    const colors = ['#10b981', '#1f2937', '#8b5cf6'];
    return colors[i % colors.length];
  };

  return (
    <div className={`flex flex-col items-center gap-1 absolute -top-12 z-40 transition-opacity duration-500 ${shouldGather ? 'animate-bet-gather' : 'opacity-100'}`}>
      <div className="flex -space-x-1.5">
        {Array.from({ length: Math.min(Math.ceil(amount / 100), 2) }).map((_, i) => (
          <div 
            key={i} 
            className="bet-chip" 
            style={{ '--chip-color': getChipColor(i) } as any}
          />
        ))}
      </div>
      <div className="bg-black/80 px-1.5 rounded-full border border-yellow-500/50 text-[9px] font-mono font-bold text-yellow-500 shadow-lg">
        {amount} MGA
      </div>
    </div>
  );
};
