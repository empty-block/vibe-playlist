/**
 * Test script for Odesli resolver
 * Tests song.link URL resolution to playable platforms
 */

// Test URLs from database
const testUrls = [
  'https://song.link/hz86xcgmrfbkm',
  'https://song.link/s/0DrWHtjw9T3i7gY637XqMo',
  'https://song.link/s/1W5XugQJGhnSATMI5n002M'
];

async function testOdesliResolution(url) {
  console.log(`\n🔍 Testing: ${url}`);

  try {
    const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`❌ API returned ${response.status}`);
      return;
    }

    const data = await response.json();

    // Extract metadata
    const entityId = data.entityUniqueId;
    const entity = data.entitiesByUniqueId?.[entityId];

    console.log(`📝 Metadata:`, {
      title: entity?.title,
      artist: entity?.artistName
    });

    // Check available platforms
    const links = data.linksByPlatform;
    console.log(`🎵 Available platforms:`);

    if (links.youtube) {
      const videoId = new URL(links.youtube.url).searchParams.get('v');
      console.log(`  ✅ YouTube: ${videoId || links.youtube.url}`);
    } else {
      console.log(`  ❌ YouTube: Not available`);
    }

    if (links.spotify) {
      const match = links.spotify.url.match(/\/track\/([a-zA-Z0-9]+)/);
      const trackId = match ? match[1] : links.spotify.url;
      console.log(`  ✅ Spotify: ${trackId}`);
    } else {
      console.log(`  ❌ Spotify: Not available`);
    }

    if (links.soundcloud) {
      console.log(`  ✅ SoundCloud: ${links.soundcloud.url}`);
    } else {
      console.log(`  ❌ SoundCloud: Not available`);
    }

    // Determine resolution priority
    if (links.youtube) {
      console.log(`\n✨ Would resolve to: YouTube (Priority 1)`);
    } else if (links.spotify) {
      console.log(`\n✨ Would resolve to: Spotify (Priority 2)`);
    } else if (links.soundcloud) {
      console.log(`\n✨ Would resolve to: SoundCloud (Priority 3)`);
    } else {
      console.log(`\n⚠️  No supported platforms found`);
    }

  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing Odesli API Resolution\n');
  console.log('=' .repeat(50));

  for (const url of testUrls) {
    await testOdesliResolution(url);
    console.log('=' .repeat(50));

    // Rate limiting: wait 7 seconds between requests (10 req/min = 1 every 6 seconds)
    if (testUrls.indexOf(url) < testUrls.length - 1) {
      console.log('⏳ Waiting 7 seconds for rate limit...');
      await new Promise(resolve => setTimeout(resolve, 7000));
    }
  }

  console.log('\n✅ All tests complete!');
}

runTests().catch(console.error);
