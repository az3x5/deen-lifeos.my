import React from 'react';
import { PrayerTimingResponse } from '../types';
import { MapPin, Sun, Moon, Settings, ArrowRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface DashboardProps {
  prayerData: PrayerTimingResponse | null;
  loading: boolean;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ prayerData, loading, onOpenSettings }) => {
  const { settings, updateSettings } = useSettings();
  const nextPrayer = "Asr"; // Mocked calculation logic for visual demo
  const timeLeft = "02:14:30";

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Assalamu Alaykum</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {prayerData && <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full ml-2 text-xs md:text-sm">{prayerData.data.date.hijri.month.en} {prayerData.data.date.hijri.date}</span>}
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={toggleTheme}
                className="p-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-lg transition-all shadow-sm flex items-center justify-center"
                aria-label="Toggle Theme"
            >
                {settings.theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button 
            onClick={onOpenSettings}
            className="p-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-lg transition-all shadow-sm flex items-center justify-center"
            aria-label="Settings"
            >
            <Settings size={24} />
            </button>
        </div>
      </header>

      {/* Vibrant Hero Card */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-emerald-900/10 dark:shadow-none relative overflow-hidden group">
        {/* Animated Background Pattern */}
        <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-700 ease-out">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor">
             <path d="M50 0 L100 50 L50 100 L0 50 Z" />
          </svg>
        </div>
        <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-50 border border-white/10">Next Prayer</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">{nextPrayer}</h3>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-emerald-50 bg-black/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
              <MapPin size={16} className="text-emerald-200" />
              <span className="font-medium">
                {loading ? "Locating..." : prayerData ? "Current Location" : "Location unavailable"}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right bg-white/10 md:bg-transparent p-4 md:p-0 rounded-2xl w-full md:w-auto backdrop-blur-sm md:backdrop-blur-none border border-white/10 md:border-none">
            <p className="text-emerald-100 font-medium mb-1 text-sm uppercase tracking-wide opacity-80">Time Remaining</p>
            <p className="text-3xl md:text-4xl font-mono font-bold tracking-tight text-white">{timeLeft}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Ayah */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-transparent opacity-50 rounded-bl-full"></div>
          <div className="flex justify-between items-center mb-6">
             <h4 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <Sun size={14} /> Daily Ayah
             </h4>
             <ArrowRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
          
          <p className="font-arabic text-2xl md:text-3xl text-right leading-[2] text-slate-800 dark:text-slate-200 mb-6 drop-shadow-sm" dir="rtl">
            فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
          </p>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
             <p className="text-slate-600 dark:text-slate-400 italic text-base md:text-lg leading-relaxed">"For indeed, with hardship [will be] ease."</p>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-4 text-right uppercase tracking-wide">Surah Ash-Sharh (94:5)</p>
        </div>

        {/* Daily Dua */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-transparent opacity-50 rounded-bl-full"></div>
           <div className="flex justify-between items-center mb-6">
             <h4 className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <Moon size={14} /> Daily Dua
             </h4>
             <ArrowRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>

          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-lg md:text-xl font-medium">
            "O Allah, I ask You for knowledge that is of benefit, a good provision, and deeds that will be accepted."
          </p>
          <div className="flex items-center justify-between mt-auto">
             <span className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-100 dark:border-purple-800">Lifestyle</span>
             <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wide">Ibn Majah</p>
          </div>
        </div>
      </div>
    </div>
  );
};