'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Music, X, Sparkles, Flame, Sliders, Volume2, Mic2, Disc, Wind } from 'lucide-react';

interface MusicStudioProps {
  showMusicStyles: boolean;
  setShowMusicStyles: (show: boolean) => void;
  customMusicStyle: string;
  setCustomMusicStyle: (val: string) => void;
  selectedMusicStyle: string;
  setSelectedMusicStyle: (val: string) => void;
  onSurpriseMe: () => void;
  productionBass: number;
  setProductionBass: (val: number) => void;
  productionGrime: number;
  setProductionGrime: (val: number) => void;
  productionClarity: number;
  setProductionClarity: (val: number) => void;
  productionNeuralDepth: number;
  setProductionNeuralDepth: (val: number) => void;
  productionMoodShift: 'Neutral' | 'Euphoric' | 'Aggressive' | 'Melancholic' | 'Transcendental';
  setProductionMoodShift: (val: 'Neutral' | 'Euphoric' | 'Aggressive' | 'Melancholic' | 'Transcendental') => void;
  productionAtmosphere: 'Standard' | 'Rainy Noir' | 'Neon Fog' | 'Dead Silence' | 'Urban Chaos' | 'Coastal Ethereal';
  setProductionAtmosphere: (val: 'Standard' | 'Rainy Noir' | 'Neon Fog' | 'Dead Silence' | 'Urban Chaos' | 'Coastal Ethereal') => void;
  productionSoulResonance: number;
  setProductionSoulResonance: (val: number) => void;
  productionInstruments: string[];
  setProductionInstruments: (insts: string[]) => void;
  productionMastering: 'Standard' | 'B-Grade' | 'Gritty' | 'Cinematic';
  setProductionMastering: (val: 'Standard' | 'B-Grade' | 'Gritty' | 'Cinematic') => void;
  productionVocalMode: 'Male' | 'Female' | 'Clone' | 'None';
  setProductionVocalMode: (val: 'Male' | 'Female' | 'Clone' | 'None') => void;
  onGenerateSong: () => void;
  MUSIC_TEMPLATES: any[];
  TRENDING_MUSIC_STYLES: any[];
  setToast: (toast: any) => void;
}

export const MusicStudio = ({
  showMusicStyles,
  setShowMusicStyles,
  customMusicStyle,
  setCustomMusicStyle,
  selectedMusicStyle,
  setSelectedMusicStyle,
  onSurpriseMe,
  productionBass,
  setProductionBass,
  productionGrime,
  setProductionGrime,
  productionClarity,
  setProductionClarity,
  productionNeuralDepth,
  setProductionNeuralDepth,
  productionMoodShift,
  setProductionMoodShift,
  productionAtmosphere,
  setProductionAtmosphere,
  productionSoulResonance,
  setProductionSoulResonance,
  productionInstruments,
  setProductionInstruments,
  productionMastering,
  setProductionMastering,
  productionVocalMode,
  setProductionVocalMode,
  onGenerateSong,
  MUSIC_TEMPLATES,
  TRENDING_MUSIC_STYLES,
  setToast
}: MusicStudioProps) => {
  if (!showMusicStyles) return null;

  const toggleInstrument = (inst: string) => {
    if (productionInstruments.includes(inst)) {
      setProductionInstruments(productionInstruments.filter(i => i !== inst));
    } else if (productionInstruments.length < 5) {
      setProductionInstruments([...productionInstruments, inst]);
    }
  };

  const INSTRUMENT_OPTIONS = [
    'Heavy Bass', 'Analog Synths', 'Distorted Guitar', 'Lo-Fi Piano', 
    'Cinematic Strings', 'Gritty Drums', 'Jazz Trumpet', 'Indian Sitar',
    'Dark Cello', 'Electronic Pads', 'Street Percussion', 'Sultry Sax'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="mb-6 p-6 bg-zinc-900/90 backdrop-blur-2xl border border-amber-600/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Disc className="w-48 h-48 text-amber-500 animate-spin-slow" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Music className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 italic">Music Production House</h2>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Produce Cinematic Noir Soundtracks</p>
            </div>
          </div>
          <button onClick={() => setShowMusicStyles(false)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Style & Genre */}
          <div className="space-y-6">
            <section>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Brand & Style Forge</label>
              <div className="relative group/input">
                <input 
                  type="text"
                  value={customMusicStyle}
                  onChange={(e) => {
                    setCustomMusicStyle(e.target.value);
                    setSelectedMusicStyle('Custom');
                  }}
                  placeholder="Describe your sound (e.g. Gritty Bombay Jazz Trap...)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-zinc-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all outline-none"
                />
                <button 
                  onClick={onSurpriseMe}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl transition-all"
                  title="Surprise Me"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Noir Templates</label>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-orange-600 animate-ping" />
                  <span className="text-[8px] text-orange-500 font-black uppercase tracking-[0.2em] italic">Trending</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedMusicStyle('Random');
                    setCustomMusicStyle('');
                  }}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    selectedMusicStyle === 'Random' 
                      ? 'bg-zinc-100 border-white text-black shadow-lg shadow-white/10' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  Auto-Fit
                </button>
                {MUSIC_TEMPLATES.map(template => (
                  <button
                    key={template.name}
                    onClick={() => {
                      setSelectedMusicStyle(template.style);
                      setCustomMusicStyle(template.style);
                      setToast({ message: `Aesthetic: ${template.name}`, type: 'info' });
                    }}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      selectedMusicStyle === template.style 
                        ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">Item Song Regions</p>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {TRENDING_MUSIC_STYLES.map(trend => (
                  <button
                    key={trend.name}
                    onClick={() => {
                      setSelectedMusicStyle(trend.style);
                      setCustomMusicStyle(trend.style);
                      setToast({ message: `Region: ${trend.name}`, type: 'info' });
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                      selectedMusicStyle === trend.style 
                        ? 'bg-zinc-800 border-amber-500 text-white scale-105' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-800'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${trend.color || 'bg-zinc-500'}`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">{trend.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Side: Production Controls */}
          <div className="bg-zinc-950/50 p-6 border border-zinc-800 rounded-[2rem] space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Audio Engineering & Mastering</h3>
            </div>

            <div className="space-y-5">
              {/* Bass Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-2">
                    <Volume2 className="w-3 h-3" /> Bass Impact
                  </label>
                  <span className="text-[10px] font-mono text-amber-500 font-bold">{productionBass}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={productionBass} 
                  onChange={(e) => setProductionBass(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Grime Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-2">
                    <Flame className="w-3 h-3 text-orange-500" /> Atmospheric Grime
                  </label>
                  <span className="text-[10px] font-mono text-orange-500 font-bold">{productionGrime}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={productionGrime} 
                  onChange={(e) => setProductionGrime(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Clarity Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-2">
                    <Volume2 className="w-3 h-3 text-blue-400" /> Audio Clarity
                  </label>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{productionClarity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={productionClarity} 
                  onChange={(e) => setProductionClarity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Neural Depth Control */}
              <div className="space-y-2 p-4 bg-purple-900/10 border border-purple-500/20 rounded-2xl">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black uppercase text-purple-400 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Psychological Depth
                  </label>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{productionNeuralDepth}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={productionNeuralDepth} 
                  onChange={(e) => setProductionNeuralDepth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Soul Resonance Control */}
              <div className="space-y-2 p-4 bg-red-900/10 border border-red-500/20 rounded-2xl">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black uppercase text-red-400 flex items-center gap-2">
                    <Flame className="w-3 h-3" /> Soul Connection
                  </label>
                  <span className="text-[10px] font-mono text-red-400 font-bold">{productionSoulResonance}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={productionSoulResonance} 
                  onChange={(e) => setProductionSoulResonance(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-[7px] text-red-300/60 font-medium italic mt-1 uppercase tracking-wider">
                  Controls the emotional &quot;frequency&quot; of the composition. 
                  <span className="block mt-0.5 opacity-40">Higher values for deep emotional impact.</span>
                </p>
              </div>

              {/* Mausam / Atmospheric Control */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-2">
                  <Wind className="w-3 h-3" /> Mausam / Atmosphere
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Standard', 'Rainy Noir', 'Neon Fog', 'Dead Silence', 'Urban Chaos', 'Coastal Ethereal'] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setProductionAtmosphere(env)}
                      className={`py-2 px-1 rounded-lg text-[8px] font-bold uppercase transition-all border ${
                        productionAtmosphere === env 
                        ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-900/20' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Transformer Control */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-2">
                  <Wind className="w-3 h-3 text-cyan-400" /> Mood Transformer
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['Neutral', 'Euphoric', 'Aggressive', 'Melancholic', 'Transcendental'] as const).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setProductionMoodShift(mood)}
                      className={`py-2 px-1 rounded-lg text-[8px] font-bold uppercase transition-all border ${
                        productionMoodShift === mood 
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      {mood === 'Transcendental' ? 'Zen' : mood}
                    </button>
                  ))}
                </div>
                <p className="text-[7px] text-zinc-500 font-medium italic uppercase tracking-wider">
                  Directs the AI to actively transition the listener&apos;s emotional state.
                </p>
              </div>

              {/* Vocal Mode */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center gap-2 mb-2">
                  <Mic2 className="w-3 h-3 text-blue-500" /> Lead Vocal Processing
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['None', 'Male', 'Female', 'Clone'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setProductionVocalMode(mode as any)}
                      className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all border ${
                        productionVocalMode === mode 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instruments Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-zinc-600 block mb-2">Core Instrumentation (Max 5)</label>
                <div className="flex flex-wrap gap-1.5">
                  {INSTRUMENT_OPTIONS.map(inst => (
                    <button
                      key={inst}
                      onClick={() => toggleInstrument(inst)}
                      className={`px-2.5 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all border ${
                        productionInstruments.includes(inst)
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400'
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mastering Finish */}
              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-black uppercase text-zinc-600 block mb-2">Mastering Texture</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Standard', 'B-Grade', 'Gritty', 'Cinematic'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setProductionMastering(type as any)}
                      className={`py-3 rounded-xl text-[8px] font-black uppercase transition-all border flex flex-col items-center justify-center gap-1 ${
                        productionMastering === type 
                          ? 'bg-zinc-100 border-white text-black' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onGenerateSong}
          className="w-full mt-8 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 group"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Production: Produce & Beta-Test Master
          <Music className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
