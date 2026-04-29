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
}

export const PlayerSeatContainer: React.FC<PlayerSeatContainerProps> = (props) => {
  const { 
    player, isActive, isWinner, positionClass, shouldGatherBets, 
    seatNumber, isShowdown, isRevealed, isMeActive, gameState, isVertical, handKey,
    isCurrentUser, centerX, centerY, gatheringPlayerId 
  } = props;

  const isFolded = player.status === 'folded' || player.status === 'out' || player.lastAction === 'fold';
  
  // Asehoy foana ny mpilalao fa ny karatra no afenina any ambany raha nanao fold
  
  const getCardTransform = (seat: number) => {
    // Ovay eto ny transform raha tianao hovana isaky ny seat
    // Ny sanda positif (ohatra "translate-y-5") dia hampidina ny karatra
    const transforms: { [key: number]: string } = {
      0: "-translate-y-35 translate-x-2",
      1: "-translate-y-35 translate-x-15",
      2: "translate-y-12 translate-x-15",
      3: "translate-y-12 translate-x-15",
      4: "translate-y-11",
      5: "translate-y-13 -translate-x-15",
      6: "translate-y-13 -translate-x-15",
      7: "-translate-y-35 -translate-x-15",
      8: "-translate-y-35 -translate-x-19",
    };
    return transforms[seat] || "translate-y-5";
  };

  const showCards = (gameState === 'playing' || gameState === 'showdown') 
                    && player.status !== 'out' 
                    && player.status !== 'waiting'
                    && !isFolded
                    && isMeActive; // Raha nanao fold ny current user dia afenina daholo ny karatra

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
        <PlayerSlot {...props} />

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
