import React from 'react';
import { PlayerSlot } from './PlayerSlot';
import { Card } from './Card';
import { ChipPot } from './ChipPot';
import { Chat } from './Chat';
import { EmptySlot } from './EmptySlot';
import { useSocket } from '../hooks/useSocket';
import { isPlayerTurn, getPlayerRoleInfo } from '../utils/pokerLogic';

interface PokerTableProps {
  tableData: any;
  currentUserId: string | undefined;
  currentUserName?: string;
}

const POSITIONS_VERTICAL = [
  'bottom-[-4%] left-[25%] -translate-x-1/2',
  'bottom-[17%] left-[-23%]',
  'top-[27%] left-[-26%]',                   // Ancien Seat 3, remonté
  'top-[3%] left-[-23%]',                   // Ancien Seat 2, remonté
  'top-[-20%] left-[50%] -translate-x-1/2',
  'top-[4%] right-[-25%]',                  // Seat 5 ajusté
  'top-[34%] right-[-34%]',
  'bottom-[25%] right-[-31%]',
  'bottom-[2%] right-[2%]',
];

export const PokerTable: React.FC<PokerTableProps> = ({ tableData, currentUserId, currentUserName }) => {
  if (!tableData) return null;

  const { socket } = useSocket();
  const PLAYER_POSITIONS = POSITIONS_VERTICAL;

  const isShowdown = tableData.gameState === 'showdown';
  const winnerIds = tableData.winnerInfo?.map((w: any) => w.playerId) || [];
  const players = tableData.players || [];
  const communityCards = tableData.communityCards || [];
  
  // Calcul du pot total en temps réel : Pot au centre + Somme des mises sur la table
  const currentBetsSum = players.reduce((sum: number, p: any) => sum + (p.bet || 0), 0);
  const totalPotInPlay = (tableData.pot || 0) + currentBetsSum;
  
  // On garde une trace du dernier pot pour l'animation de gain (showdown)
  const [lastTotalPot, setLastTotalPot] = React.useState(0);
  
  React.useEffect(() => {
    if (totalPotInPlay > 0 && !isShowdown) {
      setLastTotalPot(totalPotInPlay);
    }
  }, [totalPotInPlay, isShowdown]);

  const displayPot = isShowdown ? lastTotalPot : totalPotInPlay;

  const [gatheringPlayerId, setGatheringPlayerId] = React.useState<string | null>(null);
  
  const [prevPhase, setPrevPhase] = React.useState<string>('');
  const [prevGameState, setPrevGameState] = React.useState<string>('');
  const [shouldGather, setShouldGather] = React.useState(false);
  const [handKey, setHandKey] = React.useState(0);
  const [showDeck, setShowDeck] = React.useState(false);
  const [showWinnerBanner, setShowWinnerBanner] = React.useState(false);
  
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
            x: seatRect.left - potRect.left,
            y: seatRect.top - potRect.top
          };
        }
      }
      setSeatCoords(newCoords);
    };
    
    updateSeatCoords();
    window.addEventListener('resize', updateSeatCoords);
    return () => window.removeEventListener('resize', updateSeatCoords);
  }, [players]);

  React.useEffect(() => {
    if (!tableData) return;
    const currentPhase = tableData.currentPhase;
    const currentGameState = tableData.gameState;

    if (currentGameState !== 'showdown') {
      setShowWinnerBanner(false);
    } else if (currentGameState === 'showdown' && prevGameState !== 'showdown') {
      const delay = (communityCards.length * 150) + 1000;
      setTimeout(() => setShowWinnerBanner(true), delay);
    }

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
      { x: -80, y: 300 },   // Seat 0
      { x: -200, y: 150 },// Seat 1
      { x: -250, y: 0 },  // Seat 2
      { x: -200, y: -150 },// Seat 3
      { x: 0, y: -200 },  // Seat 4
      { x: 200, y: -150 },// Seat 5
      { x: 250, y: 0 },   // Seat 6
      { x: 200, y: 150 }, // Seat 7
      { x: 0, y: 50 },    // Seat 8
    ];
    return offsets[idx] || { x: 0, y: 0 };
  };

  const dealOrigins = [
    { x: '0px', y: '-391px' }, { x: '70px', y: '-212.5px' }, { x: '70px', y: '170px' }, { x: '90px', y: '340px' }, { x: '0px', y: '391px' }, { x: '-90px', y: '170px' }, { x: '-90px', y: '340px' }, { x: '-70px', y: '-212.5px' }, { x: '-90px', y: '-391px' },
  ];

  const winOffset = winnerSeat !== -1 ? getSeatOffset(winnerSeat) : { x: 0, y: 0 };

  return (
    <div className="relative w-full flex flex-col items-center mt-20">
      <div className="relative transition-all duration-700 bg-gradient-to-br from-[#1e5a3d] to-[#0a2e1a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_150px_rgba(0,0,0,0.5)] flex items-center justify-center w-full max-w-[480px] aspect-[480/850] rounded-[240px] border-[14px] border-[#3d2b1f]">
        <div className="absolute inset-[6px] bg-cover opacity-10 pointer-events-none rounded-[228px]" style={{ backgroundImage: "url('/felt-texture.png')" }}></div>
        <div className="absolute inset-[6px] border-[#2c6e49] rounded-[228px] border-[3px]"></div>
        <div className="flex flex-col items-center z-10 relative gap-4">

          <div className="relative z-20 flex flex-col items-center" ref={potRef}>
            <div className={`absolute -top-36 flex items-center justify-center transition-all duration-700 pointer-events-none z-50 ${showDeck ? 'opacity-100 translate-y-0 scale-[0.6]' : 'opacity-0 -translate-y-4 scale-50'}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute w-20 h-28 bg-black shadow-2xl border-2 border-white/20 rounded-lg flex items-center justify-center" style={{ transform: `translate(${-i * 1.5}px, ${-i * 1.5}px)`, zIndex: 10 - i }}>
                  <img src="/logo.ico" alt="logo" className="w-1/2 h-1/2 object-contain" />
                </div>
              ))}
            </div>
            <ChipPot amount={displayPot} winnerPosition={isShowdown ? 'active' : undefined} targetX={`${winOffset.x}px`} targetY={`${winOffset.y}px`} />
          </div>
          <div className="w-auto h-auto gap-4 px-6 flex items-center justify-center bg-black/40 rounded-xl shadow-inner border-2 border-white/10 relative z-10">
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
          if (!player) return <EmptySlot key={`empty-${idx}`} positionClass={PLAYER_POSITIONS[idx]} />;
          
          const isWinner = winnerIds.includes(player.id) && isShowdown;
          
          // Calcul de la séquence pour SB/BB
          const presentPositions = players.map((p: any) => p.position).sort((a, b) => a - b);
          const dealerIdx = presentPositions.indexOf(tableData.dealerIndex);
          const playerIdx = presentPositions.indexOf(player.position);
          const numPresent = presentPositions.length;
          const sequenceIndex = (playerIdx - dealerIdx + numPresent) % numPresent;
          const dealOrder = sequenceIndex === 0 ? numPresent : sequenceIndex;

          // Détection du Dealer, SB et BB (via utilitaire logic)
          const { isDealer, isSB, isBB } = getPlayerRoleInfo(player, tableData);

          return (
            <div key={player.id} id={`seat-${idx}`} className="transition-all duration-700">
              <PlayerSlot 
                player={player} isActive={isPlayerTurn(tableData, player.id)} 
                isWinner={isWinner} isDealer={isDealer} isSB={isSB} isBB={isBB}
                positionClass={PLAYER_POSITIONS[idx]} shouldGatherBets={shouldGather || gatheringPlayerId === player.id} dealOrigin={dealOrigins[idx]}
                seatNumber={idx} isShowdown={isShowdown} dealOrder={dealOrder} numPlayers={numPresent}
                handKey={handKey} gameState={tableData.gameState}
                isCurrentUser={player.id === currentUserId || player.name.trim().toLowerCase() === currentUserName?.trim().toLowerCase()}
                centerX={seatCoords[idx]?.x || 0} centerY={seatCoords[idx]?.y || 0}
                gatheringPlayerId={gatheringPlayerId}
                />
                </div>          );
        })}
      </div>
    </div>
  );
};
