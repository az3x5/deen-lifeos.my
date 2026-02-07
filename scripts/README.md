# Islamic Content Population Scripts

## Prerequisites

1. **Apply the SQL schema to your Supabase database:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and run `supabase_islamic_content.sql`

## Running the Scripts

### 1. Populate Tafsir Data

This will download and store 3 popular tafsir editions (Ibn Kathir, Maarif-ul-Quran, Al-Jalalayn) for all 114 surahs.

```bash
npx tsx scripts/populate_tafsir.ts
```

**Expected time:** ~30-60 minutes  
**Data size:** ~6,000 ayahs × 3 editions = 18,000 records

### 2. Populate Hadith Data

This will download and store 6 major hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah).

```bash
npx tsx scripts/populate_hadiths.ts
```

**Expected time:** ~45-90 minutes  
**Data size:** ~25,000+ hadiths across 6 collections

## Progress Monitoring

The scripts will show progress like this:

```
📚 Downloading tafsir editions...
✅ Inserted edition: Tafsir Ibn Kathir
📖 Downloading tafsir content for: en-tafisr-ibn-kathir
✅ Surah 1: 7 ayahs
✅ Surah 2: 286 ayahs
...
```

## Customization

To add more editions/collections, edit the arrays in the scripts:

**Tafsir** (`scripts/populate_tafsir.ts`):
```typescript
const PRIORITY_EDITIONS = [
  'en-tafisr-ibn-kathir',
  'en-tafsir-maarif-ul-quran',
  'en-tafsir-al-jalalayn',
  // Add more here
];
```

**Hadith** (`scripts/populate_hadiths.ts`):
```typescript
const PRIORITY_COLLECTIONS = [
  'eng-bukhari',
  'eng-muslim',
  'eng-abudawud',
  // Add more here
];
```

## Troubleshooting

### Network Errors
The scripts include automatic retry logic (3 attempts). If downloads fail:
- Check your internet connection
- Try again later (CDN might be temporarily down)
- Increase retry count in `fetchWithRetry()`

### Database Errors
- Ensure the SQL schema is applied correctly
- Check Supabase logs in the Dashboard
- Verify RLS policies allow inserts

### Rate Limiting
The scripts include delays between requests to avoid overwhelming the CDN:
- Tafsir: 100ms between surahs
- Hadith: 200ms between batches

## Verification

After running the scripts, verify in Supabase:

```sql
-- Check tafsir editions
SELECT slug, name FROM tafsir_editions;

-- Check tafsir count
SELECT edition_slug, COUNT(*) FROM tafsir_ayahs GROUP BY edition_slug;

-- Check hadith collections  
SELECT slug, name, total_hadiths FROM hadith_collections;

-- Check hadith count
SELECT collection_slug, COUNT(*) FROM hadiths GROUP BY collection_slug;
```

## Next Steps

After populating the data:
1. Test the app to ensure tafsir and hadiths load correctly
2. The data is now stored locally in Supabase (faster access)
3. No more CORS issues or external API dependencies!
