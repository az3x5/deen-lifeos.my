import React, { useState, useRef, useEffect } from 'react';
import { getDuas } from '../services/dataService';
import { Search, Heart, Share2, ChevronLeft, LayoutGrid, Plane, Sun, Moon, ChevronRight, User, Play, Pause, Volume2, MoreHorizontal, X, SkipBack, SkipForward, Sparkles } from 'lucide-react';

export const DuaView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Audio State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const allDuas = getDuas();
  const activeDua = allDuas.find(d => d.id === playingId);
  
  // Extract unique categories with counts
  const categories = Array.from(new Set(allDuas.map(d => d.category))).map(cat => ({
    name: cat,
    count: allDuas.filter(d => d.category === cat).length
  }));

  const getCategoryTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case 'travel': return { Icon: Plane, gradient: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-200 dark:shadow-none' };
      case 'daily': return { Icon: Sun, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200 dark:shadow-none' };
      case 'lifestyle': return { Icon: Sparkles, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200 dark:shadow-none' };
      case 'prayer': return { Icon: Moon, gradient: 'from-purple-400 to-violet-500', shadow: 'shadow-purple-200 dark:shadow-none' };
      default: return { Icon: LayoutGrid, gradient: 'from-slate-400 to-slate-500', shadow: 'shadow-slate-200 dark:shadow-none' };
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedCategory(null);
    stopAudio();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPaused(false);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const playDua = (url: string, id: string) => {
    if (playingId === id) {
      togglePlay();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = playbackRate;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setIsPaused(false);
        setCurrentTime(0);
      });

      audio.play().catch(e => console.error("Audio play error", e));
      setPlayingId(id);
      setIsPaused(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const cyclePlaybackSpeed = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in pb-20 lg:pb-0">
      {!selectedCategory ? (
        // Category View
        <>
          <div className="relative bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm pt-2 pb-6 z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">Duas & Adhkar</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">Authentic supplications for every moment</p>
            
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm md:text-base transition-shadow group-hover:shadow-md dark:text-slate-100"
              />
              <Search className="absolute left-4 top-4.5 text-slate-400" size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((cat) => {
              const theme = getCategoryTheme(cat.name);
              return (
                <button
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all text-left group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 bg-gradient-to-br ${theme.gradient} text-white rounded-2xl flex items-center justify-center shadow-lg ${theme.shadow} group-hover:scale-105 transition-transform`}>
                      <theme.Icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-lg">{cat.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1">{cat.count} Duas</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" size={22} />
                </button>
              );
            })}
          </div>
        </>
      ) : (
        // Detail View
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors group mb-8 text-sm md:text-base bg-white dark:bg-slate-900 w-fit px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md"
          >
            <ChevronLeft size={20} />
            <span className="font-bold">Back to Categories</span>
          </button>

          <div className="flex items-center gap-5 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
            <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${getCategoryTheme(selectedCategory).gradient} text-white rounded-3xl flex items-center justify-center shadow-lg ${getCategoryTheme(selectedCategory).shadow}`}>
              {(() => {
                const ThemeIcon = getCategoryTheme(selectedCategory).Icon;
                return <ThemeIcon size={40} />;
              })()}
            </div>
            <div>
               <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{selectedCategory}</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mt-1">
                 {allDuas.filter(d => d.category === selectedCategory).length} Supplications Collection
               </p>
            </div>
          </div>

          <div className="space-y-6">
            {allDuas.filter(d => d.category === selectedCategory).map((dua) => (
              <div key={dua.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-2">
                      {dua.audio && (
                        <button 
                          onClick={() => playDua(dua.audio!, dua.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            playingId === dua.id 
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 scale-105' 
                              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                          }`}
                        >
                          {playingId === dua.id && !isPaused ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                          {playingId === dua.id ? (isPaused ? 'RESUME' : 'PLAYING') : 'LISTEN'}
                        </button>
                      )}
                   </div>
                   <div className="flex gap-2 text-slate-400">
                    <button className="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-full transition-colors"><Heart size={20} /></button>
                    <button className="hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-full transition-colors"><Share2 size={20} /></button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg md:text-xl mb-8 border-l-4 border-emerald-500 pl-4">{dua.title}</h3>
                
                <p className="font-arabic text-3xl md:text-4xl text-right leading-[2.2] text-slate-800 dark:text-slate-200 mb-8 drop-shadow-sm" dir="rtl">
                  {dua.arabic}
                </p>
                
                <div className="space-y-6 bg-slate-50/80 dark:bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div>
                     <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Transliteration</h4>
                     <p className="text-emerald-800/80 dark:text-emerald-200/80 italic text-base md:text-lg leading-relaxed font-medium">
                      {dua.transliteration}
                     </p>
                  </div>
                  
                  <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Translation</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                      {dua.translation}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-wide">
                      Ref: {dua.reference}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Player - Glassmorphic */}
      {playingId && activeDua && (
        <div className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 lg:pl-72 z-40 animate-in slide-in-from-bottom-10 duration-300 pointer-events-none">
             <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] p-4 pointer-events-auto">
                <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    {/* Play Controls */}
                    <button 
                        onClick={togglePlay}
                        className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-transform active:scale-95 flex-shrink-0"
                    >
                        {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
                    </button>

                    {/* Track Info & Progress */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate pr-2">{activeDua.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400 font-medium flex-shrink-0">
                            {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full w-full group cursor-pointer overflow-hidden">
                            <div 
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-100"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                            <input 
                            type="range" 
                            min="0" 
                            max={duration || 0} 
                            value={currentTime} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Extra Controls */}
                    <div className="flex items-center gap-2 md:gap-4 pl-2">
                    <button 
                        onClick={cyclePlaybackSpeed}
                        className="hidden md:block text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors w-14 text-center"
                    >
                        {playbackRate}x
                    </button>
                    <button 
                        onClick={stopAudio}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors"
                    >
                        <X size={22} />
                    </button>
                    </div>
                </div>
                
                {/* Mobile Speed Control (Row below) */}
                <div className="md:hidden flex justify-between items-center mt-3 text-xs text-slate-400 px-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="truncate max-w-[200px] font-medium text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-wide">{activeDua.category}</span>
                    <button onClick={cyclePlaybackSpeed} className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded">
                        Speed: {playbackRate}x
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};