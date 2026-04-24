// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { BetChips } from './BetChips';

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
  isCurrentUser, gameState, seatNumber, centerX, centerY, gatheringPlayerId, id
}) => {
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${player.name}&radius=50`;
  const [timeLeft, setTimeLeft] = useState(15);
  
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
  
  const getMarkerPosition = (offset = 0) => {
    // Apetraka eo amin'ny "glass-panel" (trapeze) ny position
    return `absolute -top-6 ${[1, 2, 3].includes(seatNumber) ? '-right-6' : '-left-6'} z-[60]`;
  };

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
          {isActive && <div className="absolute inset-[-12px] rounded-full border-yellow-400/60 sonar-animation z-0"></div>}
          <div className={`w-24 h-24 min-w-[96px] min-h-[96px] rounded-full p-1 shadow-2xl transition-all duration-300
            ${isActive ? 'bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 scale-105' : 'bg-gradient-to-tr from-gray-700 to-gray-900'}`}>
            <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-black/50">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          {isDealer && (
            <div className={`absolute ${getMarkerPosition()} w-8 h-8 rounded-full bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center z-30 animate-in zoom-in duration-500`}>
              <span className="text-[12px] font-black text-gray-800">D</span>
            </div>
          )}
        </div>

        {/* TRAPEZE - Timer ao ambaniny */}
        <div className="glass-panel p-2 min-w-[130px] text-center mt-[-22px] relative overflow-hidden border-x border-t border-white/10"
           style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 70%, 85% 92%, 75% 100%, 25% 100%, 15% 92%, 10% 70%)", paddingBottom: '12px' }}>
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="text-white text-[12px] font-black uppercase italic">{player.name}</div>
          <div className="text-yellow-400 text-[14px] font-black">{Number(player.chips).toLocaleString()}</div>
          
          {/* TIMER */}
          {isActive && (
            <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-yellow-500 to-yellow-200 transition-all duration-1000 ease-linear" 
                 style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
          )}
        </div>

        <BetChips amount={player.bet} shouldGather={shouldGatherBets} position={positionClass} seatNumber={seatNumber} centerX={centerX} centerY={centerY} playerId={player.id} gatheringPlayerId={gatheringPlayerId} />
      </div>

      {/* Badge Action */}
      {player.lastAction && (
        <div className={`absolute px-4 py-1 rounded-full text-[10px] font-black uppercase shadow-2xl border border-white/20 z-[60] whitespace-nowrap transition-all duration-300
          ${player.lastAction === 'fold' ? 'bg-gradient-to-r from-red-900 to-red-600 text-white' : 
            player.lastAction === 'all-in' ? 'bg-gradient-to-r from-purple-900 to-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' :
            'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black'}`}
          style={{ top: '75px', left: '-5px' }}
        >
          {player.lastAction}
        </div>
      )}
    </div>
  );
};
