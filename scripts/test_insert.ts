/**
 * MINIMAL TEST - Insert just 10 sample hadiths to verify it works
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://api.deen.lifeos.my';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MDI0MDMwMCwiZXhwIjo0OTI1OTEzOTAwLCJyb2xlIjoiYW5vbiJ9.Pssu0M8wRbyWcHWpn2ZP1k9WolDLb9apmhJSkuHfQeM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function insertTestData() {
    console.log('🧪 Inserting test hadith data...\n');

    // 1. Insert collection
    console.log('1. Creating collection...');
    const { data: collection, error: collError } = await supabase
        .from('hadith_collections')
        .insert({
            slug: 'test-bukhari',
            name: 'Sahih al-Bukhari (Test)',
            collection_name: 'Sahih al-Bukhari',
            has_sections: true,
            total_hadiths: 10,
            language: 'en',
        })
        .select()
        .single();

    if (collError) {
        console.error('❌ Error:', collError.message);
        console.log('\n⚠️  YOU NEED TO RUN QUICK_FIX.sql IN SUPABASE FIRST!');
        console.log('Go to: Supabase Dashboard → SQL Editor');
        console.log('Run: QUICK_FIX.sql');
        return;
    }
    console.log('✅ Collection created\n');

    // 2. Insert a section
    console.log('2. Creating section...');
    const { error: secError } = await supabase
        .from('hadith_sections')
        .insert({
            collection_slug: 'test-bukhari',
            section_number: 1,
            section_name: 'Revelation',
        });

    if (secError) {
        console.error('❌ Error:', secError.message);
        return;
    }
    console.log('✅ Section created\n');

    // 3. Insert sample hadiths
    console.log('3. Inserting 10 test hadiths...');

    const testHadiths = [
        {
            collection_slug: 'test-bukhari',
            hadith_number: 1,
            section_number: 1,
            text: "The first revelation that came to the Messenger of Allah was the true dream. Every dream he saw came true like bright daylight.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '1' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 2,
            section_number: 1,
            text: "Actions are (judged) by motives, so each man will have what he intended.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '2' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 3,
            section_number: 1,
            text: "Islam has been built on five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '3' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 4,
            section_number: 1,
            text: "The best among you are those who have the best manners and character.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '4' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 5,
            section_number: 1,
            text: "None of you will have faith till he loves for his brother what he loves for himself.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '5' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 6,
            section_number: 1,
            text: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '6' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 7,
            section_number: 1,
            text: "Make things easy and do not make them difficult, cheer the people up by conveying glad tidings to them and do not repulse them.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '7' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 8,
            section_number: 1,
            text: "A Muslim is the one who avoids harming Muslims with his tongue and hands.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '8' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 9,
            section_number: 1,
            text: "The most beloved deeds to Allah are the most consistent ones, even if they are small.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '9' }
        },
        {
            collection_slug: 'test-bukhari',
            hadith_number: 10,
            section_number: 1,
            text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
            grades: [{ grade: 'Sahih', name: 'Al-Bukhari' }],
            reference: { book: 1, hadith: '10' }
        },
    ];

    const { error: hadithError } = await supabase
        .from('hadiths')
        .insert(testHadiths);

    if (hadithError) {
        console.error('❌ Error:', hadithError.message);
        return;
    }

    console.log('✅ 10 test hadiths inserted!\n');
    console.log('════════════════════════════════════════');
    console.log('✅ SUCCESS! Test data inserted!');
    console.log('════════════════════════════════════════');
    console.log('\n🎯 NOW: Refresh your app and check the Hadith Library page!');
    console.log('You should see "Sahih al-Bukhari (Test)" with 10 hadiths.');
}

insertTestData().catch(console.error);
