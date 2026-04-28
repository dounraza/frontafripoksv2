// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { BetChips } from './BetChips';
import { CardDealer } from './CardDealer';

interface PlayerSlotProps {
  player: any;
  isActive: boolean;
  isWinner: boolean;
  positionClass: string;
  shouldGatherBets: boolean;
  isDealer: boolean;
  isSB: boolean;
  isBB: boolean;
  seatNumber: number;
  isShowdown: boolean;
  isCurrentUser: boolean;
  gameState: string;
  centerX: number;
  centerY: number;
  gatheringPlayerId: string | null;
  id?: string;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({ 
  player, isActive, isWinner, positionClass, shouldGatherBets, isDealer, isSB, isBB,
  isCurrentUser, gameState, seatNumber, centerX, centerY, gatheringPlayerId, id, isShowdown
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  const getAvatarUrl = () => {
    if (player.avatarUrl) {
      return player.avatarUrl.startsWith('http') 
        ? player.avatarUrl 
        : `${API_URL}${player.avatarUrl}`;
    }
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${player.name}&radius=50`;
  };

  const avatarUrl = getAvatarUrl();
  const [timeLeft, setTimeLeft] = useState(15);
  const [displayChips, setDisplayChips] = useState(player.chips);
  const [showResult, setShowResult] = useState(false);
  
  useEffect(() => {
    if (isShowdown && player.handResult && player.lastAction !== 'fold' && player.lastAction !== 'out') {
      const interval = setInterval(() => {
        setShowResult(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setShowResult(false);
    }
  }, [isShowdown, player.handResult, player.lastAction]);
  
  // Sync display chips with delay if winner
  useEffect(() => {
    if (isWinner) {
      // Wait for the pot animation to travel to the player
      const timer = setTimeout(() => {
        setDisplayChips(player.chips);
      }, 1500); // Adjust this to match your ChipPot animation duration
      return () => clearTimeout(timer);
    } else {
      setDisplayChips(player.chips);
    }
  }, [player.chips, isWinner]);

  useEffect(() => {
    let timer: any;
    if (isActive) {
      setTimeLeft(15);
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const isInHand = player.inHand || (player.cards && player.cards.length > 0) || player.lastAction;
  
  return (
    <div 
      id={id || `seat-${seatNumber}`}
      className={`absolute flex flex-col items-center gap-2 ${positionClass} ${isWinner ? 'z-30 scale-110' : 'z-20'} transition-all duration-500`}
      style={{ opacity: (isActive || isCurrentUser) ? 1 : 0.8 }}
    >
      <style>{`
        .glass-panel {
          background: rgba(15, 15, 15, 0.98);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.9);
          z-index: 50;
        }
        @keyframes sonar {
          0% { transform: scale(1); opacity: 0.8; border-width: 4px; }
          100% { transform: scale(1.4); opacity: 0; border-width: 1px; }
        }
        .sonar-animation { animation: sonar 2s ease-out infinite; }
      `}</style>

      <div className="relative flex flex-col items-center">
        {/* AVATAR */}
        <div className="relative mt-4 z-10">
          {isActive && <div className="absolute inset-[-8px] rounded-full border-yellow-400/60 sonar-animation z-0"></div>}
          <div className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-full p-1 shadow-2xl transition-all duration-300
            ${isActive ? 'bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 scale-105' : 'bg-gradient-to-tr from-gray-700 to-gray-900'}`}>
            <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-black/50">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* TRAPEZE - Misy anarana, chips, ary D/SB/BB */}
        <div className="glass-panel p-1.5 min-w-[105px] text-center mt-[-16px] relative border-x border-t border-white/10 flex flex-col items-center"
           style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 70%, 85% 92%, 75% 100%, 25% 100%, 15% 92%, 10% 70%)", paddingBottom: '10px' }}>
          
          <div className="flex flex-col items-center gap-1 mb-0.5">
             <div className="flex items-center justify-center gap-1.5">
               <div className={`text-[10px] font-black uppercase italic ${(showResult && (isCurrentUser || isShowdown)) ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                  {(showResult && (isCurrentUser || isShowdown)) ? player.handResult : player.name}
               </div>
               <div className="flex gap-1">
                 {isDealer && <span className="w-5 h-5 bg-white text-black rounded-md text-[10px] font-black flex items-center justify-center shadow-lg border border-gray-300">D</span>}
                 {isSB && <span className="w-5 h-5 bg-blue-600 text-white rounded-md text-[10px] font-black flex items-center justify-center shadow-lg border border-blue-800">SB</span>}
                 {isBB && <span className="w-5 h-5 bg-red-600 text-white rounded-md text-[10px] font-black flex items-center justify-center shadow-lg border border-red-800">BB</span>}
               </div>
             </div>
          </div>
          <div className="text-yellow-400 text-[12px] font-black">{Number(displayChips).toLocaleString()}</div>
          
          {isActive && (
            <div className="absolute bottom-0 left-0 h-[4px] transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                 style={{ 
                   width: `${(timeLeft / 15) * 100}%`,
                   background: timeLeft > 10 ? '#10b981' : timeLeft > 5 ? '#f59e0b' : '#ef4444',
                   boxShadow: timeLeft > 10 ? '0 0 8px #10b981' : timeLeft > 5 ? '0 0 8px #f59e0b' : '0 0 12px #ef4444'
                 }}></div>
          )}
        </div>

        <BetChips amount={player.bet} shouldGather={shouldGatherBets} position={positionClass} seatNumber={seatNumber} centerX={centerX} centerY={centerY} playerId={player.id} gatheringPlayerId={gatheringPlayerId} />
      </div>
    </div>
  );
};
