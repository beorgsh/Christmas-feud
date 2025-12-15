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
    <div className="flex justify-between items-end w-full max-w-5xl mx-auto px-4 pb-4">
      
      {/* Team 1 */}
      <div className="flex flex-col items-center">
        <div className="bg-black/80 border-4 border-blue-600 text-white rounded-lg p-4 w-32 md:w-48 text-center relative mb-2">
            <span className="text-5xl font-mono font-bold text-blue-400 drop-shadow-md">
                {String(team1.score).padStart(3, '0')}
            </span>
        </div>
        <div className="text-center">
           <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-widest mb-2">{team1.name}</h3>
           {isHost && (
             <button 
               onClick={() => onAwardPot(1)}
               className="bg-green-600 hover:bg-green-500 text-white text-xs py-1 px-3 rounded uppercase font-bold tracking-wider shadow-lg transition-colors"
             >
               Award Round
             </button>
           )}
        </div>
      </div>

      {/* Pot */}
      <div className="mb-12">
          <div className="flex flex-col items-center">
              <span className="text-yellow-200 text-xs uppercase tracking-widest mb-1">Current Pot</span>
              <div className="bg-gradient-to-b from-yellow-300 to-yellow-600 text-black font-black text-4xl px-8 py-2 rounded-lg border-2 border-white shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                  {currentPot}
              </div>
          </div>
      </div>

      {/* Team 2 */}
      <div className="flex flex-col items-center">
        <div className="bg-black/80 border-4 border-blue-600 text-white rounded-lg p-4 w-32 md:w-48 text-center relative mb-2">
            <span className="text-5xl font-mono font-bold text-blue-400 drop-shadow-md">
                {String(team2.score).padStart(3, '0')}
            </span>
        </div>
        <div className="text-center">
           <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-widest mb-2">{team2.name}</h3>
           {isHost && (
             <button 
               onClick={() => onAwardPot(2)}
               className="bg-green-600 hover:bg-green-500 text-white text-xs py-1 px-3 rounded uppercase font-bold tracking-wider shadow-lg transition-colors"
             >
               Award Round
             </button>
           )}
        </div>
      </div>

    </div>
  );
};

export default ScoreBoard;