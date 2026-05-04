import React from 'react';

interface CardProps {
  value: string;
  suit: string;
  hidden?: boolean;
  revealed?: boolean;
  size?: 'small' | 'normal' | 'large';
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

export const Card: React.FC<CardProps> = ({ value, suit, hidden, revealed = true, size = 'normal' }) => {
  const displayValue = value === 'T' ? '10' : value;
  
  const isLarge = size === 'large';
  const isSmall = size === 'small';
  
  // Dimensions réduites
  const width = isLarge ? 'w-[3.0rem]' : (isSmall ? 'w-[2.4rem]' : 'w-[2.7rem]');
  const height = isLarge ? 'h-[4.2rem]' : (isSmall ? 'h-[3.4rem]' : 'h-[3.8rem]');
  const minWidth = isLarge ? 'min-w-[3.0rem]' : (isSmall ? 'min-w-[2.4rem]' : 'min-w-[2.7rem]');
  const minHeight = isLarge ? 'min-h-[4.2rem]' : (isSmall ? 'min-h-[3.4rem]' : 'min-h-[3.8rem]');

  const CardBack = (
    <div className={`w-full h-full card-back flex items-center justify-center shadow-md rounded-lg border border-white/20 bg-black overflow-hidden p-1`}>
      <img src="/font.png" alt="logo" className="w-full h-full object-contain opacity-80" />
    </div>
  );

  if (hidden) return <div className={`${width} ${height} ${minWidth} ${minHeight}`}>{CardBack}</div>;

  return (
    <div className={`${width} ${height} ${minWidth} ${minHeight} perspective-1000 antialiased`}>
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${revealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
        {/* Front Side */}
        <div className={`absolute inset-0 backface-hidden w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-1 font-black ${suitColors[suit]}`}>
          <div className={`${isLarge ? 'text-[0.65rem]' : (isSmall ? 'text-[0.55rem]' : 'text-[0.6rem]')} self-start leading-none`}>{displayValue}</div>
          <div className={`${isLarge ? 'text-xl' : (isSmall ? 'text-lg' : 'text-xl')} leading-none drop-shadow-md my-auto`}>{suitIcons[suit]}</div>
          <div className={`${isLarge ? 'text-[0.65rem]' : (isSmall ? 'text-[0.55rem]' : 'text-[0.6rem]')} self-end rotate-180 leading-none`}>{displayValue}</div>
        </div>
        
        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
          {CardBack}
        </div>
      </div>
    </div>
  );
};
