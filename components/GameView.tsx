
import React, { useState, useEffect } from 'react';
import { GamePhase, GameState } from '../types';
import AnswerBoard from './AnswerBoard';
import ScoreBoard from './ScoreBoard';
import StrikeOverlay from './StrikeOverlay';
import Registration from './Registration';

interface Props {
  state: GameState;
  onBackToAdmin: () => void;
}

// Christmas Lights Component
const ChristmasLights = () => (
  <div className="absolute top-0 left-0 right-0 flex justify-center overflow-hidden z-20 pointer-events-none">
     <div className="flex space-x-12 md:space-x-16 -mt-2">
       {Array.from({ length: 16 }).map((_, i) => (
         <div key={i} className="relative">
            <div className="w-[1px] h-8 bg-gray-900 absolute left-1/2 -top-4"></div>
            <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] ${i % 3 === 0 ? 'bg-red-500 text-red-500 light-odd' : i % 3 === 1 ? 'bg-yellow-400 text-yellow-400 light-even' : 'bg-green-500 text-green-500 light-odd'}`}></div>
         </div>
       ))}
     </div>
  </div>
);

const GameView: React.FC<Props> = ({ state, onBackToAdmin }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state with actual document state
  useEffect(() => {
    const handleChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {
            console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  // Render content based on phase
  const renderContent = () => {
    // 1. REGISTRATION / LOADING PHASE
    if (state.phase === GamePhase.REGISTRATION || state.phase === GamePhase.LOADING) {
      return (
        <div className="relative min-h-screen">
          <Registration onStart={() => {}} isLoading={false} isHost={false} />
        </div>
      );
    }

    // 2. GAME OVER PHASE
    if (state.phase === GamePhase.GAME_OVER) {
      const winner = state.teams[1].score > state.teams[2].score ? state.teams[1] : state.teams[2];
      const isTie = state.teams[1].score === state.teams[2].score;
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-red-900 to-black text-white p-8 text-center relative overflow-hidden">
          <ChristmasLights />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-20 animate-pulse"></div>
          
          <h1 className="text-7xl text-yellow-400 font-display mb-8 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] z-10">Maligayang Pasko!</h1>
          
          <div className="bg-red-950/80 backdrop-blur-md p-10 rounded-3xl border-4 border-yellow-500 shadow-2xl z-10 max-w-4xl w-full">
            <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-yellow-100">Final Scores</h2>
            <div className="flex justify-around items-end text-2xl mb-12 gap-8">
              <div className="text-center transform transition-all hover:scale-105">
                <div className="text-white/80 font-bold mb-2 uppercase tracking-wide text-sm">{state.teams[1].name}</div>
                <div className="text-6xl font-mono font-bold text-white drop-shadow-md bg-black/30 p-4 rounded-xl border border-white/10">{state.teams[1].score}</div>
              </div>
              <div className="text-center transform transition-all hover:scale-105">
                <div className="text-white/80 font-bold mb-2 uppercase tracking-wide text-sm">{state.teams[2].name}</div>
                <div className="text-6xl font-mono font-bold text-white drop-shadow-md bg-black/30 p-4 rounded-xl border border-white/10">{state.teams[2].score}</div>
              </div>
            </div>
            <div className="text-5xl font-display text-yellow-400 mb-4 animate-bounce drop-shadow-lg">
              {isTie ? "It's a Tie!" : `Winner: ${winner.name}!`}
            </div>
          </div>
        </div>
      );
    }

    // 3. PLAYING PHASE
    const currentQuestion = state.questions[state.currentRoundIndex];
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-800 via-red-950 to-slate-900 flex flex-col items-center relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <ChristmasLights />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/christmas-magic.png')] opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-900/30 rounded-full blur-[100px]"></div>
            <div className="absolute top-1/2 -right-20 w-80 h-80 bg-yellow-600/20 rounded-full blur-[80px]"></div>
        </div>

        {/* Tree and Gifts Overlay */}
        <div className="absolute bottom-0 left-0 w-32 md:w-64 opacity-50 pointer-events-none hidden lg:block z-0">
         <svg viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L10 110 H90 L50 10 Z" fill="#166534" />
            <rect x="40" y="110" width="20" height="30" fill="#78350f" />
            <circle cx="30" cy="80" r="5" fill="#ef4444" className="light-odd" />
            <circle cx="70" cy="80" r="5" fill="#fbbf24" className="light-even" />
         </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-24 md:w-48 opacity-50 pointer-events-none hidden lg:block z-0">
         <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="40" width="40" height="40" fill="#ef4444" />
            <rect x="25" y="40" width="10" height="40" fill="#fbbf24" />
            <rect x="10" y="55" width="40" height="10" fill="#fbbf24" />
            <rect x="55" y="30" width="35" height="50" fill="#2563eb" />
            <rect x="68" y="30" width="8" height="50" fill="#ffffff" />
         </svg>
        </div>

        {/* Header */}
        <div className="w-full bg-gradient-to-r from-green-900 via-red-900 to-green-900 shadow-2xl border-b-4 border-yellow-500 p-6 text-center relative z-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
          <h2 className="text-yellow-300 text-sm font-bold uppercase tracking-[0.4em] mb-2 drop-shadow-md">Round {state.currentRoundIndex + 1}</h2>
          <h1 className="text-3xl md:text-5xl text-white font-display max-w-5xl mx-auto leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] px-4">
            "{currentQuestion?.text}"
          </h1>
        </div>

        {/* Board */}
        <div className="flex-1 w-full flex flex-col justify-center relative z-10 py-4">
          <AnswerBoard 
            answers={currentQuestion?.answers || []}
            onReveal={() => {}} // Board cannot reveal on click
          />
        </div>

        {/* Scoreboard */}
        <div className="w-full bg-gradient-to-t from-black/90 to-transparent pt-12 pb-6 z-10 px-4">
          <ScoreBoard 
            team1={state.teams[1]} 
            team2={state.teams[2]} 
            currentPot={state.currentRoundScore}
            onAwardPot={() => {}} // Board cannot award
            isHost={false}
          />
        </div>

        {/* Strike Overlay */}
        {state.showStrikeOverlay && <StrikeOverlay count={state.strikes} />}
      
      </div>
    );
  };

  return (
    <div className="relative">
        {renderContent()}

        {/* Floating Controls (Bottom Right) */}
        <div className="fixed bottom-4 right-4 z-50 flex gap-2 opacity-30 hover:opacity-100 transition-opacity duration-300">
            <button 
                onClick={toggleFullscreen}
                className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm border border-white/20 shadow-lg transition-all"
                title="Toggle Fullscreen"
            >
                {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                )}
            </button>
            
            {/* Back Button (Only logic, assumes routing handled by parent via prop) */}
            <button 
                onClick={onBackToAdmin}
                className="bg-red-900/50 hover:bg-red-800/80 text-white p-2 rounded-full backdrop-blur-sm border border-white/20 shadow-lg transition-all"
                title="Back to Admin"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
            </button>
        </div>
    </div>
  );
};

export default GameView;
