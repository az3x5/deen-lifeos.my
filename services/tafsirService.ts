// Tafsir API Service - https://github.com/spa5k/tafsir_api
const TAFSIR_API_BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';

export interface TafsirEdition {
    name: string;
    author: string;
    language: string;
    direction: string;
    source: string;
    comments: string;
    id: string;
    slug: string;
}

export interface TafsirAyah {
    ayah: number;
    text: string;
}

export interface TafsirSurah {
    chapter: number;
    name: string;
    total_verses: number;
    verses: TafsirAyah[];
}

// Fetch all available tafsir editions
export const fetchTafsirEditions = async (): Promise<TafsirEdition[]> => {
    try {
        const response = await fetch(`${TAFSIR_API_BASE}/editions.json`);
        if (!response.ok) throw new Error('Failed to fetch tafsir editions');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tafsir editions:', error);
        return [];
    }
};

// Fetch tafsir for a specific surah using an edition
export const fetchTafsirBySurah = async (
    editionSlug: string,
    surahNumber: number
): Promise<TafsirSurah | null> => {
    try {
        const response = await fetch(
            `${TAFSIR_API_BASE}/${editionSlug}/${surahNumber}.json`
        );
        if (!response.ok) throw new Error('Failed to fetch tafsir');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tafsir:', error);
        return null;
    }
};

// Fetch tafsir for a specific ayah
export const fetchTafsirByAyah = async (
    editionSlug: string,
    surahNumber: number,
    ayahNumber: number
): Promise<{ ayah: number; text: string } | null> => {
    try {
        const response = await fetch(
            `${TAFSIR_API_BASE}/${editionSlug}/${surahNumber}/${ayahNumber}.json`
        );
        if (!response.ok) throw new Error('Failed to fetch ayah tafsir');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching ayah tafsir:', error);
        return null;
    }
};
