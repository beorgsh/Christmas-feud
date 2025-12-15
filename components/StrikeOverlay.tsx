import React from 'react';

interface Props {
  count: number;
}

const StrikeOverlay: React.FC<Props> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
      <div className="flex gap-4 strike-anim">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="text-[15rem] leading-none font-black text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] font-sans border-4 border-white bg-red-900/20 px-4 rounded-xl">
            X
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrikeOverlay;