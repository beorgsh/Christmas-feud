import React, { useState, useEffect } from 'react';
import { GamePhase, GameState } from './types';
import Registration from './components/Registration.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import GameView from './components/GameView.tsx';
import { fetchGameContent } from './services/geminiService.ts';
import { audioService } from './services/audioService.ts';

const App: React.FC = () => {
  // Internal Tab State
  const [activeTab, setActiveTab] = useState<'admin' | 'board'>('admin');
  const [isMusicOn, setIsMusicOn] = useState(false);

  const [state, setState] = useState<GameState>({
    teams: {
      1: { id: 1, name: '', score: 0 },
      2: { id: 2, name: '', score: 0 }
    },
    currentRoundIndex: 0,
    questions: [],
    currentRoundScore: 0,
    strikes: 0,
    showStrikeOverlay: false,
    phase: GamePhase.REGISTRATION
  });

  // --- HOST ACTIONS ---
  
  const handleStrike = () => {
    if (state.strikes >= 3) return;
    
    // Play Strike Sound
    audioService.playBuzz();

    setState(prev => ({
      ...prev,
      strikes: prev.strikes + 1,
      showStrikeOverlay: true
    }));

    setTimeout(() => {
      setState(prev => ({ ...prev, showStrikeOverlay: false }));
    }, 1500);
  };

  const clearStrikes = () => {
    setState(prev => ({ ...prev, strikes: 0 }));
  };

  const toggleMusic = (shouldPlay: boolean) => {
    setIsMusicOn(shouldPlay);
    audioService.toggleMusic(shouldPlay);
  };

  const startGame = async (t1: string, t2: string) => {
    setState(prev => ({ ...prev, phase: GamePhase.LOADING }));
    
    // Start music automatically when game starts
    toggleMusic(true);

    const questions = await fetchGameContent();
    
    setState(prev => ({
      ...prev,
      teams: {
        1: { ...prev.teams[1], name: t1 },
        2: { ...prev.teams[2], name: t2 }
      },
      questions,
      phase: GamePhase.PLAYING,
      currentRoundIndex: 0,
      strikes: 0,
      currentRoundScore: 0
    }));
  };

  const toggleAnswer = (answerIndex: number) => {
    const currentQuestion = state.questions[state.currentRoundIndex];
    if (!currentQuestion) return;
    
    const answer = currentQuestion.answers[answerIndex];
    if (!answer) return;

    // Determine if we are revealing or hiding
    const isRevealing = !answer.revealed;

    // Play Reveal Sound (Ding) only when revealing
    if (isRevealing) {
      audioService.playDing();
    }

    setState(prev => {
      // Create a deep copy of the questions array
      const updatedQuestions = prev.questions.map((q, qIdx) => {
        if (qIdx !== prev.currentRoundIndex) return q;
        return {
          ...q,
          answers: q.answers.map((a, aIdx) => 
            aIdx === answerIndex ? { ...a, revealed: isRevealing } : a
          )
        };
      });

      // Calculate new score based on toggle direction
      // If revealing: ADD points
      // If hiding: SUBTRACT points
      const scoreChange = isRevealing ? answer.points : -answer.points;
      const newRoundScore = Math.max(0, prev.currentRoundScore + scoreChange);

      return {
        ...prev,
        questions: updatedQuestions,
        currentRoundScore: newRoundScore
      };
    });
  };

  const awardRound = (teamId: 1 | 2) => {
    const pointsToAdd = state.currentRoundScore;
    const nextRoundIndex = state.currentRoundIndex + 1;
    const isGameOver = nextRoundIndex >= state.questions.length;

    setState(prev => ({
      ...prev,
      teams: {
        ...prev.teams,
        [teamId]: {
          ...prev.teams[teamId],
          score: prev.teams[teamId].score + pointsToAdd
        }
      },
      currentRoundIndex: isGameOver ? prev.currentRoundIndex : nextRoundIndex,
      phase: isGameOver ? GamePhase.GAME_OVER : GamePhase.PLAYING,
      currentRoundScore: 0,
      strikes: 0,
    }));
  };

  const resetGame = () => {
    setState({
      teams: {
        1: { id: 1, name: '', score: 0 },
        2: { id: 2, name: '', score: 0 }
      },
      currentRoundIndex: 0,
      questions: [],
      currentRoundScore: 0,
      strikes: 0,
      showStrikeOverlay: false,
      phase: GamePhase.REGISTRATION
    });
  };

  // --------------------------------------------------------------------------
  // Render Logic
  // --------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      
      {/* NAVIGATION TABS */}
      <div className="bg-slate-900 border-b border-slate-700 p-2 flex items-center justify-center shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-2 rounded font-bold uppercase text-sm tracking-wider transition-colors flex items-center gap-2
              ${activeTab === 'admin' 
                ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
          >
            <span>🎮</span>
            Host Controls
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`px-6 py-2 rounded font-bold uppercase text-sm tracking-wider transition-colors flex items-center gap-2
              ${activeTab === 'board' 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
          >
            <span>📺</span>
            Game Screen
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-auto bg-slate-100 relative">
        {activeTab === 'admin' ? (
          // ADMIN TAB
          state.phase === GamePhase.REGISTRATION || state.phase === GamePhase.LOADING ? (
             <Registration onStart={startGame} isLoading={state.phase === GamePhase.LOADING} isHost={true} />
          ) : (
             <AdminDashboard 
                state={state}
                onReveal={toggleAnswer}
                onStrike={handleStrike}
                onClearStrikes={clearStrikes}
                onAward={awardRound}
                onReset={resetGame}
                isMusicOn={isMusicOn}
                onToggleMusic={() => toggleMusic(!isMusicOn)}
             />
          )
        ) : (
          // GAME SCREEN TAB
          <GameView state={state} />
        )}
      </div>

    </div>
  );
};

export default App;