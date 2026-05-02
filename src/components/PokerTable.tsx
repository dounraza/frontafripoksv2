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
  'bottom-[15%] sm:right-[-15%] right-[-5%]',                 
  'bottom-[-8%] right-[1%]',                  
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
  
  /* 
  if (IS_TEST_MODE) {
    players = [
      { id: '4', name: 'Bot 4', position: 4, chips: 500, status: 'active', cards: [{value: 'A', suit: 'h'}, {value: 'K', suit: 'h'}], bet: 100, lastAction: 'raise' },
      { id: '5', name: 'Bot 5', position: 5, chips: 800, status: 'active', cards: [{value: '7', suit: 'd'}, {value: '8', suit: 'd'}], bet: 50, lastAction: 'call' },
      { id: '6', name: 'Bot 6', position: 6, chips: 200, status: 'active', cards: [{value: 'J', suit: 's'}, {value: '10', suit: 'c'}], bet: 0, lastAction: 'check' },
      { id: '7', name: 'Bot 7', position: 7, chips: 1200, status: 'active', cards: [{value: '2', suit: 'h'}, {value: 'Q', suit: 's'}], bet: 200, lastAction: 'raise' },
      { id: '8', name: 'Bot 8', position: 8, chips: 900, status: 'active', cards: [{value: 'K', suit: 's'}, {value: 'K', suit: 'c'}], bet: 0, lastAction: 'check' },
    ];
  }
  */

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
    { x: 140, y: 70 },  // Seat 7
      { x: 45, y: 120 },  // Seat 8
    ];
    return offsets[idx] || { x: 0, y: 0 };
  };


  // Animation logic for Pot -> Winner with Delay
  const firstWinner = players.find((p: any) => winnerIds.includes(p.id));
  const winnerSeatIdx = firstWinner ? firstWinner.position : undefined;
  const [delayedWinnerIdx, setDelayedWinnerIdx] = React.useState<number | undefined>(undefined);
  
  const { playSound } = useSound();

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

  React.useEffect(() => {
    if (winnerSeatIdx !== undefined) {
      // Wait for community cards (0.7s delay each + 1.2s animation + buffer)
      const delay = communityCards.length > 0 ? (communityCards.length * 700) + 1500 : 1000;
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
      <div className="relative mt-20 transition-all duration-700 bg-gradient-to-br from-[#1e5a3d] to-[#0a2e1a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_150px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-full border-[12px] border-[#3d2b1f] table-surface"
        style={{ 
          width: 'auto', 
          height: '95%', 
          aspectRatio: '10/16',
          maxWidth: '95vw',
          maxHeight: '98%'
        }}>
        
        <div className="absolute inset-[6px] bg-cover opacity-10 pointer-events-none rounded-full" style={{ backgroundImage: "url('/felt-texture.png')" }}></div>
        <div className="absolute inset-[6px] border-[#2c6e49] rounded-full border-[3px]"></div>
        
        {/* LOGO DÉCORATIF AU MILIEU DE LA TABLE */}
        <div className="absolute flex flex-col items-center justify-center opacity-100 select-none pointer-events-none">
          <img src="/logo.ico" alt="AFRIPOKS Logo" className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
        </div>
        
        {/* POT AND COMMUNITY CARDS */}
        <div className="flex flex-col items-center z-10 relative gap-8 mt-[-110px]">
          <div className="z-20 flex flex-col items-center" ref={potRef}>
             <img src="/image/jetonMany.png" alt="Jetons" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
             <div className="text-yellow-500 font-black text-lg sm:text-xl mt-2">{displayPot.toLocaleString()} MGA</div>
          </div>

          <style>{`
            @keyframes slide-in-right {
              0% { transform: translateX(50px) scale(var(--card-scale, 1)); opacity: 0; }
              100% { transform: translateX(0) scale(var(--card-scale, 1)); opacity: 1; }
            }
            .animate-community-card {
              animation: slide-in-right 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              opacity: 0;
            }
          `}</style>
          <div 
            className={`transition-all duration-700 gap-2 px-4 flex items-center justify-center bg-[#1e5a3d]/30 rounded-2xl shadow-inner border-2 border-white/10 z-10 opacity-100 shrink-0 ${
              communityCards.length >= 5 ? 'h-[120px] min-w-[300px]' : 'h-[130px] min-w-[320px]'
            } ${tableData.gameState === 'all_fold' ? 'hidden' : ''}`}
            style={{ '--card-scale': communityCards.length >= 5 ? '1.15' : '1.25' } as React.CSSProperties}
          >
            {communityCards.map((card: any, idx: number) => (
              <div 
                key={`${idx}-${card.value}-${card.suit}`} 
                className="animate-community-card origin-center shrink-0"
                style={{ animationDelay: `${idx * 1.0}s` }}
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
