import React from 'react';
import { GameState, Question } from '../types';
import AnswerBoard from './AnswerBoard';

interface Props {
  state: GameState;
  onReveal: (index: number) => void;
  onStrike: () => void;
  onClearStrikes: () => void;
  onAward: (teamId: 1 | 2) => void;
  onReset: () => void;
}

const AdminDashboard: React.FC<Props> = ({ state, onReveal, onStrike, onClearStrikes, onAward, onReset }) => {
  const currentQuestion = state.questions[state.currentRoundIndex];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20">
      
      {/* 1. TOP BAR */}
      <div className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md border-b-4 border-yellow-500 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">HOST</span>
          <h1 className="text-xl font-bold uppercase tracking-wider hidden md:block">Control Panel</h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right border-l border-slate-600 pl-4">
             <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Round</div>
             <div className="font-bold text-yellow-400">Round {state.currentRoundIndex + 1}</div>
           </div>
           
           <button onClick={onReset} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-xs px-3 py-1 rounded border border-red-800/50 transition-colors ml-2">
              Reset Game
           </button>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* 2. LIVE BROADCAST (BOARD PREVIEW) */}
        <section className="bg-slate-900 rounded-xl shadow-2xl border-4 border-yellow-500 relative overflow-hidden flex flex-col items-center p-4 min-h-[250px] justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/christmas-magic.png')] opacity-30 pointer-events-none"></div>
            <div className="absolute top-2 left-0 right-0 text-center z-10">
                <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Live Board</span>
            </div>
            
            <div className="w-full transform scale-75 md:scale-90 lg:scale-100 origin-center z-0 mt-4">
               {/* Note: Clicking on the live board also toggles answer (handled by App.tsx passed prop) */}
               <AnswerBoard answers={currentQuestion?.answers || []} onReveal={onReveal} />
            </div>
        </section>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 3. SCORER (Score Management) */}
          <section className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 flex flex-col gap-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h2 className="font-bold text-gray-500 uppercase text-xs">Score Management</h2>
                <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-400 block">Pot Money</span>
                    <span className="text-2xl font-black text-yellow-600 leading-none">{state.currentRoundScore}</span>
                </div>
             </div>

             {/* Team 1 */}
             <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-100">
                <div>
                  <div className="font-bold text-lg leading-none">{state.teams[1].name || "Team 1"}</div>
                  <div className="text-3xl font-mono text-blue-800">{state.teams[1].score}</div>
                </div>
                <button onClick={() => onAward(1)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold shadow uppercase text-sm">
                  Award Round
                </button>
             </div>

             {/* Team 2 */}
             <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-100">
                <div>
                  <div className="font-bold text-lg leading-none">{state.teams[2].name || "Team 2"}</div>
                  <div className="text-3xl font-mono text-blue-800">{state.teams[2].score}</div>
                </div>
                <button onClick={() => onAward(2)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold shadow uppercase text-sm">
                  Award Round
                </button>
             </div>
          </section>


          {/* 4. ERROR / STRIKE */}
          <section className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
               <h2 className="font-bold text-gray-500 uppercase text-xs">Strike Controls</h2>
               <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                     <div key={i} className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs border ${i <= state.strikes ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-300 border-gray-200'}`}>
                        X
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
               <button onClick={onStrike} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-8 rounded border border-red-300 transition-colors flex flex-col items-center justify-center gap-2 group shadow-sm active:translate-y-1">
                 <span className="text-4xl group-hover:scale-110 transition-transform">❌</span>
                 <span className="text-sm uppercase tracking-wider">Trigger Strike (Buzz)</span>
               </button>
               
               <button onClick={onClearStrikes} className="bg-white hover:bg-gray-50 text-gray-500 text-xs py-2 rounded border border-gray-200 transition-colors uppercase tracking-wide">
                 Reset Strikes (0)
               </button>
            </div>
          </section>

        </div>


        {/* 5. QUESTION (Reveal Controls) */}
        <section className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-400">
            <div className="mb-4">
              <h2 className="text-gray-400 text-xs uppercase font-bold mb-1">Question & Answers (Click to Toggle)</h2>
              <p className="text-xl font-bold text-slate-800 font-display">"{currentQuestion?.text}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
              {currentQuestion?.answers.map((ans, idx) => (
                <button
                  key={idx}
                  onClick={() => onReveal(idx)}
                  className={`
                    flex justify-between items-center p-3 rounded border-2 transition-all relative overflow-hidden group
                    ${ans.revealed 
                      ? 'bg-green-50 border-green-200 cursor-pointer shadow-inner' // Revealed State
                      : 'bg-white border-blue-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer shadow-sm hover:shadow-md' // Hidden State
                    }
                  `}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors
                      ${ans.revealed ? 'bg-green-600 text-white' : 'bg-blue-600 text-white group-hover:bg-blue-500'}
                    `}>
                      {idx + 1}
                    </div>
                    <span className={`text-lg font-bold ${ans.revealed ? 'text-green-800' : 'text-slate-800'}`}>
                      {ans.text}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-xl relative z-10 ${ans.revealed ? 'text-green-600' : 'text-blue-600'}`}>
                    {ans.points}
                  </span>
                  
                  {/* Status Indicator / Toggle Hint */}
                  <div className={`absolute right-2 top-2 text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity ${ans.revealed ? 'text-red-400' : 'text-blue-400'}`}>
                    {ans.revealed ? 'Hide' : 'Reveal'}
                  </div>

                </button>
              ))}
            </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;