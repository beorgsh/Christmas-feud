
import React, { useState } from 'react';

interface Props {
  onStart: (team1: string, team2: string) => void;
  isLoading: boolean;
  isHost: boolean;
}

// Christmas Lights Component
const ChristmasLights = () => (
  <div className="absolute top-0 left-0 right-0 flex justify-center overflow-hidden z-10 pointer-events-none">
     <div className="flex space-x-8 md:space-x-12 -mt-2">
       {Array.from({ length: 12 }).map((_, i) => (
         <div key={i} className="relative">
            <div className="w-[1px] h-6 bg-gray-800 absolute left-1/2 -top-4"></div>
            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-lg ${i % 2 === 0 ? 'bg-red-500 text-red-500 light-odd' : 'bg-green-500 text-green-500 light-even'}`}></div>
         </div>
       ))}
     </div>
  </div>
);

const Registration: React.FC<Props> = ({ onStart, isLoading, isHost }) => {
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');

  const isDisabled = isLoading || !t1.trim() || !t2.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      onStart(t1, t2);
    }
  };

  if (!isHost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-800 via-red-900 to-slate-900 p-4 relative overflow-hidden">
        <ChristmasLights />
        <div className="text-center animate-pulse relative z-20">
          <h1 className="text-6xl font-display text-yellow-400 mb-4 drop-shadow-lg">Paskong Pinoy Feud</h1>
          <p className="text-2xl text-white font-light uppercase tracking-widest">Waiting for Host...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-800 via-red-900 to-slate-900 p-4 relative overflow-hidden">
      
      {/* Decorations */}
      <ChristmasLights />
      
      {/* Left Decoration: Tree */}
      <div className="absolute bottom-0 left-0 w-32 md:w-64 opacity-80 pointer-events-none hidden md:block">
         <svg viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L10 110 H90 L50 10 Z" fill="#166534" />
            <rect x="40" y="110" width="20" height="30" fill="#78350f" />
            <circle cx="30" cy="80" r="5" fill="#ef4444" className="light-odd" />
            <circle cx="70" cy="80" r="5" fill="#fbbf24" className="light-even" />
            <circle cx="50" cy="50" r="5" fill="#3b82f6" className="light-odd" />
         </svg>
      </div>

      {/* Right Decoration: Gifts */}
      <div className="absolute bottom-0 right-0 w-24 md:w-48 opacity-90 pointer-events-none hidden md:block">
         <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="40" width="40" height="40" fill="#ef4444" />
            <rect x="25" y="40" width="10" height="40" fill="#fbbf24" />
            <rect x="10" y="55" width="40" height="10" fill="#fbbf24" />
            
            <rect x="55" y="30" width="35" height="50" fill="#2563eb" />
            <rect x="68" y="30" width="8" height="50" fill="#ffffff" />
         </svg>
      </div>

      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full text-center relative z-20">
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
            disabled={isDisabled}
            className={`w-full py-4 mt-4 font-black text-xl uppercase tracking-widest rounded-lg shadow-lg transition-all 
              ${isDisabled 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-red-900 transform active:scale-95'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-red-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : "Start Game"}
          </button>
        </form>
      </div>
      <div className="mt-8 text-white/20 text-xs relative z-20">
        Powered by Gemini • Philippine Christmas Edition
      </div>
    </div>
  );
};

export default Registration;
