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
  isSB: boolean;
  isBB: boolean;
  seatNumber: number;
  isShowdown: boolean;
  dealOrder: number;
  numPlayers: number;
  handKey: number;
  isCurrentUser: boolean;
  gameState: string;
  centerX: number;
  centerY: number;
  gatheringPlayerId: string | null;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({ 
  player, isActive, isWinner, positionClass, shouldGatherBets, dealOrigin, isDealer, isSB, isBB, isShowdown,
  dealOrder, numPlayers, handKey, isCurrentUser, gameState, seatNumber, centerX, centerY, gatheringPlayerId
}) => {
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${player.name}&radius=50`;
  
  const [timeLeft, setTimeLeft] = useState(15);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    setIsRevealed(false);
    if (!isCurrentUser || gameState !== 'playing') return;
    const tableRevealDelay = (2 * numPlayers) * 300 + 1200;
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, tableRevealDelay); 
    return () => clearTimeout(timer);
  }, [handKey, numPlayers, dealOrder, isCurrentUser, gameState]);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(15);
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(15);
    }
  }, [isActive]);

  // Un joueur ne doit voir des cartes que s'il est réellement dans la main en cours
  const isInHand = player.inHand || (player.cards && player.cards.length > 0) || player.lastAction;
  const showCards = (gameState === 'playing' || gameState === 'showdown') && player.lastAction !== 'fold' && isInHand;
  
  const isPlayerGathering = gatheringPlayerId === player.id;

  // Fonction pour positionner les jetons de rôle (D, SB, BB) intelligemment
  const getMarkerPosition = (offset = 0) => {
    // Ne pas afficher de rôle si le joueur n'est pas dans la main
    if (!isInHand && gameState === 'playing') return 'hidden';
    // Sièges à gauche (1, 2, 3) -> Marqueurs à DROITE de l'avatar
    if ([1, 2, 3].includes(seatNumber)) return `top-[${10+offset}px] -right-4`;
    // Sièges à droite (5, 6, 7) -> Marqueurs à GAUCHE de l'avatar
    if ([5, 6, 7].includes(seatNumber)) return `top-[${10+offset}px] -left-4`;
    // Siège en haut (4) -> Marqueurs en BAS de l'avatar
    if (seatNumber === 4) return `bottom-0 left-[${65+offset}px]`;
    // Sièges en bas (0, 8) -> Marqueurs en HAUT de l'avatar
    return `top-0 left-[${65+offset}px]`;
  };

  return (
    <div 
      className={`absolute flex flex-col items-center gap-2 ${positionClass} ${isWinner ? 'z-30 scale-110' : 'z-20'} transition-all duration-500`}
      style={{ opacity: (isActive || isCurrentUser) ? 1 : 0.8 }}
    >
      <style>{`
        @keyframes sonar {
          0% { transform: scale(1); opacity: 0.8; border-width: 4px; }
          100% { transform: scale(1.4); opacity: 0; border-width: 1px; }
        }
        .sonar-animation {
          animation: sonar 2s ease-out infinite;
        }
        .glass-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.8);
        }
        .metallic-border {
          border: 2px solid;
          border-image: linear-gradient(to bottom, #cfad3d, #fffce1, #cfad3d) 1;
        }
      `}</style>

      <div className="relative flex flex-col items-center">
        
        {/* Cartes avec ombre portée réaliste */}
        <div key={handKey} className="absolute top-6 z-20 flex perspective-1000">
          {showCards && (player.cards && player.cards.length > 0 ? player.cards : [null, null]).map((card: any, idx: number) => {
            const delay = (idx * numPlayers + (dealOrder - 1)) * 300;
            return (
              <div 
                key={idx} 
                className="animate-card-deal scale-[0.85] origin-bottom transition-transform duration-300 bg-black rounded-lg"
                style={{
                  '--deal-x': dealOrigin.x,
                  '--deal-y': dealOrigin.y,
                  animationDelay: `${delay}ms`,
                  zIndex: idx,
                  marginLeft: idx === 1 ? '-35px' : '0',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.8)'
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

        {/* Avatar avec contour Premium */}
        <div className="relative mt-4">
          {isActive && (
            <div className="absolute inset-[-12px] rounded-full border-yellow-400/60 sonar-animation z-0"></div>
          )}
          <div className={`w-24 h-24 min-w-[96px] min-h-[96px] rounded-full p-1 shadow-2xl z-10 transition-all duration-300
            ${isActive ? 'bg-gradient-to-tr from-yellow-600 via-yellow-200 to-yellow-600 scale-105' : 'bg-gradient-to-tr from-gray-700 to-gray-900'}`}>
            <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-black/50">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Dealer Button Réaliste */}
          {isDealer && (
            <div className={`absolute ${getMarkerPosition()} w-8 h-8 rounded-full bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center z-30 animate-in zoom-in duration-500`}>
              <span className="text-[12px] font-black text-gray-800">D</span>
            </div>
          )}

          {/* Small Blind Button */}
          {isSB && (
            <div className={`absolute ${getMarkerPosition(isDealer ? 35 : 0)} w-8 h-8 rounded-full bg-blue-600 shadow-lg border-2 border-blue-400 flex items-center justify-center z-30 animate-in zoom-in duration-500`}>
              <span className="text-[10px] font-black text-white">SB</span>
            </div>
          )}

          {/* Big Blind Button */}
          {isBB && (
            <div className={`absolute ${getMarkerPosition()} w-8 h-8 rounded-full bg-red-600 shadow-lg border-2 border-red-400 flex items-center justify-center z-30 animate-in zoom-in duration-500`}>
              <span className="text-[10px] font-black text-white">BB</span>
            </div>
          )}
        </div>

      {/* Capsule Nom/Solde Forme Trapèze Arrondi Glassmorphism */}
      <div className="glass-panel p-2 min-w-[130px] text-center z-20 mt-[-22px] relative overflow-hidden border-x border-t border-white/10"
           style={{ 
             // Polygone à 8 points pour simuler des coins arrondis en bas
             clipPath: "polygon(0% 0%, 100% 0%, 90% 70%, 85% 92%, 75% 100%, 25% 100%, 15% 92%, 10% 70%)",
             paddingBottom: '12px' 
           }}>
          {/* Reflet brillant */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-center gap-1.5 mb-0.5 pt-1">
            <div className="text-white text-[12px] font-black tracking-tight truncate max-w-[90px] drop-shadow-md uppercase italic">
              {player.name}
            </div>
          </div>
          
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-1" />
          
          <div className="flex items-center justify-center gap-1">
             <div className="text-yellow-400 text-[14px] font-black tracking-widest drop-shadow-md">
                {Number(player.chips).toLocaleString()}
             </div>
          </div>
          
          {/* Timer progress bar modernisée */}
          {isActive && (
            <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-yellow-500 to-yellow-200 transition-all duration-1000 ease-linear" 
                 style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
          )}
        </div>

        <BetChips 
          amount={player.bet} 
          shouldGather={isPlayerGathering} 
          position={positionClass} 
          seatNumber={seatNumber} 
          centerX={centerX} 
          centerY={centerY} 
          playerId={player.id} 
          gatheringPlayerId={gatheringPlayerId} 
        />
      </div>

      {/* Badge Action Modernisé */}
      {player.lastAction && (
        <div className={`absolute px-4 py-1 rounded-full text-[10px] font-black uppercase shadow-2xl border border-white/20 z-50 whitespace-nowrap transition-all duration-300 animate-in slide-in-from-top-2
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
