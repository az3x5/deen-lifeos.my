
import { getQuranAccessToken } from './quranAuth';

const API_BASE_URL = 'https://api.quran.com/api/v4';

// Example endpoints. Adjust strictly based on Quran API v4 docs.

export const fetchChapters = async () => {
    const token = await getQuranAccessToken();
    if (!token) throw new Error("Authentication failed");

    const response = await fetch(`${API_BASE_URL}/chapters`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error("Failed to fetch chapters");
    return await response.json();
};

export const fetchVerses = async (chapterId: number) => {
    const token = await getQuranAccessToken();
    if (!token) throw new Error("Authentication failed");

    const response = await fetch(`${API_BASE_URL}/verses/by_chapter/${chapterId}?fields=text_uthmani,text_indopak`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error("Failed to fetch verses");
    return await response.json();
};
