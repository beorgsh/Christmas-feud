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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto my-6 px-4">
      {displaySlots.map((answer, idx) => (
        <div 
          key={idx} 
          onClick={() => answer && !answer.revealed && onReveal(idx)}
          className={`
            h-20 w-full relative perspective-1000 cursor-pointer group
            ${!answer ? 'opacity-0 pointer-events-none hidden md:block' : ''}
            ${answer?.revealed ? 'card-flipped' : ''}
          `}
        >
          <div className="card-inner w-full h-full border-2 border-yellow-500 shadow-xl rounded-md">
            
            {/* Front of Card (Hidden Answer) */}
            <div className="card-front bg-gradient-to-b from-blue-700 to-blue-900 rounded-md flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-inner">
                 <span className="text-2xl font-bold text-yellow-400 font-display">{idx + 1}</span>
              </div>
            </div>

            {/* Back of Card (Revealed Answer) */}
            <div className="card-back bg-gradient-to-r from-gray-100 to-white text-black rounded-md flex justify-between items-center px-6 border-2 border-yellow-500">
               <span className="text-xl md:text-2xl font-bold uppercase text-slate-900 truncate flex-1 text-left">
                 {answer?.text}
               </span>
               <div className="bg-blue-900 text-white px-3 py-1 min-w-[3rem] text-center font-bold text-xl border border-white/50 shadow-md">
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