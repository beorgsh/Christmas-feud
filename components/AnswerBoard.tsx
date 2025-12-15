import React from 'react';
import { Answer } from '../types';

interface Props {
  answers: Answer[];
  onReveal: (index: number) => void;
}

const AnswerBoard: React.FC<Props> = ({ answers, onReveal }) => {
  // Always render 8 slots for visual consistency, filling empty ones with placeholders
  const displaySlots = Array(8).fill(null).map((_, i) => answers[i] || null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mx-auto my-6 px-4">
      {displaySlots.map((answer, idx) => (
        <div 
          key={idx} 
          onClick={() => answer && !answer.revealed && onReveal(idx)}
          className={`
            h-24 w-full relative perspective-1000 cursor-pointer group
            ${!answer ? 'opacity-0 pointer-events-none hidden md:block' : ''}
            ${answer?.revealed ? 'card-flipped' : ''}
          `}
        >
          <div className="card-inner w-full h-full border-2 border-yellow-600/50 shadow-2xl rounded-lg">
            
            {/* Front of Card (Hidden Answer) */}
            <div className="card-front bg-gradient-to-b from-blue-800 to-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="w-14 h-14 bg-blue-900/80 rounded-full flex items-center justify-center border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                 <span className="text-3xl font-bold text-yellow-400 font-display drop-shadow-md">{idx + 1}</span>
              </div>
            </div>

            {/* Back of Card (Revealed Answer) */}
            <div className="card-back bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-lg flex justify-between items-center px-6 border-2 border-yellow-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
               {/* Texture Overlay */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
               
               {/* UPDATED FONT: Removed font-display (Lobster) and added font-sans (Roboto Condensed), made larger */}
               <span className="text-2xl md:text-4xl font-black uppercase text-white truncate flex-1 text-left drop-shadow-md font-sans tracking-tight relative z-10">
                 {answer?.text}
               </span>
               
               <div className="relative z-10 bg-gradient-to-b from-yellow-300 to-yellow-500 text-red-900 px-4 py-2 min-w-[4rem] text-center font-black text-2xl border-2 border-white/40 shadow-lg rounded-lg transform rotate-1 font-mono">
                 {answer?.points}
               </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswerBoard;