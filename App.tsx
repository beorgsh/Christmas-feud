
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase, GameState, Question } from './types';
import Registration from './components/Registration';
import AdminDashboard from './components/AdminDashboard';
import GameView from './components/GameView';
import { fetchGameContent, fetchQuestionFromAI, fetchQuestionFromList, fetchFixedGameSet } from './services/geminiService';
import { audioService } from './services/audioService';

const STORAGE_KEY = 'paskong-pinoy-feud-state';
const CHANNEL_NAME = 'paskong-pinoy-feud-sync'; // BroadcastChannel name

const App: React.FC = () => {
  // Determine initial tab based on URL parameter
  const getInitialTab = (): 'admin' | 'board' => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('role') === 'board' ? 'board' : 'admin';
    }
    return 'admin';
  };

  // Internal Tab State
  const [activeTab, setActiveTab] = useState<'admin' | 'board'>(getInitialTab);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [showResumeOverlay, setShowResumeOverlay] = useState(false);
  const [isReplacingQuestion, setIsReplacingQuestion] = useState(false);

  // Refs
  const channelRef = useRef<BroadcastChannel | null>(null);
  const strikeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Effect: Initialize BroadcastChannel for High-Speed Sync
  useEffect(() => {
    // Initialize Channel
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      const incomingState = event.data;
      if (incomingState) {
        setState(prevState => {
           // Prevent infinite loops and unnecessary renders
           // Only update if content is actually different
           if (JSON.stringify(prevState) === JSON.stringify(incomingState)) {
             return prevState;
           }
           return incomingState;
        });
      }
    };

    channelRef.current.onmessage = handleMessage;

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  // Effect: Sync State changes (LocalStorage + BroadcastChannel)
  useEffect(() => {
    const json = JSON.stringify(state);
    
    // 1. Persistence (LocalStorage)
    // We keep this so the game survives a refresh
    if (localStorage.getItem(STORAGE_KEY) !== json) {
      localStorage.setItem(STORAGE_KEY, json);
    }

    // 2. Realtime Sync (BroadcastChannel)
    // This is much faster than waiting for 'storage' event
    if (channelRef.current) {
      channelRef.current.postMessage(state);
    }

  }, [state]);

  // Effect: Listen for Storage events (Backup Sync for different windows/browsers if needed)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          setState(prev => {
             if (JSON.stringify(prev) === JSON.stringify(newState)) return prev;
             return newState;
          });
        } catch (error) {
          console.error("Failed to sync state from storage", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Effect: Check if we restored a live game
  useEffect(() => {
    if (state.phase === GamePhase.PLAYING || state.phase === GamePhase.GAME_OVER) {
      // Only show resume overlay on Admin tab
      if (activeTab === 'admin') {
        setShowResumeOverlay(true);
      }
    }
  }, [activeTab]);

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

    // Clear any existing timeout to prevent premature hiding if clicked rapidly
    if (strikeTimeoutRef.current) {
      clearTimeout(strikeTimeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      strikes: prev.strikes + 1,
      showStrikeOverlay: true
    }));

    // Set timeout to match the 2s animation duration
    strikeTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, showStrikeOverlay: false }));
      strikeTimeoutRef.current = null;
    }, 2000);
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
    
    try {
      // FIXED: Use the fixed list initially as requested
      const questions = fetchFixedGameSet();
      
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
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const replaceCurrentQuestion = (newQuestion: Question) => {
    setState(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[prev.currentRoundIndex] = newQuestion;
      
      return {
        ...prev,
        questions: updatedQuestions,
        currentRoundScore: 0, // Reset the pot
        strikes: 0 // Reset strikes
      };
    });
  };

  const handleReplaceAI = async () => {
    setIsReplacingQuestion(true);
    try {
      const newQuestion = await fetchQuestionFromAI();
      replaceCurrentQuestion(newQuestion);
    } catch (e) {
      console.error("Failed to replace AI question", e);
    }
    setIsReplacingQuestion(false);
  };

  const handleReplaceList = () => {
    // Instant replacement from local list
    const newQuestion = fetchQuestionFromList();
    replaceCurrentQuestion(newQuestion);
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
    const initialState = {
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
    setState(initialState);
    setIsMusicOn(false);
    audioService.toggleMusic(false);
  };

  // Open Game Board in new Tab
  const openGameWindow = () => {
    const url = window.location.href.split('?')[0] + '?role=board';
    window.open(url, '_blank', 'width=1280,height=720');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      
      {/* NAVIGATION TABS - Hidden in Board Mode AND during Registration */}
      {activeTab === 'admin' && state.phase !== GamePhase.REGISTRATION && state.phase !== GamePhase.LOADING && (
        <div className="bg-slate-900 border-b border-slate-700 p-2 flex items-center justify-center shrink-0">
          <div className="flex gap-2">
            <button
              disabled
              className="px-6 py-2 rounded font-bold uppercase text-sm tracking-wider flex items-center gap-2 bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] cursor-default"
            >
              <span>🎮</span>
              Host Controls
            </button>
            <button
              onClick={openGameWindow}
              className="px-6 py-2 rounded font-bold uppercase text-sm tracking-wider flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow transition-colors"
            >
              <span>🚀</span>
              Open Game Window
            </button>
          </div>
        </div>
      )}

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
                onReplaceAI={handleReplaceAI}
                onReplaceList={handleReplaceList}
                isReplacing={isReplacingQuestion}
             />
          )
        ) : (
          // GAME SCREEN TAB
          <GameView state={state} onBackToAdmin={() => setActiveTab('admin')} />
        )}
      </div>

      {/* RESUME OVERLAY (Fixes Audio Autoplay on Reload) */}
      {showResumeOverlay && activeTab === 'admin' && (
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
