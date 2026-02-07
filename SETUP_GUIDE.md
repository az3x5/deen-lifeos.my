# 📖 Supabase Islamic Content Setup Guide

## 🎯 Quick Start

This guide will help you populate your Supabase database with Tafsir and Hadith data to fix the loading issues.

---

## Step 1: Apply Database Schema

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase_islamic_content.sql`
3. Copy all the SQL code
4. Paste it into the SQL Editor
5. Click **Run** (or press `Ctrl+Enter`)

**What this does:**
- Creates tables for tafsir editions and content
- Creates tables for hadith collections and content
- Sets up indexes for fast queries
- Enables Row Level Security (public read access)
- Creates helper functions for searching

---

## Step 2: Populate Tafsir Data

Run this command in your terminal:

```bash
npx tsx scripts/populate_tafsir.ts
```

**What happens:**
- Downloads 3 tafsir editions (Ibn Kathir, Maarif-ul-Quran, Al-Jalalayn)
- Stores all 114 surahs for each edition
- ~18,000 ayah tafsirs will be stored
- Takes about 30-60 minutes

**Progress indicators:**
```
📚 Downloading tafsir editions...
✅ Inserted edition: Tafsir Ibn Kathir
📖 Downloading tafsir content for: en-tafisr-ibn-kathir
✅ Surah 1: 7 ayahs
✅ Surah 2: 286 ayahs
...
✅ Total ayahs inserted: 6,236
```

---

## Step 3: Populate Hadith Data

Run this command in your terminal:

```bash
npx tsx scripts/populate_hadiths.ts
```

**What happens:**
- Downloads 6 major hadith collections:
  - Sahih Bukhari
  - Sahih Muslim  
  - Sunan Abu Dawud
  - Jami' At-Tirmidhi
  - Sunan An-Nasa'i
  - Sunan Ibn Majah
- Stores all sections and hadiths
- ~25,000+ hadiths will be stored
- Takes about 45-90 minutes

**Progress indicators:**
```
📚 Downloading hadith editions...
✅ Inserted collection: Sahih al-Bukhari
📖 Downloading hadith collection: eng-bukhari
✅ Inserted 97 sections
✅ Batch 1: 100 hadiths
✅ Batch 2: 100 hadiths
...
✅ Total hadiths inserted: 7,563
```

---

## Step 4: Verify Data

After both scripts complete, verify the data in Supabase:

### Check Tafsir Data

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Check tafsir editions
SELECT slug, name, language FROM tafsir_editions;

-- Check tafsir ayah counts per edition
SELECT 
  edition_slug, 
  COUNT(*) as total_ayahs 
FROM tafsir_ayahs 
GROUP BY edition_slug;
```

**Expected output:**
```
en-tafisr-ibn-kathir      | 6,236 ayahs
en-tafsir-maarif-ul-quran | 6,236 ayahs
en-tafsir-al-jalalayn     | 6,236 ayahs
```

### Check Hadith Data

```sql
-- Check hadith collections
SELECT slug, name, total_hadiths FROM hadith_collections;

-- Check actual hadith counts
SELECT 
  collection_slug, 
  COUNT(*) as actual_count 
FROM hadiths 
GROUP BY collection_slug;
```

**Expected output:**
```
eng-bukhari  | ~7,500 hadiths
eng-muslim   | ~7,500 hadiths
eng-abudawud | ~5,200 hadiths
eng-tirmidhi | ~3,900 hadiths
eng-nasai    | ~5,700 hadiths
eng-ibnmajah | ~4,300 hadiths
```

---

## Step 5: Test the App

1. Refresh your browser
2. **Test Tafsir:**
   - Go to Quran page
   - Select any surah
   - You should now see the **Tafsir button** on each ayah
   - Click it to view tafsir from Ibn Kathir
3. **Test Hadiths:**
   - Go to Hadith page
   - You should see 6 collections
   - Click on any collection (e.g., Sahih Bukhari)
   - Browse sections and read hadiths

---

## Troubleshooting

### ❌ Script fails with network error

**Solution:**
- Check your internet connection
- Try a different network
- The scripts have auto-retry (3 attempts)
- Run the script again - it will skip already-inserted data

### ❌ Database permission error

**Solution:**
- Make sure you ran `supabase_islamic_content.sql` first
- Check that RLS policies were created
- Verify your Supabase credentials in `.env.local`

### ❌ Tafsir button still doesn't show

**Solution:**
- Clear browser cache and reload
- Check browser console for errors
- Verify data exists: `SELECT COUNT(*) FROM tafsir_ayahs WHERE edition_slug = 'en-tafisr-ibn-kathir' AND surah_number = 1;`
- Should return `7` (Al-Fatiha has 7 ayahs)

### ❌ Hadiths page shows "No collections"

**Solution:**
- Check browser console for errors
- Verify data exists: `SELECT * FROM hadith_collections LIMIT 5;`
- Should return 6 collections
- Make sure you completed Step 3

### ⏱️  Scripts taking too long

**Normal behavior:**
- Tafsir: 30-60 minutes (18,000 records)
- Hadith: 45-90 minutes (25,000+ records)
- Total: ~1.5-2.5 hours

**To speed up:**
- Reduce editions in the scripts
- Edit `PRIORITY_EDITIONS` or `PRIORITY_COLLECTIONS` arrays
- Download fewer collections

---

## Next Steps

### Add More Content

To add more tafsir editions or hadith collections:

1. **Edit the scripts:**

   `scripts/populate_tafsir.ts`:
   ```typescript
   const PRIORITY_EDITIONS = [
     'en-tafisr-ibn-kathir',
     'en-tafsir-maarif-ul-quran',
     'en-tafsir-al-jalalayn',
     'ar-tafsir-al-tabari', // Add Arabic tafsir
   ];
   ```

   `scripts/populate_hadiths.ts`:
   ```typescript
   const PRIORITY_COLLECTIONS = [
     'eng-bukhari',
     'eng-muslim',
     'eng-abudawud',
     'eng-tirmidhi',
     'eng-nasai',
     'eng-ibnmajah',
     'ara-bukhari', // Add Arabic Bukhari
   ];
   ```

2. **Run the scripts again**
   ```bash
   npx tsx scripts/populate_tafsir.ts
   npx tsx scripts/populate_hadiths.ts
   ```

   The scripts use `upsert`, so existing data won't be duplicated.

### Enable Tafsir Selection UI

Future enhancement: Add a dropdown in the Quran page to let users choose which tafsir edition to display.

---

## Benefits of This Approach

✅ **No CORS issues** - Data stored in your own database  
✅ **Faster loading** - No external API calls  
✅ **Offline capable** - Data cached locally  
✅ **Full control** - Choose which content to include  
✅ **Searchable** - Full-text search built-in  
✅ **Scalable** - Add more editions/collections anytime  

---

## Storage Requirements

### Supabase Free Tier (500MB)

**Current usage:**
- Tafsir (3 editions): ~50MB
- Hadiths (6 collections): ~40MB
- **Total: ~90MB** ✅ Well within free tier

**With all content:**
- Tafsir (27 editions): ~450MB
- Hadiths (20+ collections): ~150MB
- **Total: ~600MB** (requires paid plan)

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs in the Dashboard
3. Verify the SQL schema was applied correctly
4. Ensure `.env.local` has correct Supabase credentials

---

## Summary

1. ✅ Apply SQL schema to Supabase
2. ✅ Run `npx tsx scripts/populate_tafsir.ts`
3. ✅ Run `npx tsx scripts/populate_hadiths.ts`
4. ✅ Verify data in Supabase
5. ✅ Test the app - tafsir and hadiths should now work!

**Estimated total time:** 1.5-2.5 hours of automated downloading
