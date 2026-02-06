
const resourceId = 169;
const surah = 1;

async function testTafsir() {
    const url = `https://api.quran.com/api/v4/quran/tafsirs/${resourceId}?chapter_number=${surah}`;
    console.log("Fetching:", url);
    const res = await fetch(url);
    const data = await res.json();
    console.log("First verse tafsir:", data.tafsirs[0]);
}

testTafsir();
