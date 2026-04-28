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
  c: 'text-gray-900',
  s: 'text-gray-900',
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
    <div className="w-full h-full card-back flex items-center justify-center shadow-md rounded-lg border border-white/20 bg-black">
      <img src="/logo.ico" alt="logo" className="w-full h-full object-contain" />
    </div>
  );

  // TAILLE AJUSTÉE (42x60) - PLUS LISIBLE SUR MOBILE
  if (hidden) return <div className="w-[42px] h-[60px] min-w-[42px] min-h-[60px]">{CardBack}</div>;

  return (
    <div className="w-[42px] h-[60px] min-w-[42px] min-h-[60px] perspective-1000 antialiased">
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${revealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
        {/* Front Side */}
        <div className={`absolute inset-0 backface-hidden w-full h-full bg-white border border-gray-400 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between p-0 font-black ${suitColors[suit]}`}>
          <div className="text-[9px] self-start leading-none pl-0.5 pt-0.5">{displayValue}</div>
          <div className="text-xl leading-none drop-shadow-sm">{suitIcons[suit]}</div>
          <div className="text-[9px] self-end rotate-180 leading-none pr-0.5 pb-0.5">{displayValue}</div>
        </div>
        
        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
          {CardBack}
        </div>
      </div>
    </div>
  );
};
