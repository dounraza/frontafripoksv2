import React from 'react';

interface EmptySlotProps {
  positionClass: string;
}

export const EmptySlot: React.FC<EmptySlotProps> = ({ positionClass }) => {
  return (
    <div className={`absolute flex flex-col items-center ${positionClass} z-10 transition-all duration-500 opacity-0 hover:opacity-100 cursor-pointer`}>
      <div className="relative w-36 rounded-xl bg-black/10 transform origin-center scale-[0.65] sm:scale-75 flex items-center justify-center h-20 group">
        {/* Slot malalaka nefa tsy misy sary mipoitra intsony raha tsy hoe kitihina */}
      </div>
    </div>
  );
};
