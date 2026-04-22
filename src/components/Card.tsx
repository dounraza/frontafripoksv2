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

  if (hidden) return <div className="w-16 h-24 sm:w-20 sm:h-28">{CardBack}</div>;

  return (
    <div className="w-16 h-24 sm:w-20 sm:h-28 perspective-1000 antialiased">
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${revealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
        {/* Front Side */}
        <div className={`absolute inset-0 backface-hidden w-full h-full bg-white border border-gray-300 rounded-lg shadow-md flex flex-col items-center justify-between p-1 sm:p-2 font-black ${suitColors[suit]}`}>
          <div className="text-[10px] sm:text-lg self-start leading-none">{displayValue}</div>
          <div className="text-xl sm:text-4xl leading-none">{suitIcons[suit]}</div>
          <div className="text-[10px] sm:text-lg self-end rotate-180 leading-none">{displayValue}</div>
        </div>
        
        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
          {CardBack}
        </div>
      </div>
    </div>
  );
};
