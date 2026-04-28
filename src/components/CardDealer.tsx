import React from 'react';
import { Card } from './Card';
import { MotionController } from './MotionController';

interface CardDealerProps {
  cards: any[];
  dealOrigin: { x: string; y: string };
  dealOrder: number;
  numPlayers: number;
  handKey: number;
  isRevealed: boolean;
  isShowdown: boolean;
  isVertical: boolean;
}

export const CardDealer: React.FC<CardDealerProps> = ({
  cards, dealOrigin, dealOrder, numPlayers, handKey, isRevealed, isShowdown, isVertical
}) => {
  const displayCards = cards && cards.length > 0 ? cards : [null, null];

  return (
    <div key={handKey} className="absolute top-0 z-20 flex perspective-1000 items-center justify-center">
      {displayCards.map((card: any, idx: number) => {
        const delayMs = (idx * numPlayers + (dealOrder - 1)) * 300;
        const endXOffset = idx === 0 ? -16 : 16; // Rapproché pour cartes plus petites (40px)

        return (
          <MotionController
            key={idx}
            startX={dealOrigin.x}
            startY={dealOrigin.y}
            endX={`${endXOffset}px`}
            endY="0px"
            delay={`${delayMs}ms`}
            className={isVertical ? 'scale-[0.9]' : 'scale-[0.7]'}
          >
            <div 
              className="bg-black rounded-lg transition-transform duration-300"
              style={{ 
                boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
                transform: `rotate(${idx === 0 ? -3 : 3}deg)`,
                maskImage: "linear-gradient(to bottom, black 60%, rgba(15,15,15,0.8) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 60%, rgba(15,15,15,0.8) 100%)"
              }}
            >
              <Card 
                value={card?.value || ''} 
                suit={card?.suit || ''} 
                revealed={isRevealed} 
                hidden={false} 
              />
            </div>
          </MotionController>
        );
      })}
    </div>
  );
};
