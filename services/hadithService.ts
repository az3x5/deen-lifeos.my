// Hadith API Service - https://github.com/fawazahmed0/hadith-api
const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

export interface HadithEdition {
    name: string;
    collection: string[];
    hasbooks: string;
    hasChapters: string;
    hasSections: string;
    collection_name: string;
    total_hadiths: number;
}

export interface HadithMetadata {
    name: string;
    section: {
        [key: string]: string;
    };
    section_details: {
        [key: string]: {
            hadithnumber: string[];
            arabicnumber: string[];
        };
    };
}

export interface HadithData {
    hadithnumber: number;
    arabicnumber?: number;
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

// Fetch all available hadith editions
export const fetchHadithEditions = async (): Promise<Record<string, HadithEdition>> => {
    try {
        const response = await fetch(`${HADITH_API_BASE}/editions.json`);
        if (!response.ok) {
            // Fallback to minified version
            const fallbackResponse = await fetch(`${HADITH_API_BASE}/editions.min.json`);
            if (!fallbackResponse.ok) throw new Error('Failed to fetch hadith editions');
            return await fallbackResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hadith editions:', error);
        return {};
    }
};

// Fetch entire hadith collection
export const fetchHadithCollection = async (
    editionName: string
): Promise<{ metadata: HadithMetadata; hadiths: HadithData[] } | null> => {
    try {
        const response = await fetch(`${HADITH_API_BASE}/editions/${editionName}.json`);
        if (!response.ok) {
            // Fallback to minified version
            const fallbackResponse = await fetch(`${HADITH_API_BASE}/editions/${editionName}.min.json`);
            if (!fallbackResponse.ok) throw new Error('Failed to fetch hadith collection');
            return await fallbackResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hadith collection:', error);
        return null;
    }
};

// Fetch a specific hadith by number
export const fetchHadithByNumber = async (
    editionName: string,
    hadithNumber: number
): Promise<{ metadata: HadithMetadata; hadith: HadithData } | null> => {
    try {
        const response = await fetch(
            `${HADITH_API_BASE}/editions/${editionName}/${hadithNumber}.json`
        );
        if (!response.ok) {
            // Fallback to minified version
            const fallbackResponse = await fetch(
                `${HADITH_API_BASE}/editions/${editionName}/${hadithNumber}.min.json`
            );
            if (!fallbackResponse.ok) throw new Error('Failed to fetch hadith');
            return await fallbackResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hadith:', error);
        return null;
    }
};

// Fetch hadiths by section
export const fetchHadithBySection = async (
    editionName: string,
    sectionNumber: number
): Promise<{ metadata: HadithMetadata; hadiths: HadithData[] } | null> => {
    try {
        const response = await fetch(
            `${HADITH_API_BASE}/editions/${editionName}/sections/${sectionNumber}.json`
        );
        if (!response.ok) {
            // Fallback to minified version
            const fallbackResponse = await fetch(
                `${HADITH_API_BASE}/editions/${editionName}/sections/${sectionNumber}.min.json`
            );
            if (!fallbackResponse.ok) throw new Error('Failed to fetch section hadiths');
            return await fallbackResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching section hadiths:', error);
        return null;
    }
};

// Fetch complete hadith info (metadata about all collections)
export const fetchHadithInfo = async (): Promise<any> => {
    try {
        const response = await fetch(`${HADITH_API_BASE}/info.json`);
        if (!response.ok) {
            const fallbackResponse = await fetch(`${HADITH_API_BASE}/info.min.json`);
            if (!fallbackResponse.ok) throw new Error('Failed to fetch hadith info');
            return await fallbackResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hadith info:', error);
        return null;
    }
};
