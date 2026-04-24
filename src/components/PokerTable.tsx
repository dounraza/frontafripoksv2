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
}

const PLAYER_POSITIONS = [
  'bottom-[-4%] left-1/2 -translate-x-1/2',   // Seat 0
  'bottom-[18%] left-[-10%]',                  // Seat 1
  'top-[38%] left-[-14%]',                     // Seat 2
  'top-[18%] left-[-10%]',                     // Seat 3
  'top-[-8%] left-1/2 -translate-x-1/2',       // Seat 4
  'top-[18%] right-[-10%]',                    // Seat 5
  'top-[38%] right-[-14%]',                    // Seat 6
  'bottom-[18%] right-[-10%]',                 // Seat 7
  'bottom-[-4%] right-[28%]',                  // Seat 8
];

export const PokerTable: React.FC<PokerTableProps> = ({ tableData, currentUserId, currentUserName, isVertical }) => {
  if (!tableData) return null;

  // @ts-ignore
  const { socket } = useSocket();

  const isShowdown = tableData.gameState === 'showdown';
  const winnerIds = tableData.winnerInfo?.map((w: any) => w.playerId) || [];
  const players = tableData.players || [];
  const communityCards = tableData.communityCards || [];
  
  const currentBetsSum = players.reduce((sum: number, p: any) => sum + (p.bet || 0), 0);
  const totalPotInPlay = (tableData.pot || 0) + currentBetsSum;
  
  const [lastTotalPot, setLastTotalPot] = React.useState(0);
  
  React.useEffect(() => {
    if (totalPotInPlay > 0 && !isShowdown) {
      setLastTotalPot(totalPotInPlay);
    }
  }, [totalPotInPlay, isShowdown]);

  const displayPot = isShowdown ? lastTotalPot : totalPotInPlay;

  const [prevPhase, setPrevPhase] = React.useState<string>('');
  const [prevGameState, setPrevGameState] = React.useState<string>('');
  const [shouldGather, setShouldGather] = React.useState(false);
  const [handKey, setHandKey] = React.useState(0);
  const [showDeck, setShowDeck] = React.useState(false);
  
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
    const timer = setTimeout(updateSeatCoords, 500);
    window.addEventListener('resize', updateSeatCoords);
    return () => {
      window.removeEventListener('resize', updateSeatCoords);
      clearTimeout(timer);
    };
  }, [players, tableData.gameState]);

  React.useEffect(() => {
    if (!tableData) return;
    const currentPhase = tableData.currentPhase;
    const currentGameState = tableData.gameState;

    const isNewHand = (currentGameState === 'playing' && prevGameState !== 'playing') || (currentGameState === 'playing' && currentPhase === 'pre-flop' && prevPhase !== 'pre-flop' && prevPhase !== '');
    const hasUncollectedBets = players.some((p: any) => p.bet > 0);

    if (isNewHand && hasUncollectedBets) {
      setShouldGather(true); 
      setTimeout(() => {
        setShouldGather(false);
        setTimeout(() => {
          setHandKey(prev => prev + 1);
          setShowDeck(true);
          const dealDuration = (2 * players.length) * 300 + 1000;
          setTimeout(() => setShowDeck(false), dealDuration);
        }, 500);
      }, 1200);
      setPrevGameState(currentGameState);
      setPrevPhase(currentPhase);
      return;
    }
    if (currentPhase !== prevPhase && prevPhase !== '' && currentGameState === 'playing') {
      setShouldGather(true);
      setPrevPhase(currentPhase);
      setTimeout(() => {
        setShouldGather(false);
        setShowDeck(true);
        const communityDealDuration = (currentPhase === 'flop' ? 3 : 1) * 150 + 1000;
        setTimeout(() => setShowDeck(false), communityDealDuration);
      }, 800);
      return;
    }
    if (currentGameState !== prevGameState) setPrevGameState(currentGameState);
    if (currentPhase !== prevPhase) setPrevPhase(currentPhase);
  }, [tableData?.currentPhase, tableData?.gameState, players.length]);

  const winningPlayerIndex = players.findIndex((p: any) => winnerIds.includes(p.id));
  const winnerSeat = winningPlayerIndex !== -1 ? players[winningPlayerIndex].position : -1;

  const getSeatOffset = (idx: number) => {
    const offsets = [
      { x: 0, y: 300 },    // Seat 0
      { x: -220, y: 130 }, // Seat 1
      { x: -220, y: -50 }, // Seat 2
      { x: -140, y: -220 },// Seat 3
      { x: 0, y: -300 },   // Seat 4
      { x: 140, y: -220 }, // Seat 5
      { x: 220, y: -50 },  // Seat 6
      { x: 180, y: 150 },  // Seat 7
      { x: 100, y: 300 },  // Seat 8
    ];
    return offsets[idx] || { x: 0, y: 0 };
  };

  const tableWidth = isVertical ? 500 : 420;
  const tableHeight = isVertical ? 800 : 820;
  const winOffset = winnerSeat !== -1 ? getSeatOffset(winnerSeat) : { x: 0, y: 0 };

  const DECK_X = 0;
  const DECK_Y = 0;

  return (
    <div className="relative flex flex-col items-center justify-center poker-table">
      <div 
        className="relative transition-all duration-700 bg-gradient-to-br from-[#1e5a3d] to-[#0a2e1a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_150px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-[240px] border-[14px] border-[#3d2b1f] table-surface"
        style={{ width: `${tableWidth}px`, height: `${tableHeight}px`, aspectRatio: `${tableWidth}/${tableHeight}` }}
      >
        <div className="absolute inset-[6px] bg-cover opacity-10 pointer-events-none rounded-[228px]" style={{ backgroundImage: "url('/felt-texture.png')" }}></div>
        <div className="absolute inset-[6px] border-[#2c6e49] rounded-[228px] border-[3px]"></div>
        
        {/* LOGIQUE DE DISTRIBUTION */}
        <div className="absolute inset-0 pointer-events-none z-[100]">
           {players.map((player: any) => {
              const seatIdx = player.position;
              const offset = getSeatOffset(seatIdx);
              const presentPositions = players.map((p: any) => p.position).sort((a: any, b: any) => a - b);
              const dealerIdx = presentPositions.indexOf(tableData.dealerIndex);
              const playerIdx = presentPositions.indexOf(player.position);
              const numPresent = presentPositions.length;
              const sequenceIndex = (playerIdx - dealerIdx + numPresent) % numPresent;
              const dealOrder = sequenceIndex === 0 ? numPresent : sequenceIndex;
              
              const isFolded = player.lastAction === 'fold';
              const isOut = player.lastAction === 'out';
              const showCards = (tableData.gameState === 'playing' || tableData.gameState === 'showdown') && !isFolded && !isOut;
              
              if (!showCards) return null;

              const isMe = player.id === currentUserId;
              const finalTopOffset = isMe ? 18 : 30; 

              return (
                <div key={`${player.id}-${handKey}`} className="absolute" style={{ left: `calc(50% + ${offset.x}px)`, top: `calc(50% + ${offset.y + finalTopOffset}px)`, transform: 'translate(-50%, -50%)' }}>
                  <CardDealer 
                    cards={player.cards}
                    dealOrigin={{ x: `${-offset.x + DECK_X}px`, y: `${-offset.y - finalTopOffset + DECK_Y}px` }}
                    dealOrder={dealOrder}
                    numPlayers={numPresent}
                    handKey={handKey}
                    isRevealed={player.id === currentUserId || isShowdown}
                    isShowdown={isShowdown}
                    isVertical={isVertical}
                  />
                </div>
              );
           })}
        </div>

        <div className="flex flex-col items-center z-10 relative gap-6">
          <div className="relative z-20 flex flex-col items-center" ref={potRef}>

            <div 
              className={`absolute flex items-center justify-center transition-all duration-700 pointer-events-none z-50`}
              style={{ top: `${DECK_Y}px`, left: `calc(50% + ${DECK_X}px)`, transform: 'translateX(-50%) translateY(0) scale(0.6)', display: 'none' }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute w-20 h-28 bg-[#1e5a3d] border border-white/20 rounded-lg flex items-center justify-center" style={{ transform: `translate(${-i * 1.5}px, ${-i * 1.5}px)`, zIndex: 10 - i }}>
                  <img src="/logo.ico" alt="logo" className="w-1/2 h-1/2 object-contain opacity-50" />
                </div>
              ))}
            </div>
            <ChipPot amount={displayPot} winnerPosition={isShowdown ? 'active' : undefined} targetX={`${winOffset.x}px`} targetY={`${winOffset.y}px`} />
          </div>
          <div className="w-auto h-auto gap-4 px-6 flex items-center justify-center bg-[#1e5a3d]/20 rounded-xl shadow-inner border-2 border-white/5 relative z-10 opacity-20">
            {communityCards.map((card: any, idx: number) => (
              <div key={`${tableData.gameState}-${idx}`} style={{ animationDelay: `${idx * 150}ms` }} className="animate-community-slide transform hover:scale-110 transition-transform duration-200">
                <Card value={card.value} suit={card.suit} hidden={false} />
              </div>
            ))}
            {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
              <div key={i} className="w-20 h-28 border-2 border-dashed border-gray-600/50 rounded-lg flex items-center justify-center text-gray-700 text-lg font-black">?</div>
            ))}
          </div>
        </div>

        {Array.from({ length: 9 }).map((_, idx) => {
          const player = players.find((p: any) => p.position === idx);
          
          if (!player) {
             return <EmptySlot key={`empty-${idx}`} positionClass={PLAYER_POSITIONS[idx]} />;
          }

          const isWinner = winnerIds.includes(player.id) && isShowdown;
          const { isDealer, isSB, isBB } = getPlayerRoleInfo(player, tableData);

          return (
            <PlayerSlot 
              key={player.id}
              id={`seat-${idx}`}
              player={player} isActive={isPlayerTurn(tableData, player.id)} 
              isWinner={isWinner} isDealer={isDealer} isSB={isSB} isBB={isBB}
              positionClass={PLAYER_POSITIONS[idx]} shouldGatherBets={shouldGather} 
              dealOrigin={{ x: "0px", y: "0px" }}
              seatNumber={idx} isShowdown={isShowdown} dealOrder={0} numPlayers={0}
              handKey={handKey} gameState={tableData.gameState}
              isCurrentUser={player.id === currentUserId || player.name.trim().toLowerCase() === currentUserName?.trim().toLowerCase()}
              centerX={0} centerY={0}
              gatheringPlayerId={null}
              isVertical={true}
            />
          );
        })}
      </div>
      
      {/* ACTION PANEL NESORINA ETO FA AO AMIN'NY APP.TSX NY ACTION */}
    </div>
  );
};
