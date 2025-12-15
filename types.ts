export interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export interface Team {
  id: 1 | 2;
  name: string;
  score: number;
}

export enum GamePhase {
  REGISTRATION = 'REGISTRATION',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  ROUND_OVER = 'ROUND_OVER',
  GAME_OVER = 'GAME_OVER',
  ERROR = 'ERROR'
}

export interface GameState {
  teams: {
    1: Team;
    2: Team;
  };
  currentRoundIndex: number;
  questions: Question[];
  currentRoundScore: number;
  strikes: number;
  showStrikeOverlay: boolean;
  phase: GamePhase;
  error?: string;
}