import React from 'react';
import { CardDealer } from './CardDealer';
import { BetChips } from './BetChips';
import { PlayerSlot } from './PlayerSlot'; // Mbola hampiasaina kely ho an'ny lojika anatiny

interface PlayerSeatContainerProps {
  player: any;
  isActive: boolean;
  isWinner: boolean;
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
  isRevealed: boolean;
  isMeActive: boolean;
  isVertical: boolean;
  handKey: number;
  currentEmoji: string | null;
  sendEmoji: (emoji: string) => void;
}

export const PlayerSeatContainer: React.FC<PlayerSeatContainerProps> = (props) => {
  const { 
    player, isActive, isWinner, positionClass, shouldGatherBets, 
    seatNumber, isShowdown, isRevealed, isMeActive, gameState, isVertical, handKey,
    isCurrentUser, centerX, centerY, gatheringPlayerId, currentEmoji, sendEmoji 
  } = props;

  const isFolded = player.status === 'folded' || player.status === 'out' || player.lastAction === 'fold' || player.lastAction === 'auto-fold' || gameState === 'all_fold';
  
  // Asehoy foana ny mpilalao fa ny karatra no afenina any ambany raha nanao fold
  
  const getCardTransform = (seat: number) => {
    // Mobile (sans préfixe) : plus compact / Desktop (sm:) : standard
    const transforms: { [key: number]: string } = {
      0: "sm:-translate-y-30 sm:translate-x-1 -translate-y-20 translate-x-2",
      1: "sm:-translate-y-20 sm:translate-x-16 -translate-y-20 translate-x-12",
      2: "sm:translate-y-12 sm:translate-x-16 translate-y-8 translate-x-12",
      3: "sm:translate-y-12 sm:translate-x-16 translate-y-8 translate-x-8",
      4: "sm:translate-y-12 translate-y-8",
      5: "sm:translate-y-12 sm:-translate-x-16 translate-y-8 -translate-x-8",
      6: "sm:translate-y-12 sm:-translate-x-16 translate-y-10 -translate-x-10",
      7: "sm:-translate-y-30 sm:-translate-x-16 -translate-y-20 -translate-x-12",
      8: "sm:-translate-y-28 sm:-translate-x-2 -translate-y-20 -translate-x-2",
    };
    return transforms[seat] || "translate-y-5";
  };

  // Si le joueur courant a foldé (!isMeActive), il ne doit pas voir les cartes des autres.
  // On masque si gameState est 'playing' ET que ce n'est pas moi.
  const showCards = !isFolded && 
                    (gameState === 'playing' || gameState === 'showdown') && 
                    player.status !== 'out' && 
                    player.status !== 'waiting' &&
                    (!isMeActive ? isCurrentUser : true);

  return (
    <div className={`absolute flex flex-col items-center ${positionClass} z-20 transition-all duration-500 ${isFolded ? 'opacity-40 grayscale' : ''}`}>
        {/* TOERANA MISY NY KARATRA - Flex container miaraka amin'ny translate */}
        {showCards && (
            <div className={`flex justify-center items-center z-50 ${getCardTransform(seatNumber)}`}>
                <CardDealer 
                    cards={player.cards}
                    dealOrigin={{ x: "0px", y: "0px" }}
                    dealOrder={1} numPlayers={9} handKey={handKey}
                    isRevealed={isRevealed}
                    isShowdown={isShowdown} isVertical={isVertical}
                />
            </div>
        )}

        {/* COMPONENT PLAYER SLOT (Avatar + Trapeze + Info) */}
        <PlayerSlot {...props} sendEmoji={sendEmoji} />

        {/* BET CHIPS */}
        {!shouldGatherBets && player.bet > 0 && (
          <BetChips 
              amount={player.bet} 
              shouldGather={shouldGatherBets} 
              position={positionClass} 
              seatNumber={seatNumber} 
              centerX={centerX} 
              centerY={centerY} 
              playerId={player.id} 
              gatheringPlayerId={gatheringPlayerId} 
          />
        )}
    </div>
  );
};
