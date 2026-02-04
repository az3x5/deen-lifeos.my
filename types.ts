export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  translation?: string;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface PrayerTimingResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      hijri: {
        date: string;
        month: {
          en: string;
          ar: string;
        };
        weekday: {
          en: string;
          ar: string;
        };
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      method: {
        name: string;
      };
    };
  };
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  QURAN = 'QURAN',
  PRAYER = 'PRAYER',
  DUA = 'DUA',
  FIQH = 'FIQH',
  HADITH = 'HADITH',
  BOOKMARKS = 'BOOKMARKS',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  PROFILE = 'PROFILE',
}

export interface Dua {
  id: string;
  category: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  audio?: string;
}

export interface FiqhArticle {
  id: string;
  category: 'Purification' | 'Prayer' | 'Fasting' | 'Charity' | 'Hajj' | 'General';
  title: string;
  summary: string;
  content: string;
}

export interface HadithCollection {
  id: string;
  name: string;
  arabicName?: string;
  description: string;
  totalHadiths: number;
}

export interface HadithBook {
  id: string;
  collectionId: string;
  number: number;
  name: string;
  arabicName?: string;
  hadithCount: number;
}

export interface Hadith {
  id: string;
  collectionId: string;
  bookId: string;
  narrator: string;
  arabic: string;
  translation: string;
  reference: string; // e.g., Book 1, Hadith 1
  grade?: string;
  chapterTitle?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}