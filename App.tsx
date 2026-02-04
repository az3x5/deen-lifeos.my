import React, { useState, useEffect } from 'react';
import { ViewState, PrayerTimingResponse } from './types';
import { Sidebar, MobileNav } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { QuranView } from './components/QuranView';
import { PrayerTimesView } from './components/PrayerTimesView';
import { DuaView } from './components/DuaView';
import { FiqhView } from './components/FiqhView';
import { HadithView } from './components/HadithView';
import { BookmarksView } from './components/BookmarksView';
import { fetchPrayerTimes } from './services/dataService';
import { SettingsProvider } from './contexts/SettingsContext';
import { SettingsModal } from './components/SettingsModal';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTimingResponse | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // 1. Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });

          // 2. Fetch Prayer Times
          const data = await fetchPrayerTimes(lat, lng);
          setPrayerData(data);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Makkah
          const fallbackLat = 21.4225;
          const fallbackLng = 39.8262;
          setLocation({ lat: fallbackLat, lng: fallbackLng });
          fetchPrayerTimes(fallbackLat, fallbackLng).then(setPrayerData);
          setLoadingLocation(false);
        }
      );
    } else {
      setLoadingLocation(false);
    }
  }, []);

  const handleLocationChange = async (lat: number, lng: number) => {
    setLocation({ lat, lng });
    const data = await fetchPrayerTimes(lat, lng);
    setPrayerData(data);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard prayerData={prayerData} loading={loadingLocation} onOpenSettings={() => setShowSettings(true)} />;
      case ViewState.QURAN:
        return <QuranView />;
      case ViewState.PRAYER:
        return <PrayerTimesView prayerData={prayerData} location={location} onLocationChange={handleLocationChange} />;
      case ViewState.DUA:
        return <DuaView />;
      case ViewState.FIQH:
        return <FiqhView />;
      case ViewState.HADITH:
        return <HadithView />;
      case ViewState.BOOKMARKS:
        return <BookmarksView />;
      case ViewState.LOGIN:
        return <LoginPage onNavigate={(view) => setCurrentView(view === 'SIGNUP' ? ViewState.SIGNUP : ViewState.DASHBOARD)} />;
      case ViewState.SIGNUP:
        return <SignupPage onNavigate={() => setCurrentView(ViewState.LOGIN)} />;
      case ViewState.PROFILE:
        return <ProfileView />;
      default:
        return <Dashboard prayerData={prayerData} loading={loadingLocation} onOpenSettings={() => setShowSettings(true)} />;
    }
  };

  return (
    <AuthProvider>
      <SettingsProvider>
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-300 selection:text-emerald-900 transition-colors duration-300">
          <Sidebar currentView={currentView} setView={setCurrentView} />

          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Adjusted padding: pb-28 for mobile/tablet to clear bottom nav, pb-8 for desktop */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 pb-28 lg:pb-10 scroll-smooth">
              <div className="max-w-6xl mx-auto w-full">
                {renderContent()}
              </div>
            </div>
          </main>

          <MobileNav currentView={currentView} setView={setCurrentView} />

          {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </div>
      </SettingsProvider>
    </AuthProvider>
  );
}