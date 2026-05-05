import React from 'react';
import { PlayerSlot } from './PlayerSlot';
import { PlayerSeatContainer } from './PlayerSeatContainer';
import { Card } from './Card';
import { ChipPot } from './ChipPot';
import { EmptySlot } from './EmptySlot';
import { useSocket } from '../hooks/useSocket';
import { useSound } from '../hooks/useSound';
import { isPlayerTurn, getPlayerRoleInfo } from '../utils/pokerLogic';
import { CardDealer } from './CardDealer';
import { BetChips } from './BetChips';

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
  'bottom-[-2%] sm:left-1/4 left-[35%] -translate-x-1/2',   
  'bottom-[20%] sm:left-[-15%] left-[-8%]',                  
  'top-[26%] sm:left-[-15%] left-[-8%]',                     
  'top-[2%] sm:left-[-10%] left-[-2%]',                     
  'top-[-10%] sm:top-[-13%] left-1/2 -translate-x-1/2',       
  'top-[2%] sm:right-[-15%] right-[-2%]',                    
  'top-[21%] sm:right-[-15%] right-[-8%]',                    
  'bottom-[25%] sm:right-[-15%] right-[-5%]',                 
  'bottom-[-2%] right-[1%]',                  
];
export const PokerTable: React.FC<PokerTableProps> = ({ 
  tableData, currentUserId, currentUserName, isVertical, sendAction, sendEmoji, callAmount, isMyTurn 
}) => {
  const { newEmoji } = useSocket();
  
  if (!tableData) return null;

  const isShowdown = tableData.gameState === 'showdown';
  const winnerIds = tableData.winnerInfo?.map((w: any) => w.playerId) || [];
  
  // TEST MODE
  const IS_TEST_MODE = false; 
  let players = tableData.players || [];
  
  if (IS_TEST_MODE) {
    // Logic removed
  }

  const communityCards = tableData.communityCards || [];
  
  const currentBetsSum = players.reduce((sum: number, p: any) => sum + (p.bet || 0), 0);
  const totalPotInPlay = (tableData.pot || 0) + currentBetsSum;
  
  const [lastTotalPot, setLastTotalPot] = React.useState(0);
  
  React.useEffect(() => {
    if (totalPotInPlay > 0) setLastTotalPot(totalPotInPlay);
  }, [totalPotInPlay]);

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
      // Raha misy fiovana vao manao set
      setSeatCoords((prev: any) => JSON.stringify(prev) !== JSON.stringify(newCoords) ? newCoords : prev);
    };
    updateSeatCoords();
    window.addEventListener('resize', updateSeatCoords);
    const timer = setTimeout(updateSeatCoords, 500);
    return () => {
        window.removeEventListener('resize', updateSeatCoords);
        clearTimeout(timer);
    };
  }, []); // Esorina ny dependency raha tsy ilaina isaky ny miova ny data

  const getSeatOffset = (idx: number) => {
    const offsets = [
     { x: -60, y: 140 },     // Seat 0
     { x: -140, y:32 }, // Seat 1
       { x: -140, y: -95 },   // Seat 2
      { x: -110, y: -205 },// Seat 3
     { x: 0, y: -230 },   // Seat 4
    { x: 140, y: -200 }, // Seat 5
    { x: 150, y: -80 },    // Seat 6
    { x: 140, y: 80 },  // Seat 7
      { x: 45, y: 120 },  // Seat 8
    ];
    return offsets[idx] || { x: 0, y: 0 };
  };


  // Animation logic for Pot -> Winner with Delay
  const firstWinner = players.find((p: any) => winnerIds.includes(p.id));
  const winnerSeatIdx = firstWinner ? firstWinner.position : undefined;
  const [delayedWinnerIdx, setDelayedWinnerIdx] = React.useState<number | undefined>(undefined);
  
  const { playSound } = useSound();
  const lastPlayedActionRef = React.useRef<{[key: string]: string}>({});

  // Jouer le son de partage de cartes quand les cartes communautaires changent
  React.useEffect(() => {
    if (communityCards.length > 0) {
      playSound('share-cards');
    }
  }, [communityCards.length]);

  // Jouer le son de victoire
  React.useEffect(() => {
    if (winnerIds.length > 0) {
      playSound('win');
    }
  }, [winnerIds.length]);

  // Sons des actions des joueurs (Optimisé pour ne jouer qu'une fois)
  React.useEffect(() => {
    players.forEach((p: any) => {
      const actionKey = `${p.id}-${p.lastAction}`;
      if (p.lastAction && lastPlayedActionRef.current[p.id] !== actionKey) {
        lastPlayedActionRef.current[p.id] = actionKey;
        switch (p.lastAction) {
          case 'fold': playSound('fold'); break;
          case 'call': playSound('call'); break;
          case 'raise': playSound('raise'); break;
          case 'all-in': playSound('allin'); break;
          case 'check': playSound('check'); break;
        }
      }
      // Reset si plus d'action
      if (!p.lastAction) {
        lastPlayedActionRef.current[p.id] = '';
      }
    });
  }, [players]);

  React.useEffect(() => {
    if (winnerSeatIdx !== undefined) {
      // Wait for community cards (0.8s delay each + 1.2s animation)
      const delay = communityCards.length > 0 ? (communityCards.length * 800) + 1200 : 1000;
      const timer = setTimeout(() => {
        setDelayedWinnerIdx(winnerSeatIdx);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setDelayedWinnerIdx(undefined);
    }
  }, [winnerSeatIdx, communityCards.length]);

  return (
    <div className="flex flex-col items-center w-full h-full justify-center overflow-visible" style={{ backgroundImage: "url('/image/font.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'

     }}>
      <div className="relative transition-all duration-700 bg-gradient-to-br from-[#1e5a3d] to-[#0a2e1a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_150px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-full border-[12px] border-[#3d2b1f] table-surface"
        style={{ 
          width: 'auto', 
          height: '90%', 
          aspectRatio: '10/16',
          maxWidth: '90vw',
          maxHeight: '90%'
        }}>
        
        <div className="absolute inset-[6px] bg-cover bg-center opacity-2 pointer-events-none rounded-full" style={{ backgroundImage: "url('/image/font.jpg')" }}></div>
        <div className="absolute inset-[6px] border-[#2c6e49] rounded-full border-[3px]"></div>
        
        {/* LOGO DÉCORATIF AU MILIEU DE LA TABLE */}
        <div className="absolute flex flex-col items-center justify-center opacity-100 select-none pointer-events-none">
          <img src="/font.png" alt="AFRIPOKS Logo" className="w-30 h-30 sm:w-28 sm:h-28 object-contain rounded-[100%]" />
        </div>
        
        {/* POT AND COMMUNITY CARDS */}
        <div className="flex flex-col items-center z-10 relative gap-8 mt-[-110px]">
          <div className="z-20 flex flex-col items-center" ref={potRef}>
             <ChipPot 
               amount={displayPot} 
               winnerPosition={delayedWinnerIdx !== undefined ? String(delayedWinnerIdx) : undefined} 
               targetX={delayedWinnerIdx !== undefined ? `${seatCoords[delayedWinnerIdx]?.x ?? getSeatOffset(delayedWinnerIdx).x}px` : `0px`} 
               targetY={delayedWinnerIdx !== undefined ? `${seatCoords[delayedWinnerIdx]?.y ?? getSeatOffset(delayedWinnerIdx).y}px` : `0px`} 
             />
          </div>

          <style>{`
            @keyframes slide-in-right {
              0% { transform: translateX(50px) scale(var(--card-scale, 1)); opacity: 0; }
              100% { transform: translateX(0) scale(var(--card-scale, 1)); opacity: 1; }
            }
            .animate-community-card {
              animation: slide-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              opacity: 0;
            }
            `}</style>
            <div 
            className={`transition-all duration-700 gap-3 px-4 flex items-center justify-center rounded-2xl z-10 shrink-0 ${
             communityCards.length >= 5 ? 'h-[120px] min-w-[310px]' : 'h-[130px] min-w-[330px]'
            } ${tableData.gameState === 'all_fold' ? 'hidden' : ''}`}
            style={{ '--card-scale': communityCards.length >= 5 ? '1.15' : '1.25' } as React.CSSProperties}
            >
            {communityCards.map((card: any, idx: number) => (
             <div
               key={`${idx}-${card.value}-${card.suit}`}
               className="animate-community-card origin-center shrink-0"
               style={{ animationDelay: `${idx * 0.5}s` }}
             >
               <Card value={card.value} suit={card.suit} hidden={false} />
             </div>
            ))}
            </div>        </div>

        {/* PLAYERS */}
        {Array.from({ length: 9 }).map((_, idx) => {
          const player = players.find((p: any) => p.position === idx);
          if (!player) return <EmptySlot key={`empty-${idx}`} positionClass={PLAYER_POSITIONS[idx]} />;
          const { isDealer, isSB, isBB } = getPlayerRoleInfo(player, tableData);
          
          const myPlayer = players.find((p: any) => p.id === currentUserId);
          const amIStillActive = myPlayer && 
                                myPlayer.status !== 'folded' && 
                                myPlayer.status !== 'out' && 
                                myPlayer.lastAction !== 'fold';
          const isRealShowdown = isShowdown && players.filter((p: any) => p.status !== 'folded' && p.status !== 'out').length > 1;
          const isRevealed = amIStillActive && (player.id === currentUserId || isRealShowdown);

          return (
            <PlayerSeatContainer 
              key={player.id}
              player={player} 
              gameType={tableData.gameType}
              isActive={isPlayerTurn(tableData, player.id)} 
              isWinner={winnerIds.includes(player.id) && delayedWinnerIdx !== undefined} 
              isDealer={isDealer} isSB={isSB} isBB={isBB}
              positionClass={PLAYER_POSITIONS[idx]} 
              shouldGatherBets={tableData.gatheringBets} 
              seatNumber={idx} 
              isShowdown={isShowdown}
              gameState={tableData.gameState}
              isCurrentUser={player.id === currentUserId || player.name.trim().toLowerCase() === currentUserName?.trim().toLowerCase()}
              centerX={seatCoords[idx]?.x || 0} 
              centerY={seatCoords[idx]?.y || 0} 
              gatheringPlayerId={tableData.gatheringPlayerId} 
              isVertical={isVertical}
              isRevealed={isRevealed}
              isMeActive={amIStillActive || false}
              handKey={handKey}
              currentEmoji={newEmoji?.playerName === player.name ? newEmoji.emoji : null}
              sendEmoji={sendEmoji}
            />
          );
        })}
      </div>
    </div>
  );
};
