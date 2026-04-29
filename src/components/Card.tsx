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

  // TAILLE AJUSTÉE (38x58 pour mobile, 48x68 pour desktop)
  if (hidden) return <div className="w-[38px] h-[58px] min-w-[38px] min-h-[58px] sm:w-[48px] sm:h-[68px] sm:min-w-[48px] sm:min-h-[68px]">{CardBack}</div>;

  return (
    <div className="w-[38px] h-[58px] min-w-[38px] min-h-[58px] sm:w-[48px] sm:h-[68px] sm:min-w-[48px] sm:min-h-[68px] perspective-1000 antialiased">
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${revealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
        {/* Front Side */}
        <div className={`absolute inset-0 backface-hidden w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-1 font-black ${suitColors[suit]}`}>
          <div className="text-[10px] sm:text-[12px] self-start leading-none">{displayValue}</div>
          <div className="text-xl sm:text-2xl leading-none drop-shadow-md my-auto">{suitIcons[suit]}</div>
          <div className="text-[10px] sm:text-[12px] self-end rotate-180 leading-none">{displayValue}</div>
        </div>
        
        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
          {CardBack}
        </div>
      </div>
    </div>
  );
};
