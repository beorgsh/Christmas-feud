import React from 'react';
import { GamePhase, GameState } from '../types';
import AnswerBoard from './AnswerBoard';
import ScoreBoard from './ScoreBoard';
import StrikeOverlay from './StrikeOverlay';
import Registration from './Registration';

interface Props {
  state: GameState;
}

const GameView: React.FC<Props> = ({ state }) => {
  // 1. REGISTRATION / LOADING PHASE
  if (state.phase === GamePhase.REGISTRATION || state.phase === GamePhase.LOADING) {
    return (
      <div className="relative min-h-screen">
        {/* Always render Registration in 'guest' mode for the view-only board */}
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
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/christmas-magic.png')] opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-900/30 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-yellow-600/20 rounded-full blur-[80px]"></div>
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

export default GameView;