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
        </div>

        {/* TRAPEZE - Misy anarana, chips, ary D/SB/BB */}
        <div className="glass-panel p-2 min-w-[130px] text-center mt-[-22px] relative border-x border-t border-white/10 flex flex-col items-center"
           style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 70%, 85% 92%, 75% 100%, 25% 100%, 15% 92%, 10% 70%)", paddingBottom: '12px' }}>
          
          <div className="flex items-center justify-center gap-2 mb-1">
             <div className="text-white text-[12px] font-black uppercase italic">{player.name}</div>
             <div className="flex gap-1">
               {isDealer && <span className="w-5 h-5 bg-white text-black rounded-full text-[10px] font-black flex items-center justify-center">D</span>}
               {isSB && <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">SB</span>}
               {isBB && <span className="w-5 h-5 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">BB</span>}
             </div>
          </div>
          <div className="text-yellow-400 text-[14px] font-black">{Number(player.chips).toLocaleString()}</div>
          
          {isActive && (
            <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-yellow-500 to-yellow-200 transition-all duration-1000 ease-linear" 
                 style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
          )}
        </div>

        <BetChips amount={player.bet} shouldGather={shouldGatherBets} position={positionClass} seatNumber={seatNumber} centerX={centerX} centerY={centerY} playerId={player.id} gatheringPlayerId={gatheringPlayerId} />
      </div>
    </div>
  );
};
