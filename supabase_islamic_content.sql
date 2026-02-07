-- ============================================
-- TAFSIR TABLES
-- ============================================

-- Table for Tafsir Editions/Collections
CREATE TABLE IF NOT EXISTS tafsir_editions (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  author TEXT,
  language TEXT NOT NULL,
  direction TEXT,
  source TEXT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Tafsir content (by ayah)
CREATE TABLE IF NOT EXISTS tafsir_ayahs (
  id SERIAL PRIMARY KEY,
  edition_slug TEXT NOT NULL REFERENCES tafsir_editions(slug) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(edition_slug, surah_number, ayah_number)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tafsir_ayahs_lookup ON tafsir_ayahs(edition_slug, surah_number, ayah_number);
CREATE INDEX IF NOT EXISTS idx_tafsir_ayahs_surah ON tafsir_ayahs(edition_slug, surah_number);

-- ============================================
-- HADITH TABLES
-- ============================================

-- Table for Hadith Collections
CREATE TABLE IF NOT EXISTS hadith_collections (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  collection_name TEXT,
  has_books BOOLEAN DEFAULT false,
  has_chapters BOOLEAN DEFAULT false,
  has_sections BOOLEAN DEFAULT false,
  total_hadiths INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Hadith Sections/Chapters
CREATE TABLE IF NOT EXISTS hadith_sections (
  id SERIAL PRIMARY KEY,
  collection_slug TEXT NOT NULL REFERENCES hadith_collections(slug) ON DELETE CASCADE,
  section_number INTEGER NOT NULL,
  section_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_slug, section_number)
);

-- Table for individual Hadiths
CREATE TABLE IF NOT EXISTS hadiths (
  id SERIAL PRIMARY KEY,
  collection_slug TEXT NOT NULL REFERENCES hadith_collections(slug) ON DELETE CASCADE,
  hadith_number INTEGER NOT NULL,
  arabic_number INTEGER,
  section_number INTEGER,
  book_number INTEGER,
  text TEXT NOT NULL,
  grades JSONB, -- Array of {grade: string, name: string}
  reference JSONB, -- {book: number, hadith: string}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_slug, hadith_number)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_hadiths_collection ON hadiths(collection_slug);
CREATE INDEX IF NOT EXISTS idx_hadiths_section ON hadiths(collection_slug, section_number);
CREATE INDEX IF NOT EXISTS idx_hadiths_number ON hadiths(collection_slug, hadith_number);
CREATE INDEX IF NOT EXISTS idx_hadith_sections_lookup ON hadith_sections(collection_slug, section_number);

-- Full text search on hadith text
CREATE INDEX IF NOT EXISTS idx_hadiths_text_search ON hadiths USING gin(to_tsvector('english', text));

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE tafsir_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tafsir_ayahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadith_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadith_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadiths ENABLE ROW LEVEL SECURITY;

-- Allow public read access (these are public Islamic texts)
CREATE POLICY "Enable read access for all users" ON tafsir_editions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tafsir_ayahs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON hadith_collections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON hadith_sections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON hadiths FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get tafsir for a surah
CREATE OR REPLACE FUNCTION get_tafsir_by_surah(
  p_edition_slug TEXT,
  p_surah_number INTEGER
)
RETURNS TABLE (
  ayah_number INTEGER,
  text TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ayah_number, text
  FROM tafsir_ayahs
  WHERE edition_slug = p_edition_slug
    AND surah_number = p_surah_number
  ORDER BY ayah_number;
END;
$$ LANGUAGE plpgsql;

-- Function to get hadiths by section
CREATE OR REPLACE FUNCTION get_hadiths_by_section(
  p_collection_slug TEXT,
  p_section_number INTEGER
)
RETURNS TABLE (
  hadith_number INTEGER,
  arabic_number INTEGER,
  text TEXT,
  grades JSONB,
  reference JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.hadith_number, h.arabic_number, h.text, h.grades, h.reference
  FROM hadiths h
  WHERE h.collection_slug = p_collection_slug
    AND h.section_number = p_section_number
  ORDER BY h.hadith_number;
END;
$$ LANGUAGE plpgsql;

-- Function to search hadiths
CREATE OR REPLACE FUNCTION search_hadiths(
  p_search_term TEXT,
  p_collection_slug TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  collection_slug TEXT,
  hadith_number INTEGER,
  text TEXT,
  grades JSONB,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.collection_slug,
    h.hadith_number,
    h.text,
    h.grades,
    ts_rank(to_tsvector('english', h.text), plainto_tsquery('english', p_search_term)) AS rank
  FROM hadiths h
  WHERE to_tsvector('english', h.text) @@ plainto_tsquery('english', p_search_term)
    AND (p_collection_slug IS NULL OR h.collection_slug = p_collection_slug)
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
