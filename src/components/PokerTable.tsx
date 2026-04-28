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

const PLAYER_POSITIONS = [
  'bottom-[-12%] left-1/4 -translate-x-1/2',   
   'bottom-[10%] left-[-25%]',                  
   'top-[25%] left-[-25%]',                     
  'top-[0%] left-[-10%]',                     
 'top-[-15%] left-1/2 -translate-x-1/2',       
'top-[0%] right-[-25%]',                    
'top-[28%] right-[-30%]',                    
'bottom-[5%] right-[-30%]',                 
  'bottom-[-8%] right-[8%]',                  
];
export const PokerTable: React.FC<PokerTableProps> = ({ 
  tableData, currentUserId, currentUserName, isVertical, sendAction, callAmount, isMyTurn 
}) => {
  if (!tableData) return null;

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
  const [seatCoords, setSeatCoords] = React.useState<any>({});

  React.useLayoutEffect(() => {
    const updateSeatCoords = () => {
      const potElement = potRef.current;
      if (!potElement) return;
      const potRect = potElement.getBoundingClientRect();
      const newCoords: any = {};
      for (let i = 0; i < 9; i++) {
        const seatElement = document.getElementById(`seat-${i}`);
        if (seatElement) {
          const seatRect = seatElement.getBoundingClientRect();
          newCoords[i] = {
            x: (seatRect.left + seatRect.width / 2) - (potRect.left + potRect.width / 2),
            y: (seatRect.top + seatRect.height / 2) - (potRect.top + potRect.height / 2)
          };
        }
      }
      setSeatCoords(newCoords);
    };
    updateSeatCoords();
    window.addEventListener('resize', updateSeatCoords);
    // Timeout to ensure elements are rendered
    const timer = setTimeout(updateSeatCoords, 500);
    return () => {
        window.removeEventListener('resize', updateSeatCoords);
        clearTimeout(timer);
    };
  }, [players, tableData.gameState]);

  const getSeatOffset = (idx: number) => {
    const offsets = [
     { x: -60, y: 140 },     // Seat 0
     { x: -140, y:52 }, // Seat 1
       { x: -140, y: -95 },   // Seat 2
      { x: -110, y: -205 },// Seat 3
     { x: 0, y: -230 },   // Seat 4
    { x: 140, y: -200 }, // Seat 5
    { x: 150, y: -80 },    // Seat 6
    { x: 140, y: 70 },  // Seat 7
      { x: 45, y: 120 },  // Seat 8
    ];
    return offsets[idx] || { x: 0, y: 0 };
  };


  // Animation logic for Pot -> Winner with Delay
  const firstWinner = players.find((p: any) => winnerIds.includes(p.id));
  const winnerSeatIdx = firstWinner ? firstWinner.position : undefined;
  const [delayedWinnerIdx, setDelayedWinnerIdx] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (winnerSeatIdx !== undefined) {
      // Wait for community cards (0.4s delay each + 0.8s animation)
      // For 5 cards, it takes about 2.8s to be fully shown
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
    <div className="flex flex-col items-center w-full h-full justify-center">
      <div className="relative transition-all duration-700 bg-gradient-to-br from-[#1e5a3d] to-[#0a2e1a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_150px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-full border-[12px] border-[#3d2b1f] table-surface"
        style={{ 
          width: 'auto', 
          height: '95%', 
          aspectRatio: '10/16',
          maxWidth: '95vw',
          maxHeight: '100%'
        }}>
        
        <div className="absolute inset-[6px] bg-cover opacity-10 pointer-events-none rounded-full" style={{ backgroundImage: "url('/felt-texture.png')" }}></div>
        <div className="absolute inset-[6px] border-[#2c6e49] rounded-full border-[3px]"></div>
        
        {/* CARDS LAYER */}
        <div className="absolute inset-0 pointer-events-none z-[100]">
           {players.map((player: any) => {
              const seatIdx = player.position;
              const offset = getSeatOffset(seatIdx);
              const showCards = (tableData.gameState === 'playing' || tableData.gameState === 'showdown') && player.lastAction !== 'out';
              
              // Déterminer s'il y a un vrai affrontement (Showdown avec au moins 2 joueurs actifs)
              const activePlayersCount = players.filter((p: any) => p.lastAction !== 'fold' && p.lastAction !== 'out').length;
              const isRealShowdown = isShowdown && activePlayersCount > 1;

              const myPlayer = players.find((p: any) => p.id === currentUserId);
              const amIStillActive = myPlayer && myPlayer.lastAction !== 'fold' && myPlayer.lastAction !== 'out';
              
              // Si je ne suis plus actif, je ne révèle plus rien. 
              // Sinon, je révèle mes cartes ou le showdown.
              const isRevealed = amIStillActive && (
                (player.id === currentUserId) || 
                (isRealShowdown)
              );

              if (!seatCoords[seatIdx]) return null;

              return (
                <div key={`${player.id}-${handKey}`} className="absolute z-[200]" style={{ left: `calc(50% + ${offset.x}px)`, top: `calc(50% + ${offset.y + 20}px)`, transform: 'translate(-50%, -50%)' }}>
                  {player.lastAction && (
                    <div className="absolute z-[300] top-0 -left-16 bg-yellow-500 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase shadow-lg whitespace-nowrap">
                      {player.lastAction}
                    </div>
                  )}
                  {showCards && player.lastAction !== 'fold' ? (
                    <CardDealer 
                      cards={player.cards}
                      dealOrigin={{ x: `${-offset.x}px`, y: `${-offset.y - 20}px` }}
                      dealOrder={1} numPlayers={players.length} handKey={handKey}
                      isRevealed={isRevealed && player.lastAction !== 'fold'}
                      isShowdown={isShowdown} isVertical={isVertical}
                    />
                  ) : null}
                </div>
              );
           })}
        </div>

        {/* POT AND COMMUNITY CARDS */}
        <div className="flex flex-col items-center z-10 relative gap-8 mt-[-40px]">
          <div className="z-20 flex flex-col items-center" ref={potRef}>
             <ChipPot 
               amount={displayPot} 
               winnerPosition={delayedWinnerIdx !== undefined ? String(delayedWinnerIdx) : undefined} 
               targetX={delayedWinnerIdx !== undefined ? `${seatCoords[delayedWinnerIdx]?.x || 0}px` : `0px`} 
               targetY={delayedWinnerIdx !== undefined ? `${seatCoords[delayedWinnerIdx]?.y || 0}px` : `0px`} 
             />
          </div>

          <style>{`
            @keyframes slide-in-right {
              0% { transform: translateX(50px); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
            .animate-community-card {
              animation: slide-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              opacity: 0;
            }
          `}</style>
          <div className="w-[220px] h-[70px] gap-1 flex items-center justify-center bg-[#1e5a3d]/20 rounded-xl shadow-inner border-2 border-white/5 z-10 opacity-100 shrink-0 overflow-hidden">
            {communityCards.map((card: any, idx: number) => (
              <div 
                key={`${idx}-${card.value}-${card.suit}`} 
                className="animate-community-card scale-[0.85] origin-center shrink-0"
                style={{ animationDelay: `${idx * 0.4}s` }}
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

          return (
            <PlayerSlot 
              key={player.id} id={`seat-${idx}`} player={player} isActive={isPlayerTurn(tableData, player.id)} 
              isWinner={winnerIds.includes(player.id) && delayedWinnerIdx !== undefined} isDealer={isDealer} isSB={isSB} isBB={isBB}
              positionClass={PLAYER_POSITIONS[idx]} shouldGatherBets={tableData.gatheringBets} 
              dealOrigin={{ x: "0px", y: "0px" }} seatNumber={idx} isShowdown={isShowdown}
              handKey={handKey} gameState={tableData.gameState}
              isCurrentUser={player.id === currentUserId || player.name.trim().toLowerCase() === currentUserName?.trim().toLowerCase()}
              centerX={seatCoords[idx]?.x || 0} centerY={seatCoords[idx]?.y || 0} 
              gatheringPlayerId={tableData.gatheringPlayerId} isVertical={true}
            />
          );
        })}
      </div>
    </div>
  );
};