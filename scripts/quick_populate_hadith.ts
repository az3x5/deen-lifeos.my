/**
 * Quick Hadith Population Script - Downloads just Sahih Bukhari for testing
 * Run with: npx tsx scripts/quick_populate_hadith.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://api.deen.lifeos.my';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDI0MDMwMCwiZXhwIjo0OTI1OTEzOTAwLCJyb2xlIjoiYW5vbiJ9.Pssu0M8wRbyWcHWpn2ZP1k9WolDLb9apmhJSkuHfQeM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

async function populateSahihBukhari() {
    console.log('🚀 Quick Hadith Population - Sahih Bukhari Only\n');

    const collectionSlug = 'eng-bukhari';

    // 1. Insert collection
    console.log('📚 Creating collection entry...');
    const { error: collectionError } = await supabase
        .from('hadith_collections')
        .upsert({
            slug: collectionSlug,
            name: 'Sahih al-Bukhari',
            collection_name: 'Sahih al-Bukhari',
            has_sections: true,
            total_hadiths: 7563,
            language: 'en',
        }, { onConflict: 'slug' });

    if (collectionError) {
        console.error('❌ Error creating collection:', collectionError);
        return;
    }
    console.log('✅ Collection created\n');

    // 2. Download hadith data
    console.log('📖 Downloading Sahih Bukhari data...');
    let data: any;
    try {
        data = await fetchWithRetry(`${HADITH_API_BASE}/editions/${collectionSlug}.min.json`);
    } catch {
        console.log('Trying non-minified version...');
        data = await fetchWithRetry(`${HADITH_API_BASE}/editions/${collectionSlug}.json`);
    }

    if (!data || !data.hadiths) {
        console.log('❌ No hadith data found');
        return;
    }

    const hadiths = data.hadiths;
    const metadata = data.metadata;

    console.log(`✅ Downloaded ${hadiths.length} hadiths\n`);

    // 3. Insert sections
    if (metadata && metadata.section) {
        const sections = Object.entries(metadata.section).map(([num, name]) => ({
            collection_slug: collectionSlug,
            section_number: parseInt(num),
            section_name: name as string,
        }));

        const { error } = await supabase
            .from('hadith_sections')
            .upsert(sections, { onConflict: 'collection_slug,section_number' });

        if (!error) {
            console.log(`✅ Inserted ${sections.length} sections\n`);
        }
    }

    // 4. Insert hadiths in batches
    console.log('💾 Inserting hadiths into database...');
    const BATCH_SIZE = 100;
    let totalInserted = 0;

    for (let i = 0; i < hadiths.length; i += BATCH_SIZE) {
        const batch = hadiths.slice(i, i + BATCH_SIZE);

        const hadithRecords = batch.map((h: any) => ({
            collection_slug: collectionSlug,
            hadith_number: h.hadithnumber,
            arabic_number: h.arabicnumber,
            text: h.text,
            grades: h.grades || [],
            reference: h.reference || {},
        }));

        const { error } = await supabase
            .from('hadiths')
            .upsert(hadithRecords, { onConflict: 'collection_slug,hadith_number' });

        if (!error) {
            totalInserted += hadithRecords.length;
            const progress = Math.round((i / hadiths.length) * 100);
            console.log(`   ${progress}% - Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${hadithRecords.length} hadiths`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ SUCCESS! Inserted ${totalInserted} hadiths from Sahih Bukhari`);
    console.log('\n🎯 Next: Refresh your app and check the Hadith Library page!');
}

populateSahihBukhari().catch(console.error);
