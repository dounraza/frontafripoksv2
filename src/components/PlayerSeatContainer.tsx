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

  const isFolded = player.status === 'folded' || player.status === 'out' || player.lastAction === 'fold';
  
  // Asehoy foana ny mpilalao fa ny karatra no afenina any ambany raha nanao fold
  
  const getCardTransform = (seat: number) => {
    // sm: correspond au WEB/Desktop, les classes sans préfixe sont pour le MOBILE
    const transforms: { [key: number]: string } = {
      // Joueur en bas à gauche
      0: "sm:-translate-y-27 sm:translate-x-2 -translate-y-22 translate-x-1",
      // Joueurs à gauche (bas vers haut)
      1: "sm:-translate-y-29 sm:translate-x-15 -translate-y-20 translate-x-10",
      2: "sm:translate-y-12 sm:translate-x-15 translate-y-10 translate-x-10",
      3: "sm:translate-y-12 sm:translate-x-15 translate-y-8 translate-x-8",
      // Joueur en haut
      4: "sm:translate-y-11 translate-y-10",
      // Joueurs à droite (haut vers bas)
      5: "sm:translate-y-13 sm:-translate-x-15 translate-y-8 -translate-x-8",
      6: "sm:translate-y-13 sm:-translate-x-15 translate-y-10 -translate-x-10",
      7: "sm:-translate-y-35 sm:-translate-x-15 -translate-y-25 -translate-x-10",
      // Joueur en bas à droite
      8: "sm:-translate-y-35 sm:-translate-x-19 -translate-y-25 -translate-x-10",
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
