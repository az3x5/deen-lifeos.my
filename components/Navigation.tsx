import React from 'react';
import { ViewState } from '../types';
import { BookOpen, Calendar, Home, Heart, Scale, ScrollText, Bookmark, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const NavItem = ({
  active,
  onClick,
  icon: Icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full group relative overflow-hidden ${active
      ? 'text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 scale-[1.02]'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
      }`}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 z-0" />
    )}
    <div className="relative z-10 flex items-center gap-3">
      <Icon size={22} className={active ? 'stroke-[2.5px]' : 'stroke-2 group-hover:scale-110 transition-transform duration-300'} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </div>
  </button>
);

export const Sidebar: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const { user, profile } = useAuth();
  return (
    <div className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen sticky top-0 p-6 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex items-center gap-3 px-2 py-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-serif font-bold text-3xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50">
          N
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Nur</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase">Islamic Companion</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        <NavItem
          active={currentView === ViewState.DASHBOARD}
          onClick={() => setView(ViewState.DASHBOARD)}
          icon={Home}
          label="Dashboard"
        />
        <NavItem
          active={currentView === ViewState.QURAN}
          onClick={() => setView(ViewState.QURAN)}
          icon={BookOpen}
          label="Quran"
        />
        <NavItem
          active={currentView === ViewState.PRAYER}
          onClick={() => setView(ViewState.PRAYER)}
          icon={Calendar}
          label="Prayer Times"
        />
        <NavItem
          active={currentView === ViewState.DUA}
          onClick={() => setView(ViewState.DUA)}
          icon={Heart}
          label="Dua & Adhkar"
        />
        <NavItem
          active={currentView === ViewState.FIQH}
          onClick={() => setView(ViewState.FIQH)}
          icon={Scale}
          label="Fiqh Rulings"
        />
        <NavItem
          active={currentView === ViewState.HADITH}
          onClick={() => setView(ViewState.HADITH)}
          icon={ScrollText}
          label="Hadith Library"
        />
        <NavItem
          active={currentView === ViewState.BOOKMARKS}
          onClick={() => setView(ViewState.BOOKMARKS)}
          icon={Bookmark}
          label="Bookmarks"
        />
      </nav>

      <div className="mt-auto px-2 pb-4">
        <button
          onClick={() => setView(user ? ViewState.PROFILE : ViewState.LOGIN)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
          {user && profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <UserCircle size={22} className="stroke-2" />
          )}
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm">{user ? (profile?.full_name || 'My Profile') : 'Sign In'}</span>
            {user && <span className="text-[10px] opacity-70">View Account</span>}
          </div>
        </button>
      </div>

      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center font-medium">
        v1.5.0 • Made with <Heart size={10} className="inline text-rose-400 fill-rose-400 mx-0.5" /> for the Ummah
      </div>
    </div>
  );
};

export const MobileNav: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const MobileItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 relative ${isActive ? 'text-emerald-600 dark:text-emerald-400 -translate-y-1' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
      >
        {isActive && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-b-full shadow-[0_2px_8px_rgba(16,185,129,0.4)]" />
        )}
        <Icon
          size={24}
          className={`transition-all duration-300 ${isActive ? 'fill-emerald-100 dark:fill-emerald-900 stroke-[2.5px] drop-shadow-sm' : ''}`}
        />
        <span className={`text-[10px] font-medium mt-1 truncate max-w-full px-1 transition-all ${isActive ? 'font-bold' : ''}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 pb-safe z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] transition-colors">
      <div className="grid grid-cols-7 h-[72px] items-center px-1">
        <MobileItem view={ViewState.DASHBOARD} icon={Home} label="Home" />
        <MobileItem view={ViewState.QURAN} icon={BookOpen} label="Quran" />
        <MobileItem view={ViewState.PRAYER} icon={Calendar} label="Prayer" />
        <MobileItem view={ViewState.DUA} icon={Heart} label="Dua" />
        <MobileItem view={ViewState.FIQH} icon={Scale} label="Fiqh" />
        <MobileItem view={ViewState.HADITH} icon={ScrollText} label="Hadith" />
        <MobileItem view={ViewState.BOOKMARKS} icon={Bookmark} label="Saved" />
      </div>
    </div>
  );
};