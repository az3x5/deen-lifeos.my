import { PrayerTimingResponse, Surah, Ayah, Dua, FiqhArticle, Hadith, HadithCollection, HadithBook } from '../types';

const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

export const fetchPrayerTimes = async (lat: number, lng: number): Promise<PrayerTimingResponse | null> => {
  try {
    const date = new Date();
    // method 3 is Muslim World League
    const response = await fetch(
      `${ALADHAN_API_BASE}/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=3`
    );
    if (!response.ok) throw new Error('Failed to fetch prayer times');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchPrayerCalendar = async (lat: number, lng: number, month: number, year: number): Promise<PrayerTimingResponse['data'][]> => {
  try {
    const response = await fetch(
      `${ALADHAN_API_BASE}/calendar?latitude=${lat}&longitude=${lng}&method=3&month=${month}&year=${year}`
    );
    if (!response.ok) throw new Error('Failed to fetch prayer calendar');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const searchCity = async (query: string): Promise<{lat: number, lng: number, displayName: string} | null> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error", error);
    return null;
  }
};

export const fetchSurahList = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${QURAN_API_BASE}/surah`);
    if (!response.ok) throw new Error('Failed to fetch surah list');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchSurahDetails = async (surahNumber: number): Promise<{ arabic: Ayah[], english: Ayah[], transliteration: Ayah[], tafsir: Ayah[] } | null> => {
  try {
    // Use Promise.allSettled to allow partial failures (e.g. translation down but arabic works)
    const results = await Promise.allSettled([
        fetch(`${QURAN_API_BASE}/surah/${surahNumber}`), // 0: Arabic
        fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.asad`), // 1: Translation
        fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.transliteration`), // 2: Transliteration
    ]);

    // 1. Process Arabic (Critical)
    const arabicResult = results[0];
    if (arabicResult.status === 'rejected' || !arabicResult.value.ok) {
        throw new Error("Failed to fetch Arabic Quran text");
    }
    const arabicData = await arabicResult.value.json();

    // 2. Process English (Optional)
    let englishData = { data: { ayahs: [] } };
    const englishResult = results[1];
    if (englishResult.status === 'fulfilled' && englishResult.value.ok) {
        try {
            englishData = await englishResult.value.json();
        } catch (e) { console.warn("Error parsing english data", e); }
    }

    // 3. Process Transliteration (Optional)
    let transData = { data: { ayahs: [] } };
    const transResult = results[2];
    if (transResult.status === 'fulfilled' && transResult.value.ok) {
        try {
            transData = await transResult.value.json();
        } catch (e) { console.warn("Error parsing transliteration data", e); }
    }

    // 4. Process Tafsir (Separate fetch, optional)
    let tafsirData = { data: { ayahs: [] } };
    try {
        const tafsirRes = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.ibnkathir`);
        if (tafsirRes.ok) {
            tafsirData = await tafsirRes.json();
        }
    } catch (e) {
        console.warn("Tafsir fetch failed, proceeding without it.", e);
    }

    return {
      arabic: arabicData.data.ayahs,
      english: englishData.data?.ayahs || [],
      transliteration: transData.data?.ayahs || [],
      tafsir: tafsirData.data?.ayahs || []
    };
  } catch (error) {
    console.error("Critical error fetching surah details", error);
    return null;
  }
};

export const getQiblaDirection = (lat: number, lng: number): number => {
  const PI = Math.PI;
  const latRad = lat * (PI / 180);
  const lngRad = lng * (PI / 180);
  const kaabaLat = 21.422487 * (PI / 180);
  const kaabaLng = 39.826206 * (PI / 180);

  const y = Math.sin(kaabaLng - lngRad);
  const x = Math.cos(latRad) * Math.tan(kaabaLat) - Math.sin(latRad) * Math.cos(kaabaLng - lngRad);
  let qibla = Math.atan2(y, x) * (180 / PI);

  return (qibla + 360) % 360;
};

// --- Mock Data for Dua, Fiqh, Hadith ---

export const getDuas = (): Dua[] => [
  {
    id: '1',
    category: 'Daily',
    title: 'Waking Up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilaihin-nushur",
    translation: 'All praise is due to Allah who brought us to life after having caused us to die and unto Him is the resurrection.',
    reference: 'Bukhari',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3' // Placeholder audio
  },
  {
    id: '2',
    category: 'Daily',
    title: 'Before Sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your Name, O Allah, I die and I live.',
    reference: 'Muslim',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
  },
  {
    id: '3',
    category: 'Travel',
    title: 'Starting a Journey',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: 'Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrinin. Wa inna ila Rabbina lamunqalibun',
    translation: 'Glory unto Him Who created this for us though we were unable to create it ourselves. And unto our Lord we shall return.',
    reference: 'Surah Az-Zukhruf 43:13-14',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
  },
  {
    id: '4',
    category: 'Prayer',
    title: 'Entering the Mosque',
    arabic: 'اللّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahummaf-tah li abwaba rahmatik',
    translation: 'O Allah, open the gates of Your mercy for me.',
    reference: 'Muslim',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
  },
  {
    id: '5',
    category: 'Lifestyle',
    title: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    reference: 'Bukhari',
    audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
  }
];

export const getFiqhArticles = (): FiqhArticle[] => [
  {
    id: '1',
    category: 'Purification',
    title: 'How to Perform Wudu (Ablution)',
    summary: 'A step-by-step guide to ritual purification before prayer.',
    content: '1. Intention (Niyyah). 2. Say Bismillah. 3. Wash hands three times. 4. Rinse mouth and nose. 5. Wash face. 6. Wash arms up to elbows. 7. Wipe head and ears. 8. Wash feet up to ankles.'
  },
  {
    id: '2',
    category: 'Prayer',
    title: 'Conditions of Salah',
    summary: 'Prerequisites that must be met for the prayer to be valid.',
    content: 'The conditions are: 1. Purification (Wudu). 2. Covering the Awrah. 3. Facing the Qibla. 4. Entry of Prayer Time. 5. Intention.'
  },
  {
    id: '3',
    category: 'Fasting',
    title: 'Things that Invalidate the Fast',
    summary: 'Actions that break the fast during Ramadan.',
    content: 'Intentional eating or drinking, sexual intercourse, intentional vomiting. Forgetfully eating or drinking does not break the fast.'
  },
  {
    id: '4',
    category: 'Charity',
    title: 'Zakat Eligibility',
    summary: 'Who is eligible to receive Zakat?',
    content: 'Zakat can be given to: The poor, the needy, Zakat collectors, new Muslims, to free captives, debtors, in the cause of Allah, and the traveler.'
  }
];

// --- Hadith Data ---

export const getHadithCollections = (): HadithCollection[] => [
  {
    id: 'bukhari',
    name: 'Sahih al-Bukhari',
    arabicName: 'صحيح البخاري',
    description: 'One of the most authentic collections of the Sunnah.',
    totalHadiths: 7563
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    description: 'Considered the second most authentic book after the Quran.',
    totalHadiths: 7500
  },
  {
    id: 'nawawi',
    name: '40 Hadith Nawawi',
    arabicName: 'الأربعون النووية',
    description: 'A compilation of forty hadiths by Imam al-Nawawi.',
    totalHadiths: 42
  },
  {
    id: 'tirmidhi',
    name: 'Jami` at-Tirmidhi',
    arabicName: 'جامع الترمذي',
    description: 'Contains Hadiths on legal rulings and etiquette.',
    totalHadiths: 3956
  },
  {
    id: 'abudawud',
    name: 'Sunan Abi Dawud',
    arabicName: 'سنن أبي داود',
    description: 'Focuses on legal rulings (Ahkam).',
    totalHadiths: 5274
  }
];

export const getHadithBooks = (collectionId: string): HadithBook[] => {
  const books: Record<string, HadithBook[]> = {
    'bukhari': [
      { id: 'bukhari-1', collectionId: 'bukhari', number: 1, name: 'Revelation', arabicName: 'كتاب بدء الوحي', hadithCount: 7 },
      { id: 'bukhari-2', collectionId: 'bukhari', number: 2, name: 'Belief', arabicName: 'كتاب الإيمان', hadithCount: 57 },
      { id: 'bukhari-3', collectionId: 'bukhari', number: 3, name: 'Knowledge', arabicName: 'كتاب العلم', hadithCount: 134 }
    ],
    'muslim': [
       { id: 'muslim-1', collectionId: 'muslim', number: 1, name: 'The Book of Faith', arabicName: 'كتاب الإيمان', hadithCount: 441 },
       { id: 'muslim-2', collectionId: 'muslim', number: 2, name: 'The Book of Purification', arabicName: 'كتاب الطهارة', hadithCount: 145 }
    ],
    'nawawi': [
       { id: 'nawawi-1', collectionId: 'nawawi', number: 1, name: '40 Hadith', arabicName: 'الأحاديث', hadithCount: 42 }
    ]
  };
  return books[collectionId] || [];
};

export const getHadiths = (bookId?: string): Hadith[] => {
  const allHadiths: Hadith[] = [
    {
      id: '1',
      collectionId: 'bukhari',
      bookId: 'bukhari-1',
      narrator: "'Umar bin Al-Khattab",
      arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      translation: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.",
      reference: 'Sahih al-Bukhari 1',
      grade: 'Sahih',
      chapterTitle: 'How the Divine Revelation started'
    },
    {
      id: '2',
      collectionId: 'bukhari',
      bookId: 'bukhari-1',
      narrator: "Aisha",
      arabic: "أَوَّلُ مَا بُدِئَ بِهِ رَسُولُ اللَّهِ صلى الله عليه وسلم مِنَ الْوَحْيِ الرُّؤْيَا الصَّالِحَةُ فِي النَّوْمِ",
      translation: "The commencement of the Divine Inspiration to Allah's Messenger (ﷺ) was in the form of good dreams which came true like bright daylight.",
      reference: 'Sahih al-Bukhari 3',
      grade: 'Sahih',
      chapterTitle: 'How the Divine Revelation started'
    },
    {
      id: '3',
      collectionId: 'bukhari',
      bookId: 'bukhari-2',
      narrator: "Abu Huraira",
      arabic: "الإِيمَانُ بِضْعٌ وَسِتُّونَ شُعْبَةً، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ",
      translation: "Faith (Belief) consists of more than sixty branches (i.e. parts). And Haya (This term 'Haya' covers a large number of concepts which are to be taken together; amongst them are self respect, modesty, bashfulness, and scruple, etc.) is a part of faith.",
      reference: 'Sahih al-Bukhari 9',
      grade: 'Sahih',
      chapterTitle: 'Faith'
    },
    {
      id: '4',
      collectionId: 'nawawi',
      bookId: 'nawawi-1',
      narrator: "'Umar bin Al-Khattab",
      arabic: "قَالَ: فَأَخْبِرْنِي عَنِ الْإِيمَانِ. قَالَ: أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلَائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الْآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ",
      translation: "He (the angel Gabriel) said: Tell me about faith (Iman). He (the Prophet) answered: It is that you believe in Allah and His angels and His Books and His Messengers and in the Last Day, and in fate (Qadar), both in its good and in its evil aspects.",
      reference: '40 Hadith Nawawi 2',
      grade: 'Sahih'
    },
    {
      id: '5',
      collectionId: 'muslim',
      bookId: 'muslim-1',
      narrator: "Abu Huraira",
      arabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
      translation: "He who relieves the hardship of a believer in this world, Allah will relieve his hardship on the Day of Judgment.",
      reference: 'Sahih Muslim 2699',
      grade: 'Sahih'
    }
  ];

  if (bookId) {
    return allHadiths.filter(h => h.bookId === bookId);
  }
  return allHadiths;
};