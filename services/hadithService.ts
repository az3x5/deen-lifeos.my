// Hadith Service - Fetches from Supabase Database
import { supabase } from '../lib/supabase';

export interface HadithEdition {
    id: number;
    slug: string;
    name: string;
    collection_name: string;
    has_books: boolean;
    has_chapters: boolean;
    has_sections: boolean;
    total_hadiths: number;
    language: string;
}

export interface HadithSection {
    id: number;
    collection_slug: string;
    section_number: number;
    section_name: string;
}

export interface HadithData {
    id: number;
    collection_slug: string;
    hadith_number: number;
    arabic_number?: number;
    section_number?: number;
    book_number?: number;
    text: string;
    grades?: Array<{
        grade?: string;
        name?: string;
    }>;
    reference?: {
        book?: number;
        hadith?: number | string;
    };
}

export interface HadithMetadata {
    name: string;
    section: {
        [key: string]: string;
    };
}

// Fetch all available hadith collections from Supabase
export const fetchHadithEditions = async (): Promise<Record<string, HadithEdition>> => {
    try {
        const { data, error } = await supabase
            .from('hadith_collections')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching hadith collections:', error);
            return {};
        }

        // Convert array to object keyed by slug
        const editions: Record<string, HadithEdition> = {};
        (data || []).forEach((collection: any) => {
            editions[collection.slug] = {
                id: collection.id,
                slug: collection.slug,
                name: collection.name,
                collection_name: collection.collection_name,
                has_books: collection.has_books,
                has_chapters: collection.has_chapters,
                has_sections: collection.has_sections,
                total_hadiths: collection.total_hadiths,
                language: collection.language,
            };
        });

        return editions;
    } catch (error) {
        console.error('Error fetching hadith collections:', error);
        return {};
    }
};

// Fetch sections for a collection
export const fetchHadithSections = async (
    collectionSlug: string
): Promise<HadithSection[]> => {
    try {
        const { data, error } = await supabase
            .from('hadith_sections')
            .select('*')
            .eq('collection_slug', collectionSlug)
            .order('section_number');

        if (error) {
            console.error('Error fetching sections:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
};

// Fetch entire hadith collection (metadata + sections)
export const fetchHadithCollection = async (
    collectionSlug: string
): Promise<{ metadata: HadithMetadata; hadiths: HadithData[] } | null> => {
    try {
        // Fetch collection info
        const { data: collection, error: collectionError } = await supabase
            .from('hadith_collections')
            .select('*')
            .eq('slug', collectionSlug)
            .single();

        if (collectionError) {
            console.error('Error fetching collection:', collectionError);
            return null;
        }

        // Fetch sections
        const sections = await fetchHadithSections(collectionSlug);

        const metadata: HadithMetadata = {
            name: collection.name,
            section: {}
        };

        sections.forEach(section => {
            metadata.section[section.section_number.toString()] = section.section_name;
        });

        return {
            metadata,
            hadiths: [] // We don't load all hadiths, just metadata
        };
    } catch (error) {
        console.error('Error fetching hadith collection:', error);
        return null;
    }
};

// Fetch a specific hadith by number
export const fetchHadithByNumber = async (
    collectionSlug: string,
    hadithNumber: number
): Promise<{ metadata: HadithMetadata; hadith: HadithData } | null> => {
    try {
        const { data, error } = await supabase
            .from('hadiths')
            .select('*')
            .eq('collection_slug', collectionSlug)
            .eq('hadith_number', hadithNumber)
            .single();

        if (error) {
            console.error('Error fetching hadith:', error);
            return null;
        }

        if (!data) {
            return null;
        }

        // Get collection info for metadata
        const collectionData = await fetchHadithCollection(collectionSlug);

        return {
            metadata: collectionData?.metadata || { name: collectionSlug, section: {} },
            hadith: data
        };
    } catch (error) {
        console.error('Error fetching hadith:', error);
        return null;
    }
};

// Fetch hadiths by section
export const fetchHadithBySection = async (
    collectionSlug: string,
    sectionNumber: number
): Promise<{ metadata: HadithMetadata; hadiths: HadithData[] } | null> => {
    try {
        const { data, error } = await supabase
            .from('hadiths')
            .select('*')
            .eq('collection_slug', collectionSlug)
            .eq('section_number', sectionNumber)
            .order('hadith_number');

        if (error) {
            console.error('Error fetching section hadiths:', error);
            return null;
        }

        // Get collection info for metadata
        const collectionData = await fetchHadithCollection(collectionSlug);

        return {
            metadata: collectionData?.metadata || { name: collectionSlug, section: {} },
            hadiths: data || []
        };
    } catch (error) {
        console.error('Error fetching section hadiths:', error);
        return null;
    }
};

// Search hadiths
export const searchHadiths = async (
    searchTerm: string,
    collectionSlug?: string,
    limit: number = 50
): Promise<HadithData[]> => {
    try {
        let query = supabase
            .from('hadiths')
            .select('*')
            .textSearch('text', searchTerm, {
                type: 'websearch',
                config: 'english'
            })
            .limit(limit);

        if (collectionSlug) {
            query = query.eq('collection_slug', collectionSlug);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error searching hadiths:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error searching hadiths:', error);
        return [];
    }
};

// Fetch complete hadith info (all collections metadata)
export const fetchHadithInfo = async (): Promise<any> => {
    try {
        const editions = await fetchHadithEditions();
        return editions;
    } catch (error) {
        console.error('Error fetching hadith info:', error);
        return null;
    }
};
