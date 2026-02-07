/**
 * Script to download Tafsir data from API and populate Supabase
 * Run with: npx tsx scripts/populate_tafsir.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://api.deen.lifeos.my';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDI0MDMwMCwiZXhwIjo0OTI1OTEzOTAwLCJyb2xlIjoiYW5vbiJ9.Pssu0M8wRbyWcHWpn2ZP1k9WolDLb9apmhJSkuHfQeM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TAFSIR_API_BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';

// Priority tafsir editions to download (English and popular ones)
const PRIORITY_EDITIONS = [
    'en-tafisr-ibn-kathir',
    'en-tafsir-maarif-ul-quran',
    'en-tafsir-al-jalalayn',
];

interface TafsirEdition {
    name: string;
    author: string;
    language: string;
    direction: string;
    source: string;
    comments: string;
    id: string;
    slug: string;
}

interface TafsirAyah {
    ayah: number;
    text: string;
}

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

async function downloadTafsirEditions() {
    console.log('📚 Downloading tafsir editions...');

    try {
        const editions: TafsirEdition[] = await fetchWithRetry(`${TAFSIR_API_BASE}/editions.json`);
        console.log(`Found ${editions.length} editions`);

        // Filter to priority editions
        const priorityEditions = editions.filter(e => PRIORITY_EDITIONS.includes(e.slug));
        console.log(`Downloading ${priorityEditions.length} priority editions`);

        // Insert editions into database
        for (const edition of priorityEditions) {
            const { error } = await supabase
                .from('tafsir_editions')
                .upsert({
                    slug: edition.slug,
                    name: edition.name,
                    author: edition.author,
                    language: edition.language,
                    direction: edition.direction,
                    source: edition.source,
                    comments: edition.comments,
                }, { onConflict: 'slug' });

            if (error) {
                console.error(`Error inserting edition ${edition.slug}:`, error);
            } else {
                console.log(`✅ Inserted edition: ${edition.name}`);
            }
        }

        return priorityEditions;
    } catch (error) {
        console.error('Error downloading editions:', error);
        return [];
    }
}

async function downloadTafsirContent(editionSlug: string) {
    console.log(`\n📖 Downloading tafsir content for: ${editionSlug}`);

    const totalSurahs = 114;
    let totalAyahs = 0;

    for (let surahNum = 1; surahNum <= totalSurahs; surahNum++) {
        try {
            const url = `${TAFSIR_API_BASE}/${editionSlug}/${surahNum}.json`;
            const data = await fetchWithRetry(url);

            if (data && data.verses && Array.isArray(data.verses)) {
                const ayahs = data.verses.map((v: TafsirAyah) => ({
                    edition_slug: editionSlug,
                    surah_number: surahNum,
                    ayah_number: v.ayah,
                    text: v.text,
                }));

                // Batch insert
                const { error } = await supabase
                    .from('tafsir_ayahs')
                    .upsert(ayahs, { onConflict: 'edition_slug,surah_number,ayah_number' });

                if (error) {
                    console.error(`Error inserting surah ${surahNum}:`, error);
                } else {
                    totalAyahs += ayahs.length;
                    console.log(`✅ Surah ${surahNum}: ${ayahs.length} ayahs`);
                }
            }

            // Rate limiting - wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error(`Error downloading surah ${surahNum}:`, error);
        }
    }

    console.log(`✅ Total ayahs inserted for ${editionSlug}: ${totalAyahs}`);
}

async function main() {
    console.log('🚀 Starting Tafsir Data Population Script\n');

    // Step 1: Download and insert editions
    const editions = await downloadTafsirEditions();

    if (editions.length === 0) {
        console.log('❌ No editions to download');
        return;
    }

    // Step 2: Download content for each edition
    for (const edition of editions) {
        await downloadTafsirContent(edition.slug);
    }

    console.log('\n✅ Tafsir population complete!');
}

main().catch(console.error);
