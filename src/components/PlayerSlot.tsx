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

  // Timer local pour le compte à rebours
  useEffect(() => {
    if (isActive) {
      setTimeLeft(15);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(15);
    }
  }, [isActive]);

  const showCards = gameState === 'playing' || gameState === 'showdown';

  return (
    <div 
      className={`absolute flex flex-col items-center gap-2 ${positionClass} ${isWinner ? 'z-30 scale-110' : 'z-20'} transition-all duration-500`}
      style={{ opacity: (isActive || isCurrentUser) ? 1 : 0.6 }}
    >
      <style>{`
        @keyframes sonar {
          0% { transform: scale(1); opacity: 0.6; border-width: 4px; }
          100% { transform: scale(1.3); opacity: 0; border-width: 1px; }
        }
        .sonar-animation {
          animation: sonar 2s ease-out infinite;
        }
      `}</style>
      
      {/* 2. Superposition : Avatar -> Capsule */}
      <div className="relative flex flex-col items-center">
        
        {/* Cartes (z=2) - Position absolue pour chevaucher le milieu de l'avatar */}
        <div key={handKey} className="absolute top-8 z-20 flex perspective-1000">
          {showCards && (player.cards && player.cards.length > 0 ? player.cards : [null, null]).map((card: any, idx: number) => {
            const delay = (idx * numPlayers + (dealOrder - 1)) * 300;
            return (
              <div 
                key={idx} 
                className="animate-card-deal scale-[0.8] origin-bottom shadow-2xl transition-transform duration-300 bg-black rounded-lg"
                style={{
                  '--deal-x': dealOrigin.x,
                  '--deal-y': dealOrigin.y,
                  animationDelay: `${delay}ms`,
                  zIndex: idx,
                  marginLeft: idx === 1 ? '-30px' : '0',
                } as React.CSSProperties}
              >
                <Card 
                  value={card?.value || ''} 
                  suit={card?.suit || ''} 
                  revealed={isRevealed || isShowdown} 
                  hidden={!card && !isRevealed && !isShowdown}
                />
              </div>
            );
          })}
        </div>

        {/* Avatar (z=1) */}
        <div className="relative mt-6">
          {/* Effet sonar jaune si actif */}
          {isActive && (
            <div className="absolute inset-[-10px] rounded-full border-yellow-400/50 sonar-animation z-0"></div>
          )}
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center overflow-hidden bg-gray-900 shadow-xl z-10
            ${isActive ? 'border-yellow-400' : 'border-gray-700'}`}>
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Capsule Nom/Solde (z=2) */}
        <div className="bg-black border-[0.5px] border-white/20 p-2 min-w-[120px] text-center z-20 shadow-xl mt-[-25px] rounded-t-[10px] relative overflow-hidden" 
             style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}>
          <div className="text-white text-[12px] font-bold truncate max-w-[90px] mx-auto">{player.name}</div>
          
          {/* Statut Win/Lose */}
          {isShowdown && player.handResult && (
            <div className={`text-[10px] font-black uppercase ${isWinner ? 'text-green-500' : 'text-red-500'}`}>
              {player.handResult}
            </div>
          )}
          
          <div className="h-[0.5px] bg-white/20 my-0.5" />
          <div className="text-white text-[14px] font-extrabold tracking-wider">{player.chips}</div>
          
          {/* Progress Bar Countdown */}
          {isActive && (
            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-1000 ease-linear" 
                 style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
          )}
        </div>
      </div>

      {/* 1. Badge Action (en haut, au niveau des cartes) */}
      {player.lastAction && (
        <div className={`absolute top-[69px] left-[-9px] px-3 py-0.5 rounded-md text-[10px] font-black uppercase shadow-lg border border-white/20 z-50 whitespace-nowrap
          ${player.lastAction === 'fold' ? 'bg-red-700 text-white' : 
            player.lastAction === 'all-in' ? 'bg-purple-700 text-white' :
            'bg-yellow-600 text-black'}`}>
          {player.lastAction}
        </div>
      )}
      
    </div>
  );
};
