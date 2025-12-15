import React, { useState } from 'react';

interface Props {
  onStart: (team1: string, team2: string) => void;
  isLoading: boolean;
  isHost: boolean;
}

const Registration: React.FC<Props> = ({ onStart, isLoading, isHost }) => {
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (t1 && t2) {
      onStart(t1, t2);
    }
  };

  if (!isHost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-800 to-red-950 p-4">
        <div className="text-center animate-pulse">
          <h1 className="text-6xl font-display text-yellow-400 mb-4 drop-shadow-lg">Paskong Pinoy Feud</h1>
          <p className="text-2xl text-white font-light uppercase tracking-widest">Waiting for Host...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-800 to-red-950 p-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full text-center">
        <h1 className="text-5xl font-display text-yellow-400 mb-2 drop-shadow-lg">Paskong Pinoy Feud</h1>
        <p className="text-red-100 mb-8 font-light">Enter team names to begin the festivities!</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-bold text-yellow-200 mb-1 uppercase tracking-wider">Team 1 Name</label>
            <input 
              type="text" 
              value={t1}
              onChange={(e) => setT1(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
              placeholder="e.g. Team Bibingka"
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-bold text-yellow-200 mb-1 uppercase tracking-wider">Team 2 Name</label>
            <input 
              type="text" 
              value={t2}
              onChange={(e) => setT2(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
              placeholder="e.g. Team Puto Bumbong"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-red-900 font-black text-xl uppercase tracking-widest rounded-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-red-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Questions...
              </span>
            ) : "Start Game"}
          </button>
        </form>
      </div>
      <div className="mt-8 text-white/20 text-xs">
        Powered by Gemini • Philippine Christmas Edition
      </div>
    </div>
  );
};

export default Registration;