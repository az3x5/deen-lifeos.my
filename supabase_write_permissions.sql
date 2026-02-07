-- ============================================
-- ADD WRITE PERMISSIONS FOR DATA POPULATION
-- ============================================
-- Run this AFTER supabase_islamic_content.sql
-- This allows the anon user to insert data during population

-- Allow insert/update/delete for tafsir tables
CREATE POLICY "Enable insert for all users" ON tafsir_editions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tafsir_editions FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON tafsir_ayahs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tafsir_ayahs FOR UPDATE USING (true);

-- Allow insert/update/delete for hadith tables
CREATE POLICY "Enable insert for all users" ON hadith_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON hadith_collections FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON hadith_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON hadith_sections FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON hadiths FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON hadiths FOR UPDATE USING (true);
