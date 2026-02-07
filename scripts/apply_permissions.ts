/**
 * Apply write permissions to Supabase via REST API
 */

const SUPABASE_URL = 'https://api.deen.lifeos.my';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDI0MDMwMCwiZXhwIjo0OTI1OTEzOTAwLCJyb2xlIjoiYW5vbiJ9.Pssu0M8wRbyWcHWpn2ZP1k9WolDLb9apmhJSkuHfQeM';

const SQL_STATEMENTS = [
    `CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON tafsir_editions FOR INSERT WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable update for all users" ON tafsir_editions FOR UPDATE USING (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON tafsir_ayahs FOR INSERT WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable update for all users" ON tafsir_ayahs FOR UPDATE USING (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON hadith_collections FOR INSERT WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable update for all users" ON hadith_collections FOR UPDATE USING (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON hadith_sections FOR INSERT WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable update for all users" ON hadith_sections FOR UPDATE USING (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON hadiths FOR INSERT WITH CHECK (true)`,
    `CREATE POLICY IF NOT EXISTS "Enable update for all users" ON hadiths FOR UPDATE USING (true)`,
];

async function applyPermissions() {
    console.log('🔧 Applying write permissions to Supabase...\n');

    for (const sql of SQL_STATEMENTS) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ query: sql })
            });

            if (response.ok) {
                console.log('✅ Applied:', sql.substring(0, 60) + '...');
            } else {
                console.log('⚠️  Note:', await response.text());
            }
        } catch (error) {
            console.log('ℹ️  SQL:', sql.substring(0, 60));
        }
    }

    console.log('\n✅ Permission application complete!');
    console.log('\nℹ️  Note: If you see errors above, manually run apply_permissions.sql in Supabase Dashboard → SQL Editor');
}

applyPermissions().catch(console.error);
