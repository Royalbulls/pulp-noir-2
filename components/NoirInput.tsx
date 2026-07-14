'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Newspaper, 
  User, 
  Music, 
  ChevronUp, 
  Search, 
  History, 
  Plus,
  Loader2,
  Mic
} from 'lucide-react';

interface NoirInputProps {
  onSend: (val: string) => void; 
  loading: boolean; 
  randomizeAll: () => void;
  initialValue: string;
  onToggleNews: () => void;
  onToggleArchetypes: () => void;
  onToggleMusicStyles: () => void;
  onGenerateSong: () => void;
  onToggleAdvanced: () => void;
  showAdvanced: boolean;
  onSaveDraft: () => void;
  showNews: boolean;
  showArchetypes: boolean;
  showMusicStyles: boolean;
  newsLoading: boolean;
  hasPrompt: boolean;
  customMusicStyle: string;
  setCustomMusicStyle: (val: string) => void;
  selectedMusicStyle: string;
  setSelectedMusicStyle: (val: string) => void;
  onSurpriseMe: () => void;
}

export const NoirInput = React.memo(({ 
  onSend, 
  loading, 
  randomizeAll, 
  initialValue, 
  onToggleNews, 
  onToggleArchetypes, 
  onToggleMusicStyles, 
  onGenerateSong, 
  onToggleAdvanced, 
  showAdvanced, 
  onSaveDraft, 
  showNews, 
  showArchetypes, 
  showMusicStyles, 
  newsLoading,
  hasPrompt
}: NoirInputProps) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const [showMobileTools, setShowMobileTools] = useState(false);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleSend = () => {
    if (localValue.trim()) {
      onSend(localValue);
      setLocalValue('');
      setShowMobileTools(false);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Mobile Tools Popover */}
      <AnimatePresence>
        {showMobileTools && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-wrap justify-around gap-4 lg:hidden z-50 backdrop-blur-xl"
          >
            <button 
              onClick={() => { onToggleNews(); setShowMobileTools(false); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[70px] ${showNews ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {newsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Newspaper className="w-6 h-6" />}
              <span className="text-[8px] font-black uppercase tracking-widest">Reports</span>
            </button>
            <button 
              onClick={() => { onToggleArchetypes(); setShowMobileTools(false); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[70px] ${showArchetypes ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase tracking-widest">Persona</span>
            </button>
            <button 
              onClick={() => { onToggleMusicStyles(); setShowMobileTools(false); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[70px] ${showMusicStyles ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              <Music className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase tracking-widest">Music</span>
            </button>
            <button 
              onClick={() => { randomizeAll(); setShowMobileTools(false); }}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[70px] bg-zinc-800 text-zinc-400"
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase tracking-widest">Roll</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center bg-zinc-950 border border-zinc-800/50 rounded-2xl transition-all focus-within:border-zinc-100/20 shadow-2xl">
        <div className="hidden lg:flex items-center gap-1 pl-4 pr-2 border-r border-zinc-900">
          <button 
            onClick={onToggleNews}
            className={`p-2 transition-colors ${showNews ? 'text-red-500 bg-red-500/10 rounded-lg' : 'text-zinc-500 hover:text-red-500'}`}
            title="Noir News Reports"
          >
            {newsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Newspaper className="w-5 h-5" />}
          </button>
          <button 
            onClick={onToggleArchetypes}
            className={`p-2 transition-colors ${showArchetypes ? 'text-blue-500 bg-blue-500/10 rounded-lg' : 'text-zinc-500 hover:text-blue-500'}`}
            title="Character Archetypes"
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            onClick={onToggleMusicStyles}
            className={`p-2 transition-colors ${showMusicStyles ? 'text-amber-500 bg-amber-500/10 rounded-lg' : 'text-zinc-500 hover:text-amber-500'}`}
            title="Music Style Studio"
          >
            <Music className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => setShowMobileTools(!showMobileTools)}
          className="lg:hidden p-4 text-zinc-500"
        >
          <ChevronUp className={`w-5 h-5 transition-transform ${showMobileTools ? 'rotate-180' : ''}`} />
        </button>

        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Whisper your noir fate here..."
          className="flex-1 bg-transparent text-white px-6 py-5 text-sm outline-none placeholder:text-zinc-700 resize-none h-[64px]"
        />

        <div className="flex items-center gap-2 pr-4 pl-2">
          {localValue && (
            <button
              onClick={() => onSend(localValue)}
              className="p-3 bg-zinc-100 hover:bg-white text-black rounded-xl transition-all hidden sm:flex"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={randomizeAll}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl transition-all border border-zinc-800"
            title="Surprise Me"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

NoirInput.displayName = 'NoirInput';
