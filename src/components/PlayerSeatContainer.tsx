import React from 'react';
import { CardDealer } from './CardDealer';
import { BetChips } from './BetChips';
import { PlayerSlot } from './PlayerSlot'; // Mbola hampiasaina kely ho an'ny lojika anatiny

interface PlayerSeatContainerProps {
  player: any;
  gameType?: string;
  isActive: boolean;
  isWinner: boolean;
  isAnimatingPot: boolean;
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
  sendEmoji: (emoji: string) => void;
  handKey?: string;
  currentEmoji?: string | null;
}

export const PlayerSeatContainer: React.FC<PlayerSeatContainerProps> = (props) => {
  const { 
    player, isActive: _isActive, isWinner: _isWinner, isAnimatingPot, positionClass, shouldGatherBets, 
    seatNumber, isShowdown, isRevealed, isMeActive: _isMeActive, gameState, isVertical,
    isCurrentUser, centerX, centerY, gatheringPlayerId, sendEmoji, currentEmoji: _currentEmoji, handKey 
  } = props;

  const isFolded = player.status === 'folded' || player.status === 'out' || player.status === 'waiting' || player.lastAction === 'fold' || player.lastAction === 'auto-fold' || gameState === 'all_fold';
  
  // Asehoy foana ny mpilalao fa ny karatra no afenina any ambany raha nanao fold
  
  const getCardTransform = (seat: number) => {
    // Valeurs ajustées pour être plus proche de l'avatar
    const transforms: { [key: number]: string } = {
      0: "sm:-translate-y-0 sm:translate-x-1 translate-y-14 translate-x-1",
      1: "sm:translate-y-8 sm:translate-x-4 translate-y-14 translate-x-4",
      2: "sm:translate-y-4 sm:translate-x-8 translate-y-14 translate-x-4",
      3: "sm:translate-y-4 sm:translate-x-8 translate-y-14 translate-x-3",
      4: "sm:translate-y-4 translate-y-14",
      5: "sm:translate-y-4 sm:-translate-x-8 translate-y-12 -translate-x-4",
      6: "sm:translate-y-4 sm:-translate-x-8 translate-y-14 -translate-x-4",
      7: "sm:-translate-y-16 sm:-translate-x-8 translate-y-16 -translate-x-2",
      8: "sm:-translate-y-14 sm:-translate-x-2 translate-y-14 -translate-x-2",
    };
    return transforms[seat] || "translate-y-2";
  };

  // Si le joueur courant a foldé (!isMeActive), il ne doit pas voir les cartes des autres.
  // On masque si gameState est 'playing' ET que ce n'est pas moi.
  const showCards = !isFolded && 
                    (gameState === 'playing' || gameState === 'showdown') && 
                    player.status !== 'out' && 
                    player.status !== 'waiting' &&
                    (gameState === 'showdown' ? true : (!_isMeActive ? isCurrentUser : true));

  return (
    <div id={`seat-${seatNumber}`} className={`absolute flex flex-col items-center ${positionClass} z-20 transition-all duration-500 ${isFolded ? 'opacity-40 grayscale' : ''}`}>
        {/* TOERANA MISY NY KARATRA - Flex container miaraka amin'ny translate */}
        {showCards && (
            <div className={`flex justify-center items-center z-50 ${getCardTransform(seatNumber)}`}>
                <CardDealer 
                    cards={player.cards}
                    gameType={props.gameType}
                    dealOrigin={{ x: "0px", y: "0px" }}
                    dealOrder={1} numPlayers={9} handKey={parseInt(handKey || '0')}
                    isRevealed={isRevealed}
                    isShowdown={isShowdown} isVertical={isVertical}
                    spread={32}
                    rotationFactor={8}
                />
            </div>
        )}

        {/* COMPONENT PLAYER SLOT (Avatar + Trapeze + Info) */}
        <PlayerSlot {...props} currentEmoji={_currentEmoji ?? null} isAnimatingPot={isAnimatingPot} sendEmoji={sendEmoji} />

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
