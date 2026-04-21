import React from 'react';

interface EmptySlotProps {
  positionClass: string;
}

export const EmptySlot: React.FC<EmptySlotProps> = ({ positionClass }) => {
  return (
    <div className={`absolute flex flex-col items-center ${positionClass} z-10 transition-all duration-500 opacity-40 hover:opacity-100 hover:scale-110 cursor-pointer`}>
      <div className="relative w-36 rounded-xl border-2 border-dashed border-gray-600 bg-black/20 p-1 shadow-inner transform origin-center scale-[0.65] sm:scale-75 flex items-center justify-center h-20 group">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center group-hover:border-yellow-500/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-yellow-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-yellow-500/50">Libre</span>
        </div>
      </div>
    </div>
  );
};
