/**
 * Script to download Hadith data from API and populate Supabase
 * Run with: npx tsx scripts/populate_hadiths.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://api.deen.lifeos.my';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDI0MDMwMCwiZXhwIjo0OTI1OTEzOTAwLCJyb2xlIjoiYW5vbiJ9.Pssu0M8wRbyWcHWpn2ZP1k9WolDLb9apmhJSkuHfQeM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

// Priority hadith collections to download
const PRIORITY_COLLECTIONS = [
    'eng-bukhari',
    'eng-muslim',
    'eng-abudawud',
    'eng-tirmidhi',
    'eng-nasai',
    'eng-ibnmajah',
];

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.log(`Retry ${i + 1}/${retries} for ${url}`);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

async function downloadHadithEditions() {
    console.log('📚 Downloading hadith editions...');

    try {
        let editions: any;
        try {
            editions = await fetchWithRetry(`${HADITH_API_BASE}/editions.json`);
        } catch {
            editions = await fetchWithRetry(`${HADITH_API_BASE}/editions.min.json`);
        }

        console.log(`Found ${Object.keys(editions).length} editions`);

        // Filter to priority collections
        const priorityEditions = Object.entries(editions)
            .filter(([key]) => PRIORITY_COLLECTIONS.includes(key));

        console.log(`Processing ${priorityEditions.length} priority collections`);

        // Insert collections into database
        for (const [slug, edition] of priorityEditions) {
            const editionData: any = edition;

            const { error } = await supabase
                .from('hadith_collections')
                .upsert({
                    slug: slug,
                    name: editionData.name,
                    collection_name: editionData.collection_name || editionData.name,
                    has_books: editionData.hasbooks === 'yes',
                    has_chapters: editionData.hasChapters === 'yes',
                    has_sections: editionData.hasSections === 'yes',
                    total_hadiths: editionData.total_hadiths || 0,
                    language: 'en',
                }, { onConflict: 'slug' });

            if (error) {
                console.error(`Error inserting collection ${slug}:`, error);
            } else {
                console.log(`✅ Inserted collection: ${editionData.name}`);
            }
        }

        return priorityEditions.map(([slug]) => slug);
    } catch (error) {
        console.error('Error downloading editions:', error);
        return [];
    }
}

async function downloadHadithCollection(collectionSlug: string) {
    console.log(`\n📖 Downloading hadith collection: ${collectionSlug}`);

    try {
        let data: any;
        try {
            data = await fetchWithRetry(`${HADITH_API_BASE}/editions/${collectionSlug}.json`);
        } catch {
            data = await fetchWithRetry(`${HADITH_API_BASE}/editions/${collectionSlug}.min.json`);
        }

        if (!data || !data.hadiths) {
            console.log(`❌ No hadith data found for ${collectionSlug}`);
            return;
        }

        const metadata = data.metadata;
        const hadiths = data.hadiths;

        console.log(`Found ${hadiths.length} hadiths`);

        // Process sections  
        if (metadata && metadata.section) {
            const sections = Object.entries(metadata.section).map(([num, name]) => ({
                collection_slug: collectionSlug,
                section_number: parseInt(num),
                section_name: name as string,
            }));

            const { error } = await supabase
                .from('hadith_sections')
                .upsert(sections, { onConflict: 'collection_slug,section_number' });

            if (error) {
                console.error('Error inserting sections:', error);
            } else {
                console.log(`✅ Inserted ${sections.length} sections`);
            }
        }

        // Process hadiths in batches
        const BATCH_SIZE = 100;
        let totalInserted = 0;

        for (let i = 0; i < hadiths.length; i += BATCH_SIZE) {
            const batch = hadiths.slice(i, i + BATCH_SIZE);

            const hadithRecords = batch.map((h: any) => ({
                collection_slug: collectionSlug,
                hadith_number: h.hadithnumber,
                arabic_number: h.arabicnumber,
                section_number: getSectionNumber(h.hadithnumber, metadata),
                book_number: h.reference?.book,
                text: h.text,
                grades: h.grades || [],
                reference: h.reference || {},
            }));

            const { error } = await supabase
                .from('hadiths')
                .upsert(hadithRecords, { onConflict: 'collection_slug,hadith_number' });

            if (error) {
                console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
            } else {
                totalInserted += hadithRecords.length;
                console.log(`✅ Batch ${i / BATCH_SIZE + 1}: ${hadithRecords.length} hadiths`);
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`✅ Total hadiths inserted for ${collectionSlug}: ${totalInserted}`);

    } catch (error) {
        console.error(`Error downloading collection ${collectionSlug}:`, error);
    }
}

function getSectionNumber(hadithNumber: number, metadata: any): number | null {
    if (!metadata || !metadata.section_details) return null;

    for (const [sectionNum, details] of Object.entries(metadata.section_details)) {
        const sectionDetails: any = details;
        if (sectionDetails.hadithnumber && sectionDetails.hadithnumber.includes(hadithNumber.toString())) {
            return parseInt(sectionNum);
        }
    }

    return null;
}

async function main() {
    console.log('🚀 Starting Hadith Data Population Script\n');

    // Step 1: Download and insert collections
    const collections = await downloadHadithEditions();

    if (collections.length === 0) {
        console.log('❌ No collections to download');
        return;
    }

    // Step 2: Download content for each collection
    for (const collection of collections) {
        await downloadHadithCollection(collection);
    }

    console.log('\n✅ Hadith population complete!');
}

main().catch(console.error);
