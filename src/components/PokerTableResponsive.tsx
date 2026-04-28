import React from 'react';
import { PlayerSlot } from './PlayerSlot';
import { Card } from './Card';
import { ChipPot } from './ChipPot';
import { EmptySlot } from './EmptySlot';
import { useSocket } from '../hooks/useSocket';
import { isPlayerTurn, getPlayerRoleInfo } from '../utils/pokerLogic';
import { CardDealer } from './CardDealer';
import { ActionPanel } from './ActionPanel';

interface PokerTableProps {
  tableData: any;
  currentUserId: string | undefined;
  currentUserName?: string;
  isVertical: boolean;
  sendAction: (type: string, amount?: number) => void;
  callAmount: number;
  isMyTurn: boolean;
}

// POSITIONS EXACTES DU BACKUP
const PLAYER_POSITIONS = [
  'bottom-[-4%] left-1/4 -translate-x-1/2',   
   'bottom-[18%] left-[-10%]',                  
   'top-[38%] left-[-8%]',                     
   'top-[18%] left-[-10%]',                     
   'top-[-6%] left-1/2 -translate-x-1/2',       
 'top-[18%] right-[-10%]',                    
 'top-[38%] right-[-10%]',                    
 'bottom-[18%] right-[-7%]',                 
  'bottom-[-4%] right-[8%]',                  
];

export const PokerTableResponsive: React.FC<PokerTableProps> = ({ 
  tableData, currentUserId, currentUserName, isVertical, sendAction, callAmount, isMyTurn 
}) => {
  if (!tableData) return null;

  const getSeatOffset = (idx: number) => {
    const offsets = [
      { x: -120, y: 350 },  
      { x: -240, y: 180 },
       { x: -240, y: -80 },
      { x: -240, y: -240 },
      { x: 0, y: -430 }, 
      { x: 248, y: -240 },
      { x: 260, y: -80 },
      { x: 220, y: 180 },
      { x: 150, y: 350 },
    ];

    // Ajustements spécifiques pour mobile (à modifier selon vos besoins)
    const mobileAdjustments = [
        { x: 20, y: -90 },   // Seat 0
        { x: 50, y: -15 }, // Seat 1
        { x: 60, y:   -140 },   // Seat 2
        { x: 70, y: 60 },  // Seat 3
        { x: 200, y: -430 },   // Seat 4
        { x: -70, y:60 }, // Seat 5
       { x: 340, y: -200 },  // Seat 6
        { x: -70, y: -60 },// Seat 7
        { x: -40, y: -90 },    // Seat 8
    ];

    const target = offsets[idx] || { x: 0, y: 0 };
    const adj = isVertical ? (mobileAdjustments[idx] || { x: 0, y: 0 }) : { x: 0, y: 0 };

    // Facteur de réduction et application des ajustements
    const factor = isVertical ? 0.85 : 1;

    return { 
      x: (target.x * factor) + adj.x, 
      y: (target.y * factor) + adj.y 
    };
  };

  const isShowdown = tableData.gameState === 'showdown';
  const winnerIds = tableData.winnerInfo?.map((w: any) => w.playerId) || [];
  const players = tableData.players || [];
  const communityCards = tableData.communityCards || [];
  
  const currentBetsSum = players.reduce((sum: number, p: any) => sum + (p.bet || 0), 0);
  const totalPotInPlay = (tableData.pot || 0) + currentBetsSum;
  
  const [lastTotalPot, setLastTotalPot] = React.useState(0);
  
  React.useEffect(() => {
    if (totalPotInPlay > 0 && !isShowdown) setLastTotalPot(totalPotInPlay);
  }, [totalPotInPlay, isShowdown]);

  const displayPot = isShowdown ? lastTotalPot : totalPotInPlay;
  const [handKey, setHandKey] = React.useState(0);
  
  const potRef = React.useRef<HTMLDivElement>(null);
  
  // ... (suppression de seatCoords, inutile désormais)

  const firstWinner = players.find((p: any) => winnerIds.includes(p.id));
  const winnerSeatIdx = firstWinner ? firstWinner.position : undefined;
  const [delayedWinnerIdx, setDelayedWinnerIdx] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (winnerSeatIdx !== undefined) {
      const delay = communityCards.length > 0 ? (communityCards.length * 400) + 1200 : 1000;
      const timer = setTimeout(() => {
        setDelayedWinnerIdx(winnerSeatIdx);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setDelayedWinnerIdx(undefined);
    }
  }, [winnerSeatIdx, communityCards.length]);

  return (
    <div className="flex flex-col items-center w-full p-0 m-0 overflow-visible">
      <div className="relative transition-all duration-700 bg-gradient-to-br from-[#0a2e1a] to-[#051a0f] shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_120px_rgba(0,0,0,0.6)] flex items-center justify-center rounded-[200px] border-[4px] border-[#1e5a3d]/30 w-[92%] max-w-[500px] aspect-[10/16]"
        style={{ margin: '0 auto' }}>
        
        <div className="absolute inset-[2px] bg-cover opacity-5 pointer-events-none rounded-[198px]" style={{ backgroundImage: "url('/felt-texture.png')" }}></div>
        <div className="absolute inset-[10px] border-[#1e5a3d]/10 rounded-[190px] border-[1px]"></div>
        
        {/* CARDS LAYER */}
        <div className="absolute inset-0 z-[100]">
           {players.map((player: any) => {
              const seatIdx = player.position;
              const offset = getSeatOffset(seatIdx);
              
              // Déterminer s'il y a un vrai affrontement (Showdown avec au moins 2 joueurs actifs)
              const activePlayersCount = players.filter((p: any) => p.status !== 'folded' && p.status !== 'out').length;
              const isRealShowdown = isShowdown && activePlayersCount > 1;

              const myPlayer = players.find((p: any) => p.id === currentUserId);
              const amIStillActive = myPlayer && myPlayer.status !== 'folded' && myPlayer.status !== 'out';
              
              // Révéler les cartes au showdown ou pour soi-même
              const isRevealed = amIStillActive && (
                (player.id === currentUserId) || 
                (isRealShowdown)
              );

              // NE PAS RESTER SI ON NAFFICHE PAS : 
              // Au showdown, on ne montre la carte que si elle est révélée.
              const shouldShowAtShowdown = isShowdown ? isRevealed : true;
              const showCards = (tableData.gameState === 'playing' || tableData.gameState === 'showdown') 
                                && player.status !== 'out' 
                                && player.status !== 'waiting'
                                && player.status !== 'folded'
                                && shouldShowAtShowdown;

              return (
                <div key={`${player.id}-${handKey}`} className="absolute z-[200]" 
                     style={{ 
                       left: `calc(50% + ${offset.x}px)`, 
                       top: `calc(50% + ${offset.y}px)`, 
                       transform: 'translate(-50%, -50%)',
                       pointerEvents: 'auto'
                     }}>
                  {player.lastAction && (
                    <div className="absolute z-[300] -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-2 py-0.5 rounded font-black text-[9px] uppercase shadow-lg whitespace-nowrap">
                      {player.lastAction}
                    </div>
                  )}
                  {showCards ? (
                    <div className={isVertical ? "scale-[0.7] origin-center" : ""}>
                      <CardDealer 
                        cards={player.cards}
                        dealOrigin={{ x: `${-offset.x}px`, y: `${-offset.y}px` }}
                        dealOrder={1} numPlayers={players.length} handKey={handKey}
                        isRevealed={isRevealed}
                        isShowdown={isShowdown} isVertical={isVertical}
                      />
                    </div>
                  ) : null}
                </div>
              );
           })}
        </div>

        {/* POT AND COMMUNITY CARDS */}
        <div className="flex flex-col items-center z-10 relative gap-3 sm:gap-6">
          <style>{`
            @keyframes slide-in-right {
              0% { transform: translateX(30px); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
            .animate-community-card {
              animation: slide-in-right 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              opacity: 0;
            }
          `}</style>
          
          <div className="relative z-20 flex flex-col items-center" ref={potRef}>
             <ChipPot 
               amount={displayPot} 
               winnerPosition={delayedWinnerIdx !== undefined ? String(delayedWinnerIdx) : undefined} 
               targetX={delayedWinnerIdx !== undefined ? `${getSeatOffset(delayedWinnerIdx).x}px` : `0px`} 
               targetY={delayedWinnerIdx !== undefined ? `${getSeatOffset(delayedWinnerIdx).y}px` : `0px`} 
             />
          </div>

          <style>{`
            @keyframes slide-in-right {
              0% { transform: translateX(50px) scale(var(--card-scale, 1)); opacity: 0; }
              100% { transform: translateX(0) scale(var(--card-scale, 1)); opacity: 1; }
            }
            .animate-community-card {
              animation: slide-in-right 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              opacity: 0;
            }
          `}</style>
          <div 
            className={`transition-all duration-700 gap-1.5 px-3 flex items-center justify-center bg-[#0a2e1a]/40 rounded-xl shadow-inner border border-white/5 relative z-10 min-h-[70px] sm:min-h-[110px] ${
              isVertical ? 'scale-[0.85]' : ''
            }`}
            style={{ '--card-scale': communityCards.length >= 5 ? '0.85' : '1' } as React.CSSProperties}
          >
            {communityCards.map((card: any, idx: number) => (
              <div 
                key={`${idx}-${card.value}-${card.suit}`} 
                className="animate-community-card origin-center shrink-0"
                style={{ animationDelay: `${idx * 0.6}s` }}
              >
                <Card value={card.value} suit={card.suit} hidden={false} />
              </div>
            ))}
          </div>
        </div>

        {/* PLAYERS */}
        {Array.from({ length: 9 }).map((_, idx) => {
          const player = players.find((p: any) => p.position === idx);
          if (!player) return <EmptySlot key={`empty-${idx}`} positionClass={PLAYER_POSITIONS[idx]} />;
          const { isDealer, isSB, isBB } = getPlayerRoleInfo(player, tableData);
          const offset = getSeatOffset(idx);

          return (
            <PlayerSlot 
              key={player.id} id={`seat-${idx}`} player={player} isActive={isPlayerTurn(tableData, player.id)} 
              isWinner={winnerIds.includes(player.id) && delayedWinnerIdx !== undefined} isDealer={isDealer} isSB={isSB} isBB={isBB}
              positionClass={PLAYER_POSITIONS[idx]} shouldGatherBets={tableData.gatheringBets} 
              dealOrigin={{ x: "0px", y: "0px" }} seatNumber={idx} isShowdown={isShowdown}
              handKey={handKey} gameState={tableData.gameState}
              isCurrentUser={player.id === currentUserId || player.name.trim().toLowerCase() === currentUserName?.trim().toLowerCase()}
              centerX={offset.x} centerY={offset.y} 
              gatheringPlayerId={tableData.gatheringPlayerId} isVertical={isVertical}
            />
          );
        })}
      </div>

      {/* ACTION PANEL INTEGRATED */}
      <div className="mt-8 sm:mt-12 w-full max-w-[500px] z-[2000]">
        <ActionPanel 
          sendAction={sendAction} 
          callAmount={callAmount} 
          isMyTurn={isMyTurn} 
        />
      </div>
    </div>
  );
};
