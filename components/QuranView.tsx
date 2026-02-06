import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah } from '../types';
import { fetchSurahList, fetchSurahDetails } from '../services/dataService';
import { ChevronLeft, PlayCircle, PauseCircle, StopCircle, RefreshCw, ChevronDown, Play, Pause, X, SkipForward, BookOpenText, Search, FileText } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const QuranView: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<{ arabic: Ayah[], english: Ayah[], transliteration: Ayah[], tafsir: Ayah[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List States
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const { settings } = useSettings();

  // Audio State
  const [playingAyah, setPlayingAyah] = useState<number | null>(null); // Global ayah number
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Tafsir State
  const [activeTafsir, setActiveTafsir] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlaylistMode = useRef<boolean>(false);
  const ayahsRef = useRef(ayahs);

  useEffect(() => {
    loadSurahs();
    return () => stopAudio();
  }, []);

  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  const loadSurahs = async () => {
    setListLoading(true);
    setListError(false);
    const data = await fetchSurahList();
    if (data) {
      setSurahs(data);
    } else {
      setListError(true);
    }
    setListLoading(false);
  };

  // Auto-scroll to playing ayah
  useEffect(() => {
    if (playingAyah) {
      const element = document.getElementById(`ayah-${playingAyah}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [playingAyah]);

  const handleSelectSurah = async (number: number) => {
    stopAudio();
    setLoading(true);
    setError(null);
    setSelectedSurah(number);
    setActiveTafsir(null);

    try {
      const details = await fetchSurahDetails(number);
      if (details) {
        setAyahs(details);
      } else {
        setError("Failed to load Surah data. Please check your internet connection.");
        setAyahs(null);
      }
    } catch (e) {
      setError("An unexpected error occurred.");
      setAyahs(null);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleRetry = () => {
    if (selectedSurah) {
      handleSelectSurah(selectedSurah);
    }
  };

  const handleBack = () => {
    stopAudio();
    setSelectedSurah(null);
    setAyahs(null);
    setActiveTafsir(null);
    setError(null);
  };

  const toggleTafsir = (ayahNumber: number) => {
    if (activeTafsir === ayahNumber) {
      setActiveTafsir(null);
    } else {
      setActiveTafsir(ayahNumber);
    }
  };

  // Audio Logic
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAyah(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPaused(false);
    isPlaylistMode.current = false;
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

  const playNextAyah = () => {
    if (!ayahs || playingAyah === null) return;

    const currentIndex = ayahs.arabic.findIndex(a => a.number === playingAyah);
    if (currentIndex !== -1 && currentIndex < ayahs.arabic.length - 1) {
      const nextAyah = ayahs.arabic[currentIndex + 1];
      playAyah(nextAyah.number, true); // Continue playlist mode
    } else {
      stopAudio();
    }
  };

  const playAyah = (ayahNumber: number, playlistMode: boolean = false) => {
    if (playingAyah === ayahNumber) {
      togglePlay();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      isPlaylistMode.current = playlistMode;

      // Use selected reciter from settings
      const reciterId = settings.reciterId || 'ar.alafasy';
      const url = `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayahNumber}.mp3`;
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
        if (isPlaylistMode.current) {
          setPlayingAyah(prev => prev);
          if (ayahsRef.current) {
            const list = ayahsRef.current.arabic;
            const idx = list.findIndex(a => a.number === ayahNumber);
            if (idx !== -1 && idx < list.length - 1) {
              const next = list[idx + 1];
              setTimeout(() => playAyah(next.number, true), 0);
              return;
            }
          }
          stopAudio();
        } else {
          setPlayingAyah(null);
          setIsPaused(false);
          setCurrentTime(0);
        }
      });

      audio.play().catch(e => console.error("Audio playback failed", e));
      setPlayingAyah(ayahNumber);
      setIsPaused(false);
    }
  };

  const playFullSurah = () => {
    if (ayahs && ayahs.arabic.length > 0) {
      playAyah(ayahs.arabic[0].number, true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const cyclePlaybackSpeed = () => {
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

  // Filter Surahs
  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery) ||
    String(s.number).includes(searchQuery)
  );

  const ayhs = ayahs;

  if (selectedSurah !== null) {
    // Reading Mode
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="relative z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm md:text-base py-3 w-full max-w-6xl mx-auto px-1"
          >
            <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <ChevronLeft size={20} />
            </div>
            <span className="font-medium">Back to Surah List</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-600 dark:border-t-emerald-500"></div>
            <p className="text-slate-400 dark:text-slate-500 font-medium animate-pulse">Loading Surah...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in">
            <div className="bg-rose-100 dark:bg-rose-900/20 p-4 rounded-full mb-4">
              <RefreshCw size={32} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Connection Error</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Retry
            </button>
          </div>
        ) : ayahs ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-6 border-b border-slate-100 dark:border-slate-800 pb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">{surahs.find(s => s.number === selectedSurah)?.englishName}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">{surahs.find(s => s.number === selectedSurah)?.englishNameTranslation}</p>
              </div>

              <button
                onClick={playFullSurah}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Play size={20} fill="currentColor" />
                Play Full Surah
              </button>
            </div>

            {/* Bismillah */}
            <div className="text-center py-6 text-emerald-800 dark:text-emerald-400 opacity-90" style={{ fontFamily: settings.fontFamily, fontSize: `${settings.arabicFontSize + 8}px` }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>

            <div className="space-y-6">
              {ayahs.arabic.map((ayah, index) => {
                const isPlaying = playingAyah === ayah.number;
                const transliteration = ayahs.transliteration[index]?.text;
                const translation = ayahs.english[index]?.text;
                const tafsir = ayahs.tafsir[index]?.text;
                const isTafsirOpen = activeTafsir === ayah.number;
                const hasTafsir = Boolean(tafsir);

                return (
                  <div
                    key={ayah.number}
                    id={`ayah-${ayah.number}`}
                    className={`bg-white dark:bg-slate-900 p-5 md:p-8 rounded-3xl border transition-all duration-500 ${isPlaying
                      ? 'border-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20 ring-1 ring-emerald-500 scale-[1.01]'
                      : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isPlaying ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                        {selectedSurah}:{ayah.numberInSurah}
                      </span>
                      <div className="flex gap-2 text-slate-400 dark:text-slate-500 items-center">
                        {hasTafsir && (
                          <button
                            onClick={() => toggleTafsir(ayah.number)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors text-xs font-bold uppercase tracking-wider ${isTafsirOpen ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600'}`}
                            title="Read Tafsir"
                          >
                            <BookOpenText size={16} />
                            <span className="hidden sm:inline">Tafsir</span>
                          </button>
                        )}
                        <button
                          onClick={() => playAyah(ayah.number, false)}
                          className={`transition-all duration-300 hover:scale-110 p-1 ${isPlaying ? 'text-emerald-600 dark:text-emerald-400' : 'hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                          title={isPlaying ? "Pause" : "Play Ayah"}
                        >
                          {isPlaying && !isPaused ? <PauseCircle size={32} className="fill-emerald-50 dark:fill-emerald-900/30" /> : <PlayCircle size={32} />}
                        </button>
                      </div>
                    </div>

                    <p
                      className="text-right leading-[2.5] text-slate-800 dark:text-slate-100 mb-8"
                      dir="rtl"
                      style={{
                        fontSize: `${settings.arabicFontSize}px`,
                        fontFamily: settings.fontFamily
                      }}
                    >
                      {ayah.text}
                    </p>

                    {settings.showTransliteration && transliteration && (
                      <p className="text-emerald-700 dark:text-emerald-400 mb-4 font-medium italic opacity-90" style={{ fontSize: `${settings.translationFontSize}px` }}>
                        {transliteration}
                      </p>
                    )}

                    {settings.showTranslation && translation && (
                      <p
                        className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans"
                        style={{ fontSize: `${settings.translationFontSize}px`, fontFamily: 'MV Faseyha, sans-serif' }}
                        dir="rtl"
                      >
                        {translation}
                      </p>
                    )}

                    {/* Tafsir Panel */}
                    {isTafsirOpen && tafsir && (
                      <div className="mt-8 pt-6 border-t-2 border-indigo-50 dark:border-indigo-900/30 animate-in fade-in slide-in-from-top-4">
                        <h4 className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-sm uppercase tracking-wide mb-3">
                          <BookOpenText size={16} /> Tafsir Ibn Kathir
                        </h4>
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base border border-indigo-100/50 dark:border-indigo-800/30 text-justify">
                          {tafsir}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Sticky Bottom Player - Glassmorphic */}
        {playingAyah && ayhs && (
          <div className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 lg:pl-72 z-40 animate-in slide-in-from-bottom-10 duration-300 pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] p-4 pointer-events-auto">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                  {/* Play Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-transform active:scale-95 flex-shrink-0"
                    >
                      {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
                    </button>
                    {isPlaylistMode.current && (
                      <button
                        onClick={playNextAyah}
                        className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors hidden md:block"
                        title="Next Ayah"
                      >
                        <SkipForward size={22} fill="currentColor" />
                      </button>
                    )}
                  </div>

                  {/* Track Info & Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="truncate pr-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                          {surahs.find(s => s.number === selectedSurah)?.englishName}
                        </h4>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Ayah {ayhs.arabic.find(a => a.number === playingAyah)?.numberInSurah}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-medium flex-shrink-0">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-full group cursor-pointer overflow-hidden">
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
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>

                {/* Mobile Speed Control (Row below) */}
                <div className="md:hidden flex justify-between items-center mt-3 text-xs text-slate-400 dark:text-slate-500 px-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">
                    {isPlaylistMode.current ? 'AUTO-PLAYING SURAH' : 'SINGLE AYAH'}
                  </span>
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
  }

  // Dhivehi Tafsir PDF State
  const [showDhivehiModal, setShowDhivehiModal] = useState(false);

  // ... (existing helper functions) ...

  const toggleDhivehiModal = () => setShowDhivehiModal(!showDhivehiModal);

  // ...

  // List Mode (Top Bar modification)
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="relative bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm pt-2 pb-6 z-10 border-b border-transparent transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Quran Kareem</h2>
          <button
            onClick={toggleDhivehiModal}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <BookOpenText size={18} />
            <span className="hidden sm:inline">Dhivehi Tafsir (PDF)</span>
          </button>
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder="Search Surah by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base transition-all group-hover:shadow-md dark:text-slate-100"
          />
          <Search className="absolute left-4 top-4 text-slate-400" size={20} />
        </div>
      </div>

      {/* Dhivehi PDF Modal */}
      {showDhivehiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
            <button onClick={toggleDhivehiModal} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <BookOpenText className="text-emerald-500" /> Dhivehi Tafsir
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Official Dhivehi translation and tafsir (PDF format). Select a volume to view.
            </p>

            <div className="space-y-3">
              <a href="/tafsir/vol1.pdf" target="_blank" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 border border-transparent transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-700 p-2 rounded-lg text-rose-500 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Volume 1</span>
                    <span className="text-xs text-slate-400">Chapters 1 - 10 (Approx)</span>
                  </div>
                </div>
                <ChevronLeft className="rotate-180 text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
              </a>

              <a href="/tafsir/vol2.pdf" target="_blank" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 border border-transparent transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-700 p-2 rounded-lg text-rose-500 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Volume 2</span>
                    <span className="text-xs text-slate-400">Chapters 11 - 20 (Approx)</span>
                  </div>
                </div>
                <ChevronLeft className="rotate-180 text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
              </a>

              <a href="/tafsir/vol3.pdf" target="_blank" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 border border-transparent transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-700 p-2 rounded-lg text-rose-500 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Volume 3</span>
                    <span className="text-xs text-slate-400">Chapters 21 - 30 (Approx)</span>
                  </div>
                </div>
                <ChevronLeft className="rotate-180 text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
              </a>
            </div>

            <p className="mt-4 text-xs text-center text-slate-400 dark:text-slate-500">
              PDFs will open in a new tab.
            </p>
          </div>
        </div>
      )}


      {listLoading ? (
        <div className="flex justify-center py-20 animate-in fade-in">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-600 dark:border-t-emerald-500"></div>
        </div>
      ) : listError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in">
          <div className="bg-rose-100 dark:bg-rose-900/20 p-4 rounded-full mb-4">
            <RefreshCw size={32} className="text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Connection Error</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">Failed to load Surah list. Please check your internet connection.</p>
          <button
            onClick={loadSurahs}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSurahs.map((surah) => (
            <button
              key={surah.number}
              onClick={() => handleSelectSurah(surah.number)}
              className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-50 dark:hover:shadow-emerald-900/10 transition-all text-left group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-50 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-emerald-200 dark:group-hover:shadow-emerald-900/50">
                  {surah.number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">{surah.englishName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs</p>
                </div>
              </div>
              <div className="font-arabic text-xl md:text-2xl text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors relative z-10">
                {surah.name.replace('سُورَةُ ', '')}
              </div>
            </button>
          ))}
          {filteredSurahs.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
              No Surahs found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};