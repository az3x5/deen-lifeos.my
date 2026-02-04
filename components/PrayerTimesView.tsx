import React, { useEffect, useState } from 'react';
import { PrayerTimingResponse } from '../types';
import { getQiblaDirection, searchCity, fetchPrayerCalendar } from '../services/dataService';
import { Clock, Navigation, MapPin, Search, Sun, Sunset, Sunrise, Moon, CloudSun, Star, SunDim, Calendar } from 'lucide-react';

interface PrayerProps {
  prayerData: PrayerTimingResponse | null;
  location: { lat: number; lng: number } | null;
  onLocationChange?: (lat: number, lng: number) => void;
}

export const PrayerTimesView: React.FC<PrayerProps> = ({ prayerData, location, onLocationChange }) => {
  const [qibla, setQibla] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<PrayerTimingResponse['data'][]>([]);

  useEffect(() => {
    if (location) {
      setQibla(getQiblaDirection(location.lat, location.lng));
      // Fetch weekly calendar
      const now = new Date();
      fetchPrayerCalendar(location.lat, location.lng, now.getMonth() + 1, now.getFullYear())
        .then(data => {
            // Filter for next 7 days starting today
            const today = now.getDate();
            const weekData = data.filter(d => {
                const day = parseInt(d.date.readable.split(' ')[0]);
                return day >= today && day < today + 7;
            }).slice(0, 7);
            setWeeklySchedule(weekData);
        });
    }
  }, [location]);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      const result = await searchCity(searchQuery);
      setIsSearching(false);
      
      if (result && onLocationChange) {
          onLocationChange(result.lat, result.lng);
          setSearchQuery(''); // Clear search on success
      } else {
          alert("City not found. Please try again.");
      }
  };

  const calculateDuha = (sunriseTime: string) => {
    try {
        const cleanTime = sunriseTime.split(' ')[0];
        const [hours, minutes] = cleanTime.split(':').map(Number);
        
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes + 20); 
        
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
        return '';
    }
  };

  const prayers = prayerData ? [
    { name: 'Fajr', time: prayerData.data.timings.Fajr, icon: CloudSun, color: 'text-emerald-500' },
    { name: 'Sunrise', time: prayerData.data.timings.Sunrise, icon: Sunrise, color: 'text-orange-500' },
    { name: 'Duha', time: calculateDuha(prayerData.data.timings.Sunrise), icon: Sun, color: 'text-amber-500' },
    { name: 'Dhuhr', time: prayerData.data.timings.Dhuhr, icon: Sun, color: 'text-amber-600' },
    { name: 'Asr', time: prayerData.data.timings.Asr, icon: SunDim, color: 'text-orange-500' },
    { name: 'Maghrib', time: prayerData.data.timings.Maghrib, icon: Sunset, color: 'text-purple-500' },
    { name: 'Isha', time: prayerData.data.timings.Isha, icon: Moon, color: 'text-indigo-500' },
    { name: 'Tahajjud', time: prayerData.data.timings.Lastthird, icon: Star, color: 'text-slate-600 dark:text-slate-400' },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in pb-20 lg:pb-0">
      
      {/* Location Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow">
        <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search city (e.g. London, Makkah)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base transition-all focus:bg-white dark:focus:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                />
            </div>
            <button 
                type="submit" 
                disabled={isSearching}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
            >
                {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                <span className="hidden md:inline">Find</span>
            </button>
        </form>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Times Column */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="text-emerald-600 dark:text-emerald-400" /> Today's Prayer Times
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {!prayerData ? (
               <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm md:text-base">Loading prayer times...</div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {prayers.map((p, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${p.color} group-hover:scale-110 transition-transform`}>
                            <p.icon size={20} />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm md:text-base">{p.name}</span>
                    </div>
                    <span className="font-mono text-slate-600 dark:text-slate-300 text-sm md:text-base font-medium bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all">{p.time.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Qibla Column */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Navigation className="text-emerald-600 dark:text-emerald-400" /> Qibla Direction
          </h2>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] h-full hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-800/50 opacity-50 pointer-events-none" />
            <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 bg-white dark:bg-slate-800 shadow-inner">
              {/* Compass Rose markings */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">N</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">S</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">W</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">E</div>

              {/* Indicator Arrow */}
              <div 
                className="w-2 h-20 md:h-28 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-full origin-bottom absolute bottom-1/2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 transition-transform duration-1000 ease-out z-10"
                style={{ transform: `rotate(${qibla}deg)` }}
              >
                <div className="w-4 h-4 bg-emerald-600 rounded-full absolute -top-1.5 -left-[4px] ring-2 ring-white dark:ring-slate-900 shadow-md"></div>
              </div>
              
              {/* Center Dot */}
              <div className="w-4 h-4 bg-slate-800 dark:bg-slate-200 rounded-full z-10 ring-4 ring-white dark:ring-slate-700 shadow-md"></div>
            </div>

            <div className="text-center relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1">{Math.round(qibla)}°</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">from North towards Makkah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Timetable */}
      <div className="space-y-4">
         <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="text-emerald-600 dark:text-emerald-400" /> Weekly Schedule
         </h2>
         
         {/* Mobile & Tablet Card View (Visible up to lg breakpoint) */}
         <div className="lg:hidden space-y-4">
             {weeklySchedule.length > 0 ? weeklySchedule.map((day, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                     <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">
                        <div>
                             <span className="font-bold text-slate-800 dark:text-slate-100 block text-lg">{day.date.readable.split(' ').slice(0, 2).join(' ')}</span>
                             <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{day.date.hijri.weekday.en}</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Fajr</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-sm">{day.timings.Fajr.split(' ')[0]}</span>
                         </div>
                         <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center border border-orange-100 dark:border-orange-900/30">
                            <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-500 block mb-1">Sunrise</span>
                            <span className="font-mono text-orange-800 dark:text-orange-400 font-bold text-sm">{day.timings.Sunrise.split(' ')[0]}</span>
                         </div>
                         <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center border border-amber-100 dark:border-amber-900/30">
                            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 block mb-1">Duha</span>
                            <span className="font-mono text-amber-800 dark:text-amber-400 font-bold text-sm">{calculateDuha(day.timings.Sunrise)}</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Dhuhr</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-sm">{day.timings.Dhuhr.split(' ')[0]}</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Asr</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-sm">{day.timings.Asr.split(' ')[0]}</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Maghrib</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-sm">{day.timings.Maghrib.split(' ')[0]}</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Isha</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-sm">{day.timings.Isha.split(' ')[0]}</span>
                         </div>
                         <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-900/30">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Tahajjud</span>
                            <span className="font-mono text-indigo-800 dark:text-indigo-300 font-bold text-sm">{day.timings.Lastthird.split(' ')[0]}</span>
                         </div>
                     </div>
                 </div>
             )) : (
                 <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl">Loading weekly schedule...</div>
             )}
         </div>

         {/* Desktop Table View (Visible from lg breakpoint) */}
         <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm overflow-x-auto">
             <table className="w-full min-w-[700px] text-sm md:text-base">
                 <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                     <tr>
                         <th className="px-5 py-4 text-left font-bold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Date</th>
                         <th className="px-5 py-4 text-left font-bold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Fajr</th>
                         <th className="px-5 py-4 text-left font-bold text-orange-600 dark:text-orange-500 uppercase text-xs tracking-wider">Sunrise</th>
                         <th className="px-5 py-4 text-left font-bold text-amber-600 dark:text-amber-500 uppercase text-xs tracking-wider">Duha</th>
                         <th className="px-5 py-4 text-left font-bold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Dhuhr</th>
                         <th className="px-5 py-4 text-left font-bold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Asr</th>
                         <th className="px-5 py-4 text-left font-bold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Maghrib</th>
                         <th className="px-5 py-4 text-left font-bold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Isha</th>
                         <th className="px-5 py-4 text-left font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs tracking-wider">Tahajjud</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {weeklySchedule.length > 0 ? weeklySchedule.map((day, i) => (
                         <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                             <td className="px-5 py-4 text-slate-800 dark:text-slate-200 font-medium">
                                 {day.date.readable.split(' ').slice(0, 2).join(' ')}
                                 <span className="block text-xs text-slate-400 dark:text-slate-500 font-normal">{day.date.hijri.weekday.en}</span>
                             </td>
                             <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono">{day.timings.Fajr.split(' ')[0]}</td>
                             <td className="px-5 py-4 text-orange-600 dark:text-orange-500 font-mono font-medium">{day.timings.Sunrise.split(' ')[0]}</td>
                             <td className="px-5 py-4 text-amber-600 dark:text-amber-500 font-mono font-medium">{calculateDuha(day.timings.Sunrise)}</td>
                             <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono">{day.timings.Dhuhr.split(' ')[0]}</td>
                             <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono">{day.timings.Asr.split(' ')[0]}</td>
                             <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono">{day.timings.Maghrib.split(' ')[0]}</td>
                             <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono">{day.timings.Isha.split(' ')[0]}</td>
                             <td className="px-5 py-4 text-indigo-600 dark:text-indigo-400 font-mono font-medium">{day.timings.Lastthird.split(' ')[0]}</td>
                         </tr>
                     )) : (
                         <tr>
                             <td colSpan={9} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">Loading weekly schedule...</td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};