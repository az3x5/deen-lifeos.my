import { supabase } from '../lib/supabase';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export const getQuranAccessToken = async () => {
    // Return cached token if valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        // Call secure RPC function in Supabase
        const { data, error } = await supabase.rpc('get_quran_token');

        if (error) {
            console.error("RPC Error:", error);
            throw error;
        }

        if (data) {
            accessToken = data;
            // Set expiry to 1 hour (default) minus buffer
            tokenExpiry = Date.now() + (3600 * 1000) - 300000;
            console.log("Successfully authenticated via Secure RPC");
            return accessToken;
        }
        return null;

    } catch (error) {
        console.error("Quran Auth Error:", error);
        return null;
    }
};
