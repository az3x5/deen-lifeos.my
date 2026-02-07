// Tafsir Service - Fetches from Supabase Database
import { supabase } from '../lib/supabase';

export interface TafsirEdition {
    id: number;
    slug: string;
    name: string;
    author: string;
    language: string;
    direction: string;
    source: string;
    comments: string;
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

// Fetch all available tafsir editions from Supabase
export const fetchTafsirEditions = async (): Promise<TafsirEdition[]> => {
    try {
        const { data, error } = await supabase
            .from('tafsir_editions')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching tafsir editions:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching tafsir editions:', error);
        return [];
    }
};

// Fetch tafsir for a specific surah using an edition from Supabase
export const fetchTafsirBySurah = async (
    editionSlug: string,
    surahNumber: number
): Promise<TafsirSurah | null> => {
    try {
        const { data, error } = await supabase
            .from('tafsir_ayahs')
            .select('ayah_number, text')
            .eq('edition_slug', editionSlug)
            .eq('surah_number', surahNumber)
            .order('ayah_number');

        if (error) {
            console.error('Error fetching tafsir:', error);
            return null;
        }

        if (!data || data.length === 0) {
            return null;
        }

        // Transform to expected format
        return {
            chapter: surahNumber,
            name: '', // We don't store surah name in tafsir table
            total_verses: data.length,
            verses: data.map(row => ({
                ayah: row.ayah_number,
                text: row.text
            }))
        };
    } catch (error) {
        console.error('Error fetching tafsir:', error);
        return null;
    }
};

// Fetch tafsir for a specific ayah from Supabase
export const fetchTafsirByAyah = async (
    editionSlug: string,
    surahNumber: number,
    ayahNumber: number
): Promise<{ ayah: number; text: string } | null> => {
    try {
        const { data, error } = await supabase
            .from('tafsir_ayahs')
            .select('ayah_number, text')
            .eq('edition_slug', editionSlug)
            .eq('surah_number', surahNumber)
            .eq('ayah_number', ayahNumber)
            .single();

        if (error) {
            console.error('Error fetching ayah tafsir:', error);
            return null;
        }

        if (!data) {
            return null;
        }

        return {
            ayah: data.ayah_number,
            text: data.text
        };
    } catch (error) {
        console.error('Error fetching ayah tafsir:', error);
        return null;
    }
};

// Helper function to check if tafsir data exists for an edition
export const checkTafsirAvailability = async (editionSlug: string): Promise<boolean> => {
    try {
        const { count, error } = await supabase
            .from('tafsir_ayahs')
            .select('*', { count: 'exact', head: true })
            .eq('edition_slug', editionSlug)
            .limit(1);

        if (error) {
            console.error('Error checking tafsir availability:', error);
            return false;
        }

        return (count || 0) > 0;
    } catch (error) {
        console.error('Error checking tafsir availability:', error);
        return false;
    }
};
