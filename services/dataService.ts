import { PrayerTimingResponse, Surah, Ayah, Dua, FiqhArticle, Hadith, HadithCollection, HadithBook } from '../types';
import { getQuranAccessToken } from './quranAuth';

const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';
const QURAN_API_BASE = 'https://api.quran.com/api/v4';

const getHeaders = async () => {
  const token = await getQuranAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchPrayerTimes = async (lat: number, lng: number): Promise<PrayerTimingResponse | null> => {
  try {
    const date = new Date();
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

export const searchCity = async (query: string): Promise<{ lat: number, lng: number, displayName: string } | null> => {
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
    const headers = await getHeaders();
    const response = await fetch(`${QURAN_API_BASE}/chapters`, { headers });
    if (!response.ok) throw new Error('Failed to fetch surah list');
    const data = await response.json();

    // Map Quran.com structure to our Surah interface
    return data.chapters.map((ch: any) => ({
      number: ch.id,
      name: ch.name_arabic,
      englishName: ch.name_simple,
      englishNameTranslation: ch.translated_name.name,
      numberOfAyahs: ch.verses_count,
      revelationType: ch.revelation_place
    }));
  } catch (error) {
    console.error("Using fallback public API due to error:", error);
    // Fallback to old API if Auth fails (graceful degradation)
    try {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await response.json();
      return data.data;
    } catch (e) { return []; }
  }
};

export const fetchSurahDetails = async (surahNumber: number): Promise<{ arabic: Ayah[], english: Ayah[], transliteration: Ayah[], tafsir: Ayah[] } | null> => {
  try {
    const headers = await getHeaders();

    // Fetch Verses with Uthmani Script, Translation (131 = The Clear Quran by Mustafa Khattab), and Transliteration
    // Note: Pagination needs handling for large surahs, ideally implemented in UI, but fetching all for simple usage
    // Quran.com limits 'per_page' to ~50. We might need to loop. 
    // For simplicity in this demo, we fetch a large page size or loop. 
    // Actually, let's fetch strictly what we need.

    // Fetch Arabic (Uthmani)
    const arabicRes = await fetch(`${QURAN_API_BASE}/quran/verses/uthmani?chapter_number=${surahNumber}`, { headers });
    const arabicData = await arabicRes.json();

    // Fetch Translations (Example: 131 is Clear Quran)
    const engRes = await fetch(`${QURAN_API_BASE}/quran/translations/131?chapter_number=${surahNumber}`, { headers });
    const engData = await engRes.json();

    // Fetch transliteration... Quran.com usually has a resource for this or includes it in verse fields.
    // Using an alternative endpoint for fetching 'fields' might be better. 
    // Let's use the /verses/by_chapter endpoint which is more powerful.

    const response = await fetch(`${QURAN_API_BASE}/verses/by_chapter/${surahNumber}?per_page=300&fields=text_uthmani&translations=131&mushaf=2`, { headers });
    // Note: per_page=300 might not cover Baqarah (286 ayahs), wait Baqarah is 286, so 300 covers it!

    if (!response.ok) throw new Error("Failed");
    const data = await response.json();

    // Need transliteration? Quran.com API v4 might separate it. 
    // Let's map what we have.

    const mappedArabic: Ayah[] = data.verses.map((v: any) => ({
      number: v.id, // Absolute ID
      text: v.text_uthmani,
      numberInSurah: v.verse_number,
      juz: v.juz_number,
      page: v.page_number,
      manzil: 0, // Not always provided
      ruku: 0,
      // const headers = await getHeaders(); // Not used in this new logic

      // 1. Fetch Arabic (AlQuran.cloud)
      // 2. Fetch English (AlQuran.cloud)
      // 3. Fetch Transliteration (AlQuran.cloud)
      const results = await Promise.allSettled([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`), // Example English translation
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`),
      ]);

      const arabicResult = results[0];
      if(arabicResult.status === 'rejected' || !arabicResult.value.ok) throw new Error("Fallback failed for Arabic");
    const arabicData = await arabicResult.value.json();

    let englishData = { data: { ayahs: [] } };
    const englishResult = results[1];
    if (englishResult.status === 'fulfilled' && englishResult.value.ok) {
      try {
        englishData = await englishResult.value.json();
      } catch (e) { console.warn("Error parsing English data", e); }
    }

    let transData = { data: { ayahs: [] } };
    const transResult = results[2];
    if (transResult.status === 'fulfilled' && transResult.value.ok) {
      try {
        transData = await transResult.value.json();
      } catch (e) { console.warn("Error parsing transliteration data", e); }
    }

    // 4. Fetch Dhivehi Translation (fawazahmed0 API)
    let dhivehiMap = new Map<number, string>();
    try {
      const dhivehiRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/div-officeofthepres/${surahNumber}.json`);
      if (dhivehiRes.ok) {
        const dhivehiJson = await dhivehiRes.json();
        dhivehiJson.chapter.forEach((ayah: any) => {
          dhivehiMap.set(ayah.verse, ayah.text);
        });
      }
    } catch (e) {
      console.warn("Dhivehi fetch failed", e);
    }

    // 5. Fetch Tafsir (English) - Placeholder or specific source
    // Since reliable English JSON is hard to find, we will skip or use a static source if available.
    let mappedTafsir: Ayah[] = [];

    // Mapping
    const mappedArabic: Ayah[] = arabicData.data.ayahs.map((v: any) => ({
      number: v.number,
      text: v.text,
      numberInSurah: v.numberInSurah,
      juz: v.juz,
      page: v.page,
      manzil: v.manzil,
      ruku: v.ruku,
      hizbQuarter: v.hizbQuarter,
      sajda: v.sajda,
      // Inject Dhivehi translation into the 'translation' field if we want it as primary, 
      // OR we can add a new field. For now, let's append it or use it as the main translation 
      // if the user prefers. Let's return it in a separate property via 'english' array but specifically marked?
      // Actually, let's put it in the 'english' array but maybe we need a new 'dhivehi' array in the return type?
      // The component expects 'english', 'arabic', 'transliteration'. 
      // Let's repurpose 'english' or add 'dhivehi'.
    }));

    // We will return Dhivehi as the "Translation" (english array) for now, 
    // or we should update the return type. 
    // To support BOTH english and dhivehi, we need to update the interface.
    // For now, I will Replace the "English" translation with Dhivehi as per user context (Maldivian app).

    const mappedDhivehi: Ayah[] = arabicData.data.ayahs.map((v: any) => ({
      number: v.number,
      text: dhivehiMap.get(v.numberInSurah) || '',
      numberInSurah: v.numberInSurah,
      juz: v.juz,
      page: v.page,
      manzil: v.manzil,
      ruku: v.ruku,
      hizbQuarter: v.hizbQuarter,
      sajda: v.sajda
    }));

    return {
      arabic: mappedArabic,
      english: mappedDhivehi, // Returning Dhivehi here
      transliteration: transData.data?.ayahs || [],
      tafsir: mappedTafsir
    };

  } catch (error) {
    console.error("Critical error fetching surah details via Quran.com", error);
    // Fallback to AlQuran.cloud (old method) if new one fails
    return await fallbackFetchSurahDetails(surahNumber);
  }
};

// ... keep existing fallback logic or the old function renamed ...
const fallbackFetchSurahDetails = async (surahNumber: number) => {
  // Re-implementation of the old logic for fallback
  try {
    const results = await Promise.allSettled([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`),
    ]);

    const arabicResult = results[0];
    if (arabicResult.status === 'rejected' || !arabicResult.value.ok) throw new Error("Fallback failed");

    const arabicData = await arabicResult.value.json();

    let englishData = { data: { ayahs: [] } };
    const englishResult = results[1];
    if (englishResult.status === 'fulfilled' && englishResult.value.ok) englishData = await englishResult.value.json();

    let transData = { data: { ayahs: [] } };
    const transResult = results[2];
    if (transResult.status === 'fulfilled' && transResult.value.ok) transData = await transResult.value.json();

    return {
      arabic: arabicData.data.ayahs,
      english: englishData.data?.ayahs || [],
      transliteration: transData.data?.ayahs || [],
      tafsir: []
    };
  } catch (e) {
    return null;
  }
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