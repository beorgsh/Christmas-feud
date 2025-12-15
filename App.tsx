
import React, { useState, useEffect } from 'react';
import { GamePhase, GameState } from './types';
import Registration from './components/Registration';
import AdminDashboard from './components/AdminDashboard';
import GameView from './components/GameView';
import { fetchGameContent, fetchSingleQuestion } from './services/geminiService';
import { audioService } from './services/audioService';

const STORAGE_KEY = 'paskong-pinoy-feud-state';

const App: React.FC = () => {
  // Internal Tab State
  const [activeTab, setActiveTab] = useState<'admin' | 'board'>('admin');
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [showResumeOverlay, setShowResumeOverlay] = useState(false);
  const [isReplacingQuestion, setIsReplacingQuestion] = useState(false);

  // Initialize state from LocalStorage if available
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load saved game", e);
    }
    
    return {
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
    };
  });

  // Effect: Save state to LocalStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Effect: Check if we restored a live game
  useEffect(() => {
    if (state.phase === GamePhase.PLAYING || state.phase === GamePhase.GAME_OVER) {
      setShowResumeOverlay(true);
    }
  }, []);

  // --- HOST ACTIONS ---
  
  const handleResume = () => {
    // CRITICAL: Initialize audio on user click
    audioService.initialize();
    
    setShowResumeOverlay(false);
    setIsMusicOn(true);
    audioService.toggleMusic(true);
  };
  
  const handleStrike = () => {
    if (state.strikes >= 3) return;
    
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
    // Ensure audio is ready if toggle is clicked manually
    if (shouldPlay) audioService.initialize();
    
    setIsMusicOn(shouldPlay);
    audioService.toggleMusic(shouldPlay);
  };

  const startGame = async (t1: string, t2: string) => {
    // CRITICAL: Initialize audio on user click
    audioService.initialize();
    toggleMusic(true);

    setState(prev => ({ ...prev, phase: GamePhase.LOADING }));
    
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

  const handleReplaceQuestion = async () => {
    setIsReplacingQuestion(true);
    try {
      const newQuestion = await fetchSingleQuestion();
      setState(prev => {
        // Create a copy of the questions array
        const updatedQuestions = [...prev.questions];
        // Replace the current index
        updatedQuestions[prev.currentRoundIndex] = newQuestion;
        
        return {
          ...prev,
          questions: updatedQuestions,
          currentRoundScore: 0, // Reset the pot for this round
          strikes: 0 // Reset strikes
        };
      });
    } catch (e) {
      console.error("Failed to replace question", e);
    }
    setIsReplacingQuestion(false);
  };

  const toggleAnswer = (answerIndex: number) => {
    const currentQuestion = state.questions[state.currentRoundIndex];
    if (!currentQuestion) return;
    
    const answer = currentQuestion.answers[answerIndex];
    if (!answer) return;

    const isRevealing = !answer.revealed;

    if (isRevealing) {
      audioService.playDing();
    }

    setState(prev => {
      const updatedQuestions = prev.questions.map((q, qIdx) => {
        if (qIdx !== prev.currentRoundIndex) return q;
        return {
          ...q,
          answers: q.answers.map((a, aIdx) => 
            aIdx === answerIndex ? { ...a, revealed: isRevealing } : a
          )
        };
      });

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
    localStorage.removeItem(STORAGE_KEY);
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
    setIsMusicOn(false);
    audioService.toggleMusic(false);
  };

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
                onReplaceQuestion={handleReplaceQuestion}
                isReplacing={isReplacingQuestion}
             />
          )
        ) : (
          // GAME SCREEN TAB
          <GameView state={state} />
        )}
      </div>

      {/* RESUME OVERLAY (Fixes Audio Autoplay on Reload) */}
      {showResumeOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
             <div className="text-6xl mb-4">⏸️</div>
             <h2 className="text-3xl font-display text-white mb-2">Game Paused</h2>
             <p className="text-gray-300 mb-8">Session restored. Click below to resume the game and enable audio.</p>
             <button 
               onClick={handleResume}
               className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xl rounded shadow-lg transition-transform active:scale-95"
             >
               Resume Game
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
