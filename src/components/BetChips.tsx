import React, { useState, useEffect } from 'react';
import { SEAT_ANIMATION_TARGETS } from '../config/seatAnimationTargets';

interface BetChipsProps {
  amount: number;
  shouldGather?: boolean;
  position?: string;
  seatNumber?: number;
  centerX?: number;
  centerY?: number;
  playerId: string;
  gatheringPlayerId: string | null;
}

const PokerChip = ({ color, index }: { color: string, index: number }) => (
  <div 
    className="relative w-5 h-5 rounded-full flex items-center justify-center shadow-md"
    style={{ 
      backgroundColor: color,
      backgroundImage: `
        repeating-conic-gradient(from 0deg, rgba(255,255,255,0.3) 0deg 20deg, transparent 20deg 40deg),
        radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3), transparent)
      `,
      border: '1px dashed rgba(255,255,255,0.4)',
      boxShadow: `0 ${index * 1 + 1}px 0 rgba(0,0,0,0.4)`,
      transform: `translateY(-${index * 2}px)`,
      zIndex: 10 - index
    }}
  >
    <div className="w-2 h-2 rounded-full border border-white/20 bg-white/5" />
  </div>
);

export const BetChips: React.FC<BetChipsProps> = ({ amount, shouldGather, seatNumber = 0, playerId, gatheringPlayerId }) => {
  const [animateGather, setAnimateGather] = useState(false);
  const [animateBet, setAnimateBet] = useState(false);
  const numericAmount = Number(amount) || 0;
  const [currentAmount, setCurrentAmount] = useState(numericAmount);

  useEffect(() => {
    const val = Number(amount) || 0;
    if (val > currentAmount && val > 0) {
      setAnimateBet(true);
      const timer = setTimeout(() => setAnimateBet(false), 500);
      setCurrentAmount(val);
      return () => clearTimeout(timer);
    } else if (val !== currentAmount) {
      setCurrentAmount(val);
    }
  }, [amount, currentAmount]);

  useEffect(() => {
    const isGatheringTime = shouldGather && playerId === gatheringPlayerId;
    if (isGatheringTime && !animateGather && currentAmount > 0) {
      setAnimateGather(true);
      const timer = setTimeout(() => {
        setAnimateGather(false);
        setCurrentAmount(0);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [shouldGather, gatheringPlayerId, playerId, animateGather, currentAmount]);

  if (currentAmount <= 0 && !animateGather) return null;

  const getPositionStyle = () => {
    // Décalage pour aligner les jetons selon la demande :
    // Seat 0 et 8 : en haut de son avatar (au-dessus)
    if (seatNumber === 0 ) {
      return { bottom: '19vh', left: '80%', transform: 'translateX(-50%)' };
    }
    // Seat 4 : en bas du trapeze (au-dessous)
    if (seatNumber === 4) {
      return { top: '14vh', left: '40%', transform: 'translateX(-50%)' };
    }
    // Seat 1, 2, 3 : en bas et a droite du trapeze
    if ([1].includes(seatNumber)) {
      return { top: '-6vh', left: '10vh' };
    }
    if ([2].includes(seatNumber)) {
      return { top: '1vh', left: '12vh' };
    }
    if ([3].includes(seatNumber)) {
      return { top: '7vh', left: '14vh' };
    }

    // Seat 5, 6, 7 : en bas et a droite du trapeze
     if ([5].includes(seatNumber)) {
      return { top: '7vh', left: '-3vh' };
    }
      if ([6].includes(seatNumber)) {
      return { top: '10vh', left: '-5vh' };
    }
    if ([7].includes(seatNumber)) {
      return { top: '8vh', left: '-3vh' };
    }
    if ([8].includes(seatNumber)) {
     return { top: '-6vh', left: '4vh' };
    }
    // Par défaut (milieu si inconnu)
    return { bottom: '140px', left: '50%', transform: 'translateX(-50%)' };
  };

  const targetX = SEAT_ANIMATION_TARGETS[seatNumber]?.x || '0px';
  const targetY = SEAT_ANIMATION_TARGETS[seatNumber]?.y || '0px';

  const colors = currentAmount >= 1000 ? ['#8b5cf6', '#7c3aed'] : 
                 currentAmount >= 500 ? ['#ef4444', '#dc2626'] : 
                 ['#10b981', '#059669'];

  return (
    <div 
      className={`flex flex-col items-center gap-0 absolute z-[99] 
        ${animateGather ? 'animate-bet-gather' : ''} 
        ${animateBet ? 'animate-bet-in' : ''}`}
      style={{ 
        ...getPositionStyle() as any,
        '--tx': targetX, 
        '--ty': targetY 
      } as React.CSSProperties} 
    >
      <style>{`
        @keyframes gather {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
        }
        @keyframes betIn {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-bet-gather {
          animation: gather 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-bet-in {
          animation: betIn 0.4s ease-out forwards;
        }
      `}</style>
      
      {/* Pile de Jetons plus compacte */}
      <div className="flex flex-row -space-x-2 mb-0.5 items-end">
        {[...Array(2)].map((_, i) => (
          <PokerChip key={i} color={colors[i % colors.length]} index={i} />
        ))}
      </div>

      {/* Badge Montant compact */}
      <div className="bg-black/80 backdrop-blur-md text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center justify-center font-bold text-[10px] shadow-lg min-w-[35px]">
        {currentAmount.toLocaleString()}
      </div>
    </div>
  );
};
