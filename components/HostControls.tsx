import React from 'react';
import { Question } from '../types';

interface Props {
  question: Question;
  isVisible: boolean;
  onReveal: (index: number) => void;
}

const HostControls: React.FC<Props> = ({ question, isVisible, onReveal }) => {
  if (!isVisible || !question) return null;

  return (
    <div className="fixed bottom-0 right-0 m-4 p-4 bg-slate-800/95 border-2 border-yellow-500 rounded-lg shadow-2xl z-50 max-w-sm w-full backdrop-blur-sm">
      <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
        <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-sm">
          Host Control Center
        </h3>
        <span className="text-[10px] text-gray-400">Click row to reveal</span>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {question.answers.map((ans, idx) => (
          <button 
            key={idx} 
            onClick={() => !ans.revealed && onReveal(idx)}
            disabled={ans.revealed}
            className={`w-full flex justify-between items-center p-2 rounded transition-all text-left group
              ${ans.revealed 
                ? 'bg-green-900/50 text-green-200 cursor-default' 
                : 'bg-white/5 text-white hover:bg-blue-600 cursor-pointer border border-transparent hover:border-yellow-400'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className={`font-mono font-bold w-6 ${ans.revealed ? 'text-green-500' : 'text-yellow-500'}`}>
                #{idx + 1}
              </span>
              <span className="text-sm font-medium">{ans.text}</span>
            </div>
            <span className="font-bold text-blue-300">{ans.points}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-gray-400 text-center leading-tight">
        <p>💡 <strong>Tip:</strong> Drag the "Projector View" window to your HDMI screen.</p>
        <p>Control the game from this main window.</p>
      </div>
    </div>
  );
};

export default HostControls;