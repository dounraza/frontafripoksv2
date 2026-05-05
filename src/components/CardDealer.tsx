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
}

export const CardDealer: React.FC<CardDealerProps> = ({
  cards, gameType, dealOrigin, dealOrder, numPlayers, handKey, isRevealed, isShowdown, isVertical
}) => {
  const defaultCount = gameType === 'omaha' ? 4 : 2;
  const cardCount = cards && cards.length > 0 ? cards.length : defaultCount;
  const displayCards = cards && cards.length > 0 ? cards : Array(cardCount).fill(null);

  return (
    <div key={handKey} className="absolute top-0 z-20 flex items-center justify-center">
      {displayCards.map((card: any, idx: number) => {
        // Augmentation du délai pour un effet "vrai jeu de cartes" plus lent et naturel
        const delayMs = ((dealOrder - 1) * cardCount + idx) * 300; 
        const spread = 25; // Augmenté pour éviter la superposition excessive
        const endXOffset = (idx - (cardCount - 1) / 2) * spread;
        const rotation = (idx - (cardCount - 1) / 2) * 5; // Réduit pour moins incliner
        
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
                transform: `rotate(${rotation}deg)`,
                maskImage: "linear-gradient(to bottom, black 60%, rgba(15,15,15,0.8) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 60%, rgba(15,15,15,0.8) 100%)"
              }}
            >
              <Card 
                value={card?.value || ''} 
                suit={card?.suit || ''} 
                revealed={isRevealed} 
                hidden={false} 
                size={cardCount > 2 ? 'small' : (isRevealed ? 'normal' : 'small')}
              />
            </div>
          </MotionController>
        );
      })}
    </div>
  );
};
