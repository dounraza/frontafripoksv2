import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { BetChips } from './BetChips';

interface PlayerSlotProps {
  player: any;
  isActive: boolean;
  isWinner: boolean;
  positionClass: string;
  shouldGatherBets: boolean;
  dealOrigin: { x: string; y: string };
  isDealer: boolean;
  seatNumber: number;
  isShowdown: boolean;
  dealOrder: number;
  numPlayers: number;
  handKey: number;
  isCurrentUser: boolean;
  gameState: string;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({ 
  player, isActive, isWinner, positionClass, shouldGatherBets, dealOrigin, isDealer, isShowdown,
  dealOrder, numPlayers, handKey, isCurrentUser, gameState
}) => {
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${player.name}&radius=50`;
  
  const [timeLeft, setTimeLeft] = useState(15);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setIsRevealed(false);
    
    // Only reveal if it's the current user's slot and we are playing
    if (!isCurrentUser || gameState !== 'playing') return;

    // Reveal cards after ALL cards have been distributed to ALL players
    // 2 cards per player * 300ms + animation duration
    const tableRevealDelay = (2 * numPlayers) * 300 + 1200;
    
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, tableRevealDelay); 
    return () => clearTimeout(timer);
  }, [handKey, numPlayers, dealOrder, isCurrentUser, gameState]);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(15);
      const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
      return () => clearInterval(timer);
    }
  }, [isActive]);

  const showCards = gameState === 'playing' || gameState === 'showdown';

  return (
    <div 
      className={`absolute flex flex-col items-center ${positionClass} ${isWinner ? 'z-30 scale-110' : 'z-20'} transition-all duration-500`}
      style={{ opacity: (isActive || isCurrentUser) ? 1 : 0.6 }}
    >
      
      {/* Bet Chips - Positioned above */}
      <BetChips amount={player.bet} shouldGather={shouldGatherBets} />

      {/* Action Text Badge - ABOVE CARDS (Only for current user) */}
      {isCurrentUser && player.lastAction && (
        <div className={`px-4 py-1.5 rounded-full text-[14px] font-black uppercase italic shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 border-2 whitespace-nowrap mb-2 animate-bounce
          ${player.lastAction === 'fold' ? 'bg-red-600 text-white border-red-400' : 
            player.lastAction === 'all-in' ? 'bg-purple-600 text-white border-purple-400 animate-pulse' :
            'bg-yellow-500 text-black border-yellow-300'}`}>
          {player.lastAction}
        </div>
      )}

      {/* Player Cards - Sequential distribution animation */}
      <div key={handKey} className="flex -space-x-10 -mb-14 h-24 items-end z-10 ml-4 perspective-1000 relative">
        {showCards && (player.cards && player.cards.length > 0 ? player.cards : [null, null]).map((card: any, idx: number) => {
          const delay = (idx * numPlayers + (dealOrder - 1)) * 300;
          return (
            <div 
              key={idx} 
              className="animate-card-deal scale-[0.6] origin-bottom shadow-2xl transition-transform duration-300 hover:scale-75 hover:-translate-y-2"
              style={{
                '--deal-x': dealOrigin.x,
                '--deal-y': dealOrigin.y,
                animationDelay: `${delay}ms`,
                zIndex: idx,
              } as React.CSSProperties}
            >
              <Card 
                value={card?.value || ''} 
                suit={card?.suit || ''} 
                revealed={isRevealed || isShowdown} 
                hidden={!card && !isRevealed && !isShowdown}
              />
            </div>
          );        })}

        {/* Action Text Overlay - Centered over all cards (Only for opponents) */}
        {!isCurrentUser && player.lastAction && !isShowdown && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none -ml-4 -mt-2">
            <span className={`text-[22px] font-black uppercase tracking-tighter italic drop-shadow-[0_4px_4px_rgba(0,0,0,1)] 
              [text-shadow:_2px_2px_0_rgb(0,0,0),_-1px_-1px_0_rgb(0,0,0),_1px_-1px_0_rgb(0,0,0),_-1px_1px_0_rgb(0,0,0)]
              ${player.lastAction === 'fold' ? 'text-red-600' : 'text-yellow-400'}`}>
              {player.lastAction}
            </span>
          </div>
        )}
      </div>

      {/* MAIN SLOT BOX */}
      <div className={`relative w-36 rounded-xl border-2 p-1 shadow-2xl transition-all duration-300 transform origin-center scale-[0.65] sm:scale-75
        ${isActive ? 'border-yellow-400 bg-black' : 'border-gray-700 bg-black/90'}
        ${isWinner ? 'border-yellow-300 ring-4 ring-yellow-500/30 winner-shining' : ''}
        ${player.status === 'all-in' ? 'all-in-active' : ''}
      `}>
        
        {/* ALL-IN BADGE */}
        {player.status === 'all-in' && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full border border-white/20 z-50 animate-bounce">
            ALL-IN
          </div>
        )}

        {/* AVATAR WITH CIRCULAR PROGRESS BAR */}
        <div className="absolute -left-4 bottom-0 w-12 h-12 rounded-full border-2 border-white/80 overflow-hidden bg-gray-900 shadow-xl z-30 relative flex items-center justify-center">
          {/* SVG for Circular Progress Bar */}
          {isActive && timeLeft > 0 && (
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#475569" // Equivalent to Tailwind's gray-700
                strokeWidth="8" 
                opacity="0.8"
              />
              {/* Progress fill */}
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#fde047" // Equivalent to Tailwind's yellow-400
                strokeWidth="8" 
                strokeDasharray="283" // Circumference for r=45 in a 100x100 viewBox
                strokeDashoffset={(((15 - timeLeft) / 15) * 283).toFixed(0)} // Dynamic offset for decreasing progress
                className="transition-all duration-1000 ease-linear" 
              />
            </svg>
          )}
          {/* Avatar Image */}
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full absolute inset-0 z-10" />
        </div>

        {/* INFO SECTION - Clearly separated from avatar and cards */}
        <div className="ml-10 flex flex-col items-start w-full relative h-full justify-center">
            <div className="text-white text-[11px] font-black truncate w-full uppercase tracking-wider relative z-10">{player.name}</div>
            <div className="text-yellow-400 font-mono text-[14px] font-black leading-none mt-0.5 relative z-10">{player.chips} MGA</div>
        </div>

        {/* DEALER BUTTON - Positioned at the corner */}
        {isDealer && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg z-40">D</div>
        )}
      </div>

      {/* Hand Result (Showdown only) */}
      {player.handResult && isShowdown && (
        <div className="mt-2 px-3 py-1 rounded-full bg-yellow-600/20 border border-yellow-500/40 text-[10px] font-black text-yellow-400 uppercase tracking-widest shadow-lg">
          {player.handResult}
        </div>
      )}
    </div>
  );
};
