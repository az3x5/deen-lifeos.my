-- ==============================================
-- COMPLETE ISLAMIC CONTENT SETUP - RUN THIS ONCE
-- ==============================================
-- This script:
-- 1. Adds write permissions
-- 2. Inserts Sahih Bukhari collection
-- Copy and run this entire script in Supabase Dashboard → SQL Editor

-- Step 1: Add write permissions
CREATE POLICY IF NOT EXISTS "insert_tafsir_editions" ON tafsir_editions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "update_tafsir_editions" ON tafsir_editions FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "insert_tafsir_ayahs" ON tafsir_ayahs FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "update_tafsir_ayahs" ON tafsir_ayahs FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "insert_hadith_collections" ON hadith_collections FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "update_hadith_collections" ON hadith_collections FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "insert_hadith_sections" ON hadith_sections FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "update_hadith_sections" ON hadith_sections FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "insert_hadiths" ON hadiths FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "update_hadiths" ON hadiths FOR UPDATE USING (true);

-- Step 2: Insert Sahih Bukhari collection entry
INSERT INTO hadith_collections (slug, name, collection_name, has_sections, total_hadiths, language)
VALUES ('eng-bukhari', 'Sahih al-Bukhari', 'Sahih al-Bukhari', true, 7563, 'en')
ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Write permissions added successfully!';
  RAISE NOTICE 'Sahih Bukhari collection created!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run the population script:';
  RAISE NOTICE '  npx tsx scripts/quick_populate_hadith.ts';
END $$;
