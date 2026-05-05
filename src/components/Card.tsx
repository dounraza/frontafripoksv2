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
  
  // Dimensions largeur augmentée très finement, hauteur augmentée légèrement
  const width = isLarge ? 'w-[3.6rem]' : (isSmall ? 'w-[3.0rem]' : 'w-[3.3rem]');
  const height = isLarge ? 'h-[4.9rem]' : (isSmall ? 'h-[4.1rem]' : 'h-[4.5rem]');
  const minWidth = isLarge ? 'min-w-[3.6rem]' : (isSmall ? 'min-w-[3.0rem]' : 'min-w-[3.3rem]');
  const minHeight = isLarge ? 'min-h-[4.9rem]' : (isSmall ? 'min-h-[4.1rem]' : 'min-h-[4.5rem]');

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
          <div className={`${isLarge ? 'text-lg' : (isSmall ? 'text-base' : 'text-lg')} self-start leading-none`}>{displayValue}</div>
          <div className={`${isLarge ? 'text-4xl' : (isSmall ? 'text-2xl' : 'text-3xl')} leading-none drop-shadow-md my-auto`}>{suitIcons[suit]}</div>
          <div className={`${isLarge ? 'text-lg' : (isSmall ? 'text-base' : 'text-lg')} self-end rotate-180 leading-none`}>{displayValue}</div>
        </div>
        
        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full">
          {CardBack}
        </div>
      </div>
    </div>
  );
};
