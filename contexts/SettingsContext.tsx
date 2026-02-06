import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface AppSettings {
  arabicFontSize: number;
  translationFontSize: number;
  fontFamily: string;
  showTranslation: boolean;
  showTransliteration: boolean;
  theme: 'light' | 'dark';
  reciterId: string;
}

const defaultSettings: AppSettings = {
  arabicFontSize: 32,
  translationFontSize: 16,
  fontFamily: 'Amiri',
  showTranslation: true,
  showTransliteration: false,
  theme: 'light',
  reciterId: 'ar.alafasy',
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children?: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Try to load from local storage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nur_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    // Save to local storage whenever settings change
    localStorage.setItem('nur_settings', JSON.stringify(settings));

    // Apply theme class to document
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};