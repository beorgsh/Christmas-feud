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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] relative">
        <h1 className="text-6xl text-yellow-400 font-display mb-8">Maligayang Pasko!</h1>
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Final Scores</h2>
          <div className="flex gap-12 text-2xl mb-8">
            <div className="text-center">
              <div className="text-blue-300 font-bold mb-1">{state.teams[1].name}</div>
              <div className="text-5xl font-mono">{state.teams[1].score}</div>
            </div>
            <div className="text-center">
              <div className="text-blue-300 font-bold mb-1">{state.teams[2].name}</div>
              <div className="text-5xl font-mono">{state.teams[2].score}</div>
            </div>
          </div>
          <div className="text-4xl font-black text-yellow-400 mb-8 animate-bounce">
            {isTie ? "It's a Tie!" : `Winner: ${winner.name}!`}
          </div>
        </div>
      </div>
    );
  }

  // 3. PLAYING PHASE
  const currentQuestion = state.questions[state.currentRoundIndex];
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/christmas-magic.png')] relative">
      
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-red-800 to-red-900 shadow-xl border-b-4 border-yellow-500 p-6 text-center relative z-10 pt-8">
        <h2 className="text-yellow-400 text-sm font-bold uppercase tracking-[0.3em] mb-2">Round {state.currentRoundIndex + 1}</h2>
        <h1 className="text-2xl md:text-4xl text-white font-bold max-w-4xl mx-auto leading-tight drop-shadow-md">
          "{currentQuestion?.text}"
        </h1>
      </div>

      {/* Board */}
      <div className="flex-1 w-full flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-[100px]"></div>
        </div>

        <AnswerBoard 
          answers={currentQuestion?.answers || []}
          onReveal={() => {}} // Board cannot reveal on click
        />
      </div>

      {/* Scoreboard */}
      <div className="w-full bg-gradient-to-t from-black to-transparent pt-10 z-10">
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