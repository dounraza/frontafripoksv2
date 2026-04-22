import React from 'react';
import { PlayerSlot } from './PlayerSlot';
import { Card } from './Card';
import { ChipPot } from './ChipPot';
import { Chat } from './Chat';
import { EmptySlot } from './EmptySlot';
import { useSocket } from '../hooks/useSocket';

interface PokerTableProps {
  tableData: any;
  currentUserId: string | undefined;
  currentUserName?: string;
  isVertical?: boolean;
}

const POSITIONS_HORIZONTAL = [
  'bottom-[-10%] left-[50%] -translate-x-1/2',
  'bottom-[15%] left-[-4%]',
  'top-[25%] left-[-4%]',
  'top-[-2%] left-[10%]',
  'top-[-15%] left-[35%] -translate-x-1/2',
  'top-[-15%] right-[35%] translate-x-1/2',
  'top-[-2%] right-[10%]',
  'top-[25%] right-[-4%]',
  'bottom-[15%] right-[-4%]',
];

const POSITIONS_VERTICAL = [
  'bottom-[-4%] left-[15%] -translate-x-1/2',
  'bottom-[23%] left-[-12%]',
  'top-[27%] left-[-15%]',                   // Ancien Seat 3, remonté
  'top-[3%] left-[-12%]',                   // Ancien Seat 2, remonté
  'top-[-8%] left-[50%] -translate-x-1/2',
  'top-[4%] right-[-6%]',                  // Seat 5 ajusté
  'top-[27%] right-[-15%]',
  'bottom-[25%] right-[-12%]',
  'bottom-[2%] right-[6%]',
];

export const PokerTable: React.FC<PokerTableProps> = ({ tableData, currentUserId, currentUserName, isVertical = true }) => {
  if (!tableData) return null;

  const { socket } = useSocket();
  const PLAYER_POSITIONS = isVertical ? POSITIONS_VERTICAL : POSITIONS_HORIZONTAL;

  const isShowdown = tableData.gameState === 'showdown';
  const winnerIds = tableData.winnerInfo?.map((w: any) => w.playerId) || [];
  const players = tableData.players || [];
  const communityCards = tableData.communityCards || [];

  const [prevPhase, setPrevPhase] = React.useState<string>('');
  const [prevGameState, setPrevGameState] = React.useState<string>('');
  const [shouldGather, setShouldGather] = React.useState(false);
  const [handKey, setHandKey] = React.useState(0);
  const [showDeck, setShowDeck] = React.useState(false);
  const [showWinnerBanner, setShowWinnerBanner] = React.useState(false);

  React.useEffect(() => {
    if (!tableData) return;
    const currentPhase = tableData.currentPhase;
    const currentGameState = tableData.gameState;

    // Reset banner when not in showdown
    if (currentGameState !== 'showdown') {
      setShowWinnerBanner(false);
    } else if (currentGameState === 'showdown' && prevGameState !== 'showdown') {
      // Delay banner until community cards finish sliding in (approx 2s for 5 cards)
      const delay = (communityCards.length * 150) + 1000;
      setTimeout(() => setShowWinnerBanner(true), delay);
    }

    const isNewHand = (currentGameState === 'playing' && prevGameState !== 'playing') || (currentGameState === 'playing' && currentPhase === 'pre-flop' && prevPhase !== 'pre-flop' && prevPhase !== '');
    if (isNewHand) {
      setHandKey(prev => prev + 1);
      setShowDeck(true);
      setPrevGameState(currentGameState);
      setPrevPhase(currentPhase);
      const dealDuration = (2 * players.length) * 300 + 1000;
      setTimeout(() => setShowDeck(false), dealDuration);
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

  const targetTranslations = isVertical ? [
    { x: '-120px', y: '380px' }, { x: '-220px', y: '200px' }, { x: '-220px', y: '-130px' }, { x: '-200px', y: '-330px' }, { x: '0px', y: '-390px' }, { x: '200px', y: '-330px' }, { x: '220px', y: '-80px' }, { x: '220px', y: '200px' }, { x: '120px', y: '380px' },
  ] : [
    { x: '0px', y: '230px' }, { x: '-350px', y: '120px' }, { x: '-350px', y: '-120px' }, { x: '-200px', y: '-220px' }, { x: '-80px', y: '-220px' }, { x: '80px', y: '-220px' }, { x: '200px', y: '-220px' }, { x: '350px', y: '-120px' }, { x: '350px', y: '120px' },
  ];

  const dealOrigins = isVertical ? [
    { x: '0px', y: '-391px' }, { x: '70px', y: '-212.5px' }, { x: '70px', y: '170px' }, { x: '90px', y: '340px' }, { x: '0px', y: '391px' }, { x: '-90px', y: '170px' }, { x: '-90px', y: '340px' }, { x: '-70px', y: '-212.5px' }, { x: '-90px', y: '-391px' },
  ] : [
    { x: '0px', y: '-380px' }, { x: '350px', y: '-250px' }, { x: '350px', y: '50px' }, { x: '250px', y: '250px' }, { x: '100px', y: '300px' }, { x: '-100px', y: '300px' }, { x: '-250px', y: '250px' }, { x: '-350px', y: '50px' }, { x: '-350px', y: '-250px' },
  ];

  const winnerPos = winnerSeat !== -1 ? targetTranslations[winnerSeat] : { x: '0px', y: '0px' };

  return (
    <div className="relative w-full flex flex-col items-center mt-20">
      <div className={`relative transition-all duration-700 bg-gradient-to-br from-[#1e5a3d] to-[#0a2e1a] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_150px_rgba(0,0,0,0.5)] flex items-center justify-center
        ${isVertical ? 'w-full max-w-[480px] aspect-[480/850] rounded-[240px] border-[14px]' : 'w-[80vw] max-w-[1000px] aspect-[2/1] rounded-[300px] border-[16px]'}
        border-[#3d2b1f]`}
      >
        <div className={`absolute inset-[6px] bg-cover opacity-10 pointer-events-none ${isVertical ? 'rounded-[228px]' : 'rounded-[280px]'} `} style={{ backgroundImage: "url('/felt-texture.png')" }}></div>
        <div className={`absolute inset-[6px] border-[#2c6e49] ${isVertical ? 'rounded-[228px] border-[3px]' : 'rounded-[280px] border-[4px]'}`}></div>
        <div className={`flex flex-col items-center z-10 relative ${isVertical ? 'gap-4' : 'gap-6 mt-4'}`}>

          <div style={{ '--target-x': winnerPos.x, '--target-y': winnerPos.y } as any} className="relative z-20">
            <ChipPot amount={tableData.pot} winnerPosition={isShowdown ? 'active' : undefined} />
          </div>
          <div className={`${isVertical ? 'w-auto h-auto gap-4 px-6' : 'h-32 gap-3 px-6'} flex items-center justify-center bg-black/40 rounded-xl shadow-inner border-2 border-white/10 relative z-10`}>
            <div className={`absolute -top-24 left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-700 pointer-events-none z-50 ${showDeck ? 'opacity-100 translate-y-0 scale-75' : 'opacity-0 -translate-y-4 scale-50'}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute w-20 h-28 bg-black shadow-2xl border-2 border-white/20 rounded-lg flex items-center justify-center" style={{ transform: `translate(${-i * 1.5}px, ${-i * 1.5}px)`, zIndex: 10 - i }}>
                  <img src="/logo.ico" alt="logo" className="w-1/2 h-1/2 object-contain" />
                </div>
              ))}
            </div>
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

        {/* WINNER BANNER (Commented out as per request)
        {showWinnerBanner && tableData.winnerInfo && tableData.winnerInfo.length > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center gap-4 w-full">
            {tableData.winnerInfo.map((winner: any, i: number) => (
              <div key={i} className="animate-winner-banner flex flex-col items-center bg-black/80 backdrop-blur-md px-10 py-6 rounded-3xl border-2 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                <div className="text-yellow-500 text-xs font-black uppercase tracking-[0.3em] mb-1">GAGNANT</div>
                <div className="text-white text-3xl font-black italic uppercase tracking-tighter mb-2">{winner.name}</div>
                <div className="px-4 py-1.5 bg-yellow-500 rounded-full text-black text-[10px] font-black uppercase tracking-widest mb-3">
                  {winner.handName}
                </div>
                <div className="text-yellow-500 text-xl font-black italic">+{winner.amount} MGA</div>
              </div>
            ))}
          </div>
        )}
        */}

        {Array.from({ length: 9 }).map((_, idx) => {
          const player = players.find((p: any) => p.position === idx);
          if (!player) return <EmptySlot key={`empty-${idx}`} positionClass={PLAYER_POSITIONS[idx]} />;
          
          const isWinner = winnerIds.includes(player.id) && isShowdown;
          const isDealer = player.id === players.find((p: any) => p.position === tableData.dealerIndex)?.id;
          const presentPositions = players.map((p: any) => p.position).sort((a, b) => a - b);
          const dealerPos = tableData.dealerIndex;
          const dealerIdx = presentPositions.indexOf(dealerPos);
          const playerIdx = presentPositions.indexOf(idx);
          const numPresent = presentPositions.length;
          const sequenceIndex = (playerIdx - dealerIdx + numPresent) % numPresent;
          const dealOrder = sequenceIndex === 0 ? numPresent : sequenceIndex;
          return (
            <div key={player.id} className="transition-all duration-700">
              <PlayerSlot 
                player={player} isActive={player.id === players[tableData.currentPlayerIndex]?.id} isWinner={isWinner} isDealer={isDealer}
                positionClass={PLAYER_POSITIONS[idx]} shouldGatherBets={shouldGather} dealOrigin={dealOrigins[idx]}
                seatNumber={idx} isShowdown={isShowdown} dealOrder={dealOrder} numPlayers={numPresent}
                handKey={handKey} gameState={tableData.gameState}
                isCurrentUser={player.id === currentUserId || player.name.trim().toLowerCase() === currentUserName?.trim().toLowerCase()}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
