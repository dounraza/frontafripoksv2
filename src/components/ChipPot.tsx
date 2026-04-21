import React from 'react';

interface ChipPotProps {
  amount: number;
  winnerPosition?: string;
}

export const ChipPot: React.FC<ChipPotProps> = ({ amount, winnerPosition }) => {
  if (amount <= 0) return null;

  const getChipColor = (i: number) => {
    const colors = [
      '#10b981', // Green
      '#1f2937', // Black
      '#8b5cf6', // Purple
      '#f59e0b', // Orange
      '#ef4444'  // Red
    ];
    return colors[i % colors.length];
  };

  const stackCount = Math.min(Math.ceil(amount / 500), 4);

  return (
    <div className={`relative flex gap-2 items-center justify-center transition-all duration-1000 ${winnerPosition ? 'animate-payout pointer-events-none' : ''}`}>
      {Array.from({ length: stackCount }).map((_, i) => (
        <div key={i} className="flex flex-col-reverse -space-y-6">
          {Array.from({ length: 3 + (i % 2) }).map((_, j) => (
            <div 
              key={j} 
              className="casino-chip"
              style={{ 
                '--chip-color': getChipColor(i) 
              } as any}
            >
            </div>
          ))}
        </div>
      ))}
      
      {!winnerPosition && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full border border-yellow-500/50 backdrop-blur-sm shadow-xl">
          <span className="text-yellow-500 font-mono font-black text-sm">{amount} MGA</span>
        </div>
      )}
    </div>
  );
};
