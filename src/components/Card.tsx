import React from 'react';

interface CardProps {
  value: string;
  suit: string;
  hidden?: boolean;
  revealed?: boolean;
}

const suitColors: Record<string, string> = {
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-black',
  s: 'text-black',
};

const suitIcons: Record<string, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

export const Card: React.FC<CardProps> = ({ value, suit, hidden, revealed = true }) => {
  const displayValue = value === 'T' ? '10' : value;

  const CardBack = (
    <div className="w-full h-full card-back flex items-center justify-center shadow-md rounded-lg border border-white/20 bg-black overflow-hidden p-1">
      <img src="/logo.ico" alt="logo" className="w-full h-full object-contain opacity-80" />
    </div>
  );

  // TAILLE AJUSTÉE (32x52 pour mobile, 40x58 pour desktop)
  if (hidden) return <div className="w-[32px] h-[52px] min-w-[32px] min-h-[52px] sm:w-[40px] sm:h-[58px] sm:min-w-[40px] sm:min-h-[58px]">{CardBack}</div>;

  return (
    <div className="w-[32px] h-[52px] min-w-[32px] min-h-[52px] sm:w-[40px] sm:h-[58px] sm:min-w-[40px] sm:min-h-[58px] perspective-1000 antialiased">
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${revealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
        {/* Front Side */}
        <div className={`absolute inset-0 backface-hidden w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-0.5 font-black ${suitColors[suit]}`}>
          <div className="text-[8px] sm:text-[10px] self-start leading-none">{displayValue}</div>
          <div className="text-base sm:text-xl leading-none drop-shadow-md my-auto">{suitIcons[suit]}</div>
          <div className="text-[8px] sm:text-[10px] self-end rotate-180 leading-none">{displayValue}</div>
        </div>
        
        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
          {CardBack}
        </div>
      </div>
    </div>
  );
};
