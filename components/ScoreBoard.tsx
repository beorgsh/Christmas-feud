import React from 'react';
import { Team } from '../types';

interface Props {
  team1: Team;
  team2: Team;
  currentPot: number;
  onAwardPot: (teamId: 1 | 2) => void;
  isHost: boolean;
}

const ScoreBoard: React.FC<Props> = ({ team1, team2, currentPot, onAwardPot, isHost }) => {
  return (
    <div className="flex justify-between items-end w-full max-w-6xl mx-auto px-4 pb-2">
      
      {/* Team 1 */}
      <div className="flex flex-col items-center">
        <div className="bg-black/60 backdrop-blur border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white rounded-xl p-4 w-32 md:w-56 text-center relative mb-3">
            <span className="text-5xl md:text-6xl font-mono font-bold text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]">
                {String(team1.score).padStart(3, '0')}
            </span>
        </div>
        <div className="text-center bg-red-900/80 px-4 py-1 rounded-full border border-red-700/50 shadow-lg">
           <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-widest truncate max-w-[150px] md:max-w-xs">{team1.name}</h3>
           {isHost && (
             <button 
               onClick={() => onAwardPot(1)}
               className="mt-1 bg-green-600 hover:bg-green-500 text-white text-[10px] py-1 px-2 rounded uppercase font-bold tracking-wider shadow-lg transition-colors"
             >
               Award
             </button>
           )}
        </div>
      </div>

      {/* Pot */}
      <div className="mb-8 transform scale-110">
          <div className="flex flex-col items-center">
              <span className="text-yellow-200 text-xs uppercase tracking-[0.2em] mb-2 font-bold drop-shadow-md">Current Pot</span>
              <div className="bg-gradient-to-b from-yellow-300 to-yellow-600 text-red-950 font-black text-5xl px-8 py-3 rounded-lg border-2 border-white/50 shadow-[0_0_40px_rgba(234,179,8,0.6)] font-mono">
                  {currentPot}
              </div>
          </div>
      </div>

      {/* Team 2 */}
      <div className="flex flex-col items-center">
        <div className="bg-black/60 backdrop-blur border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white rounded-xl p-4 w-32 md:w-56 text-center relative mb-3">
            <span className="text-5xl md:text-6xl font-mono font-bold text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]">
                {String(team2.score).padStart(3, '0')}
            </span>
        </div>
        <div className="text-center bg-red-900/80 px-4 py-1 rounded-full border border-red-700/50 shadow-lg">
           <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-widest truncate max-w-[150px] md:max-w-xs">{team2.name}</h3>
           {isHost && (
             <button 
               onClick={() => onAwardPot(2)}
               className="mt-1 bg-green-600 hover:bg-green-500 text-white text-[10px] py-1 px-2 rounded uppercase font-bold tracking-wider shadow-lg transition-colors"
             >
               Award
             </button>
           )}
        </div>
      </div>

    </div>
  );
};

export default ScoreBoard;