import React from 'react';
import { Card } from './Card';
import { MotionController } from './MotionController';

interface CardDealerProps {
  cards: any[];
  gameType?: string;
  dealOrigin: { x: string; y: string };
  dealOrder: number;
  numPlayers: number;
  handKey: number;
  isRevealed: boolean;
  isShowdown: boolean;
  isVertical: boolean;
  spread?: number;
  rotationFactor?: number;
}

export const CardDealer: React.FC<CardDealerProps> = ({
  cards, gameType, dealOrigin, dealOrder, numPlayers, handKey, isRevealed, isShowdown, isVertical,
  spread: customSpread, rotationFactor: customRotation
}) => {
  const defaultCount = gameType === 'omaha' ? 4 : 2;
  const cardCount = cards && cards.length > 0 ? cards.length : defaultCount;
  
  // Carte fictive pour test si aucune carte n'est disponible
  const displayCards = (cards && cards.length > 0) ? cards : 
                       (cardCount === 2 ? [{ value: 'A', suit: 'h' }, { value: 'K', suit: 'h' }] : Array(cardCount).fill({ value: 'A', suit: 'h' }));

  return (
    <div key={handKey} className="absolute top-0 z-20 flex items-center justify-center">
      {displayCards.map((card: any, idx: number) => {
        const delayMs = ((dealOrder - 1) * cardCount + idx) * 300; 
        
        // Valeurs par défaut avec possibilité de customisation
        const spread = customSpread ?? (isVertical ? 32 : 25);
        const rotation = customRotation ?? 5;
        
        const endXOffset = (idx - (cardCount - 1) / 2) * spread;
        const rotationVal = (idx - (cardCount - 1) / 2) * rotation;
        
        return (
          <MotionController
            key={idx}
            startX={dealOrigin.x}
            startY={dealOrigin.y}
            endX={`${endXOffset}px`}
            endY="0px"
            delay={`${delayMs}ms`}
            className="origin-center"
          >
            <div 
              className="bg-black rounded-lg transition-transform duration-300 hover:z-50 hover:scale-110"
              style={{ 
                boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
                transform: `rotate(${rotationVal}deg)`
              }}
            >              <Card 
                value={card?.value || ''} 
                suit={card?.suit || ''} 
                revealed={isRevealed} 
                hidden={false} 
                size={isVertical ? 'small' : (cardCount > 2 ? 'small' : (isRevealed ? 'normal' : 'small'))}
              />
            </div>
          </MotionController>
        );
      })}
    </div>
  );
};
