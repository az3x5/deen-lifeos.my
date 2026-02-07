import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://api.deen.lifeos.my';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDI0MDMwMCwiZXhwIjo0OTI1OTEzOTAwLCJyb2xlIjoiYW5vbiJ9.Pssu0M8wRbyWcHWpn2ZP1k9WolDLb9apmhJSkuHfQeM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabaseState() {
    console.log('🔍 Checking Supabase database state...\n');

    // Check if tables exist by trying to query them
    console.log('1. Checking Tafsir Tables:');
    try {
        const { data: editions, error: editionsError } = await supabase
            .from('tafsir_editions')
            .select('count', { count: 'exact', head: true });

        if (editionsError) {
            console.log('   ❌ tafsir_editions table: NOT FOUND');
            console.log('   Error:', editionsError.message);
        } else {
            console.log(`   ✅ tafsir_editions table: EXISTS (${editions || 0} editions)`);
        }

        const { count: ayahCount, error: ayahError } = await supabase
            .from('tafsir_ayahs')
            .select('*', { count: 'exact', head: true });

        if (ayahError) {
            console.log('   ❌ tafsir_ayahs table: NOT FOUND');
        } else {
            console.log(`   ✅ tafsir_ayahs table: EXISTS (${ayahCount || 0} ayahs)`);
        }
    } catch (e) {
        console.log('   ❌ Error checking tafsir tables:', e);
    }

    console.log('\n2. Checking Hadith Tables:');
    try {
        const { count: collectionsCount, error: collectionsError } = await supabase
            .from('hadith_collections')
            .select('*', { count: 'exact', head: true });

        if (collectionsError) {
            console.log('   ❌ hadith_collections table: NOT FOUND');
            console.log('   Error:', collectionsError.message);
        } else {
            console.log(`   ✅ hadith_collections table: EXISTS (${collectionsCount || 0} collections)`);
        }

        const { count: hadithsCount, error: hadithsError } = await supabase
            .from('hadiths')
            .select('*', { count: 'exact', head: true });

        if (hadithsError) {
            console.log('   ❌ hadiths table: NOT FOUND');
        } else {
            console.log(`   ✅ hadiths table: EXISTS (${hadithsCount || 0} hadiths)`);
        }
    } catch (e) {
        console.log('   ❌ Error checking hadith tables:', e);
    }

    console.log('\n📋 Summary:');
    console.log('════════════════════════════════════════════════════════');

    const { count: tafsirCount } = await supabase.from('tafsir_ayahs').select('*', { count: 'exact', head: true });
    const { count: hadithCount } = await supabase.from('hadiths').select('*', { count: 'exact', head: true });

    if (!tafsirCount && !hadithCount) {
        console.log('❌ SETUP NOT COMPLETE');
        console.log('\nNext steps:');
        console.log('1. Apply supabase_islamic_content.sql to Supabase');
        console.log('2. Run: npx tsx scripts/populate_tafsir.ts');
        console.log('3. Run: npx tsx scripts/populate_hadiths.ts');
        console.log('\nSee SETUP_GUIDE.md for detailed instructions.');
    } else if (tafsirCount && tafsirCount > 0 || hadithCount && hadithCount > 0) {
        console.log('✅ PARTIALLY SETUP');
        console.log(`\nTafsir data: ${tafsirCount || 0} ayahs`);
        console.log(`Hadith data: ${hadithCount || 0} hadiths`);

        if (!tafsirCount || tafsirCount === 0) {
            console.log('\n⚠️  Missing: Tafsir data - run populate_tafsir.ts');
        }
        if (!hadithCount || hadithCount === 0) {
            console.log('⚠️  Missing: Hadith data - run populate_hadiths.ts');
        }
    }

    console.log('════════════════════════════════════════════════════════\n');
}

checkDatabaseState().catch(console.error);
