import React from 'react';

interface MotionControllerProps {
  children: React.ReactNode;
  startX: string | number;
  startY: string | number;
  endX: string | number;
  endY: string | number;
  duration?: string;
  delay?: string;
  className?: string;
}

/**
 * MotionController - Un composant réutilisable pour animer n'importe quel élément
 * d'un point A (départ) vers un point B (arrivée) avec la même logique que le payout du pot.
 */
export const MotionController: React.FC<MotionControllerProps> = ({
  children, startX, startY, endX, endY, duration = "1.2s", delay = "0s", className = ""
}) => {
  const style = {
    '--start-x': typeof startX === 'number' ? `${startX}px` : startX,
    '--start-y': typeof startY === 'number' ? `${startY}px` : startY,
    '--end-x': typeof endX === 'number' ? `${endX}px` : endX,
    '--end-y': typeof endY === 'number' ? `${endY}px` : endY,
    animationDuration: duration,
    animationDelay: delay,
    position: 'absolute',
    willChange: 'transform, opacity'
  } as React.CSSProperties;

  return (
    <div className={`universal-motion ${className}`} style={style}>
      {children}
    </div>
  );
};
