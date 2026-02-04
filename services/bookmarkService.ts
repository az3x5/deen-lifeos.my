import { supabase } from '../lib/supabase';

export type BookmarkType = 'QURAN' | 'DUA' | 'HADITH';

export interface Bookmark {
    id: string;
    user_id: string;
    created_at: string;
    type: BookmarkType;
    reference_id: string;
    title: string;
    subtitle?: string;
    arabic_text?: string;
}

export const bookmarkService = {
    async getBookmarks(type?: BookmarkType) {
        let query = supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Bookmark[];
    },

    async addBookmark(bookmark: Omit<Bookmark, 'id' | 'user_id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('bookmarks')
            .insert([bookmark])
            .select()
            .single();

        if (error) throw error;
        return data as Bookmark;
    },

    async removeBookmark(id: string) {
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async isBookmarked(type: BookmarkType, referenceId: string) {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('type', type)
            .eq('reference_id', referenceId)
            .maybeSingle();

        if (error) return false;
        return !!data;
    }
};
