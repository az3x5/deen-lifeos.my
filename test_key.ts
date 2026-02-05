
import { createClient } from '@supabase/supabase-js';

const url = "http://supabasekong-nwc4o4g4cogoc84sokc8k08s.76.13.193.146.sslip.io";
const key = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDI0MDMwMCwiZXhwIjo0OTI1OTEzOTAwLCJyb2xlIjoiYW5vbiJ9.Pssu0M8wRbyWcHWpn2ZP1k9WolDLb9apmhJSkuHfQeM";

const supabase = createClient(url, key);

async function check() {
    console.log("Checking key validity...");
    // Just try to read public settings or something lightweight.
    // Usually a bad key fails instantly or on any request.
    const { data, error } = await supabase.from('bookmarks').select('count', { count: 'exact', head: true });

    if (error) {
        console.error("Error:", error);
        if (error.code === 'PGRST301' || error.message.includes("JWT")) {
            console.log("Likely an Invalid Key.");
        }
    } else {
        console.log("Key seems valid. Connection successful.");
    }
}

check();
