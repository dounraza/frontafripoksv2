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
  'bottom-[-4%] left-1/4 -translate-x-1/2',   
   'bottom-[18%] left-[-10%]',                  
   'top-[38%] left-[-14%]',                     
   'top-[18%] left-[-10%]',                     
   'top-[-8%] left-1/2 -translate-x-1/2',       
  'top-[18%] right-[-10%]',                    
  'top-[38%] right-[-14%]',                    
  'bottom-[18%] right-[-10%]',                 
  'bottom-[-4%] right-[8%]',                  
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
      { x: -120, y: 300 },  
         { x: -220, y: 130 },
          { x: -240, y: -50 },
          { x: -220, y: -220 },
            { x: 0, y: -420 }, 
          { x: 218, y: -220 },
            { x: 240, y: -60 },
             { x: 220, y: 130 },
              { x: 130, y: 300 },
    ];
    return offsets[idx] || { x: 0, y: 0 };
  };

  const tableWidth = isVertical ? 500 : 420;
  const tableHeight = isVertical ? 800 : 820;

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
    <div className="flex flex-col items-center w-full">
      <div className="relative transition-all duration-700 bg-gradient-to-br from-[#1e5a3d] to-[#0a2e1a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_150px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-[240px] border-[14px] border-[#3d2b1f] table-surface"
        style={{ width: `${tableWidth}px`, height: `${tableHeight}px`, aspectRatio: `${tableWidth}/${tableHeight}` }}>
        
        <div className="absolute inset-[6px] bg-cover opacity-10 pointer-events-none rounded-[228px]" style={{ backgroundImage: "url('/felt-texture.png')" }}></div>
        <div className="absolute inset-[6px] border-[#2c6e49] rounded-[228px] border-[3px]"></div>
        
        {/* CARDS LAYER */}
        <div className="absolute inset-0 pointer-events-none z-[100]">
           {players.map((player: any) => {
              const seatIdx = player.position;
              const offset = getSeatOffset(seatIdx);
              const showCards = (tableData.gameState === 'playing' || tableData.gameState === 'showdown') && player.lastAction !== 'out';
              
              if (!seatCoords[seatIdx]) return null;

              return (
                <div key={`${player.id}-${handKey}`} className="absolute z-[200]" style={{ left: `calc(50% + ${offset.x}px)`, top: `calc(50% + ${offset.y + 20}px)`, transform: 'translate(-50%, -50%)' }}>
                  {player.lastAction && (
                    <div className="absolute z-[300] top-8 -left-24 bg-yellow-500 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase shadow-lg whitespace-nowrap">
                      {player.lastAction}
                    </div>
                  )}
                  {showCards && player.lastAction !== 'fold' ? (
                    <CardDealer 
                      cards={player.cards}
                      dealOrigin={{ x: `${-offset.x}px`, y: `${-offset.y - 20}px` }}
                      dealOrder={1} numPlayers={players.length} handKey={handKey}
                      isRevealed={player.id === currentUserId || isMyTurn || isShowdown}
                      isShowdown={isShowdown} isVertical={isVertical}
                    />
                  ) : null}
                </div>
              );
           })}
        </div>

        {/* POT AND COMMUNITY CARDS */}
        <div className="flex flex-col items-center z-10 relative gap-6">
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
          <div className="relative z-20 flex flex-col items-center" ref={potRef}>
             <ChipPot 
               amount={displayPot} 
               winnerPosition={delayedWinnerIdx !== undefined ? String(delayedWinnerIdx) : undefined} 
               targetX={delayedWinnerIdx !== undefined ? `${seatCoords[delayedWinnerIdx]?.x || 0}px` : `0px`} 
               targetY={delayedWinnerIdx !== undefined ? `${seatCoords[delayedWinnerIdx]?.y || 0}px` : `0px`} 
             />
          </div>
          <div className="w-auto h-auto gap-4 px-6 flex items-center justify-center bg-[#1e5a3d]/20 rounded-xl shadow-inner border-2 border-white/5 relative z-10 opacity-100 min-h-[120px]">
            {communityCards.map((card: any, idx: number) => (
              <div 
                key={`${idx}-${card.value}-${card.suit}`} 
                className="animate-community-card"
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
