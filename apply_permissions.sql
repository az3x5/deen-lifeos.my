-- Combined SQL Script - Apply write permissions
-- This adds INSERT/UPDATE permissions to allow data population

-- Allow insert/update for tafsir tables
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON tafsir_editions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON tafsir_editions FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON tafsir_ayahs FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON tafsir_ayahs FOR UPDATE USING (true);

-- Allow insert/update for hadith tables
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON hadith_collections FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON hadith_collections FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON hadith_sections FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON hadith_sections FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON hadiths FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for all users" ON hadiths FOR UPDATE USING (true);
