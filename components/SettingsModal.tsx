import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { X, Type, Languages, Eye } from 'lucide-react';

export const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Type size={20} className="text-emerald-600 dark:text-emerald-400" /> Appearance Settings
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto grow">
          {/* Font Type */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quran Font Style</label>
            <div className="grid grid-cols-3 gap-2">
              {['Amiri', 'Scheherazade New', 'Lateef'].map(font => (
                <button
                  key={font}
                  onClick={() => updateSettings({ fontFamily: font })}
                  className={`p-3 rounded-xl border text-center transition-all ${settings.fontFamily === font
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                    }`}
                >
                  <span className="text-xl" style={{ fontFamily: font }}>بِسْمِ</span>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-500">{font.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Arabic Font Size</label>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">{settings.arabicFontSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              step="2"
              value={settings.arabicFontSize}
              onChange={(e) => updateSettings({ arabicFontSize: Number(e.target.value) })}
              className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-right text-slate-800 dark:text-slate-200" style={{ fontSize: `${settings.arabicFontSize}px`, fontFamily: settings.fontFamily }}>
              ٱللَّهُ نُورُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ
            </p>
          </div>

          {/* Translation Font Size */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Translation Size</label>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">{settings.translationFontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={settings.translationFontSize}
              onChange={(e) => updateSettings({ translationFontSize: Number(e.target.value) })}
              className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-slate-600 dark:text-slate-400" style={{ fontSize: `${settings.translationFontSize}px` }}>
              Allah is the Light of the heavens and the earth.
            </p>
          </div>

          {/* Reciter Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Audio Reciter</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
                { id: 'ar.abdulbasit', name: 'Abdul Basit' },
                { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
                { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly' },
                { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi' }
              ].map(reciter => (
                <button
                  key={reciter.id}
                  onClick={() => updateSettings({ reciterId: reciter.id })}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${settings.reciterId === reciter.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                    }`}
                >
                  <span className="font-medium text-sm">{reciter.name}</span>
                  {settings.reciterId === reciter.id && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Content Visibility</label>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Languages size={20} className="text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Translation</span>
              </div>
              <button
                onClick={() => updateSettings({ showTranslation: !settings.showTranslation })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.showTranslation ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings.showTranslation ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Transliteration</span>
              </div>
              <button
                onClick={() => updateSettings({ showTransliteration: !settings.showTransliteration })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.showTransliteration ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings.showTransliteration ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button onClick={onClose} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};