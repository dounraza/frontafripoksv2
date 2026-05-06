// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { BetChips } from './BetChips';
import { CardDealer } from './CardDealer';

interface PlayerSlotProps {
  player: any;
  isActive: boolean;
  isWinner: boolean;
  isAnimatingPot: boolean;
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
  currentEmoji: string | null;
  sendEmoji: (emoji: string) => void;
  id?: string;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({ 
  player, isActive, isWinner, isAnimatingPot, positionClass, shouldGatherBets, isDealer, isSB, isBB,
  isCurrentUser, gameState, seatNumber, centerX, centerY, gatheringPlayerId, id, isShowdown, currentEmoji, sendEmoji
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const emojis = ['😊', '😂', '🔥', '👍', '👎', '😠'];
  
  const getAvatarUrl = () => {
    if (player.avatarUrl) {
      return player.avatarUrl.startsWith('http') 
        ? player.avatarUrl 
        : `${API_URL}${player.avatarUrl}`;
    }
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${player.name}&radius=50`;
  };

  const avatarUrl = getAvatarUrl();
  const isLoser = !isWinner && isShowdown;
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
  
  // Sync display chips with isAnimatingPot
  useEffect(() => {
    // Bloque la mise à jour si l'animation est en cours OU si on est en showdown (révélation des cartes)
    if (isAnimatingPot || gameState === 'showdown') {
      return;
    }
    // Sinon, on met à jour immédiatement
    setDisplayChips(player.chips);
  }, [player.chips, isAnimatingPot, gameState]);

  useEffect(() => {
    let timer: any;
    // On n'active le chrono que si c'est le tour du joueur ET que le jeu n'est pas en phase de révélation
    // NOUVEAU : On n'active pas le chrono si le joueur n'a plus de jetons (attente recave)
    if (isActive && gameState === 'playing' && player.chips > 0) {
      setTimeLeft(15);
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setTimeLeft(0); // Reset le chrono visuel si ce n'est pas le tour ou si jeu fini
    }
    return () => clearInterval(timer);
  }, [isActive, gameState, player.chips]);

  const isInHand = player.status === 'active' || player.status === 'all-in';
  const isFolded = player.status === 'folded' || player.status === 'out' || player.status === 'waiting' || player.lastAction === 'fold';
  
  const [showPicker, setShowPicker] = useState(false);

  const getEmojiPosition = () => {
    // Déplacé plus haut et agrandi pour être bien visible
    return "absolute -top-24 left-1/2 transform -translate-x-1/2 z-[100]";
  };

  return (
    <div 
      className={`relative flex flex-col items-center gap-2 ${isWinner ? 'z-30 scale-110' : 'z-20'} transition-all duration-500`}
      style={{ opacity: isFolded ? 0.4 : ((isActive || isCurrentUser) ? 1 : 0.8) }}
    >
      <style>{`
        .glass-panel {
          background: rgba(15, 15, 15, 0.98);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.9);
          z-index: 30;
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
          {isActive && player.chips > 0 && <div className="absolute inset-[-8px] rounded-full border-yellow-400/60 sonar-animation z-0"></div>}
          
          {currentEmoji && (
            <div className={`${getEmojiPosition()} bg-white/90 rounded-full p-2 text-5xl animate-bounce shadow-xl border border-gray-200`}>
                {currentEmoji}
            </div>
          )}
          
          <div className={`w-16 h-16 min-w-[64px] min-h-[64px] rounded-full p-1 shadow-2xl transition-all duration-300
            ${isActive ? 'bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 scale-105' : 'bg-gradient-to-tr from-gray-700 to-gray-900'}`}>
            <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-black/50">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* TRAPEZE - Misy anarana, chips, ary D/SB/BB */}
        <div className="glass-panel p-2 min-w-[110px] text-center mt-[-8px] relative border-x border-t border-white/10 flex flex-col items-center"
           style={{ clipPath: "polygon(0% 0%, 100% 0%, 95% 70%, 90% 90%, 80% 100%, 20% 100%, 10% 90%, 5% 70%)", paddingBottom: '24px' }}>
          
          <div className="flex flex-col items-center gap-1 mb-0.5">
             <div className="flex items-center justify-center gap-1.5">
               {player.lastAction && player.lastAction !== 'check' && (
                 <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white
                    ${player.lastAction === 'raise' ? 'bg-yellow-600' : 
                      player.lastAction === 'call' ? 'bg-blue-600' : 
                      player.lastAction === 'fold' ? 'bg-red-600' : 'bg-gray-600'}`}>
                    {player.lastAction}
                 </span>
               )}
               <div className={`text-[10px] font-black uppercase italic flex items-center gap-1
                 ${(isShowdown && player.handResult) ? 'text-yellow-400 animate-pulse' : ''}
                 ${isLoser ? 'text-red-500' : 'text-white'}
               `}>
                  {(isShowdown && player.handResult)
                      ? <span className="uppercase tracking-tighter">{player.handResult}</span>
                      : (player.status === 'waiting' ? <span className="text-gray-400">En attente...</span> : player.name)}
               </div>
               <div className="flex gap-1">
                 {isDealer && <span className="w-5 h-5 bg-white text-black rounded-md text-[10px] font-black flex items-center justify-center shadow-lg border border-gray-300">D</span>}
                 {isSB && <span className="w-5 h-5 bg-blue-600 text-white rounded-md text-[10px] font-black flex items-center justify-center shadow-lg border border-blue-800">SB</span>}
                 {isBB && <span className="w-5 h-5 bg-red-600 text-white rounded-md text-[10px] font-black flex items-center justify-center shadow-lg border border-red-800">BB</span>}
               </div>
             </div>
          </div>
          <div className="text-yellow-400 text-[12px] font-black">
            {Number(displayChips).toLocaleString()}
          </div>
          
          {isActive && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[6px] transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(0,0,0,0.8)] rounded-b-lg overflow-hidden" 
                 style={{ 
                   background: 'transparent'
                 }}>
                <div className="h-full transition-all duration-1000 ease-linear"
                     style={{
                        width: `${(timeLeft / 15) * 100}%`,
                        background: timeLeft > 10 ? '#22c55e' : timeLeft > 5 ? '#f59e0b' : '#ef4444',
                        boxShadow: timeLeft > 10 ? '0 0 10px #22c55e' : timeLeft > 5 ? '0 0 10px #f59e0b' : '0 0 15px #ef4444'
                     }}>
                </div>
            </div>
          )}
        </div>

        {/* REACTION TRIGGER - Placé en dessous pour ne pas cacher le solde */}
        {isCurrentUser && (
            <div className="mt-0 z-50">
                <button onClick={() => setShowPicker(!showPicker)} className="text-[20px] hover:scale-125 transition-transform bg-black/80 p-1 rounded-full border border-white/20">😀</button>
                {showPicker && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowPicker(false)}>
                        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/20 flex gap-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {emojis.map(e => (
                                <button key={e} onClick={() => { sendEmoji(e); setShowPicker(false); }} className="hover:scale-125 text-3xl transition-transform">{e}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
