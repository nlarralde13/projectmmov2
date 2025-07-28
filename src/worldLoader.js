/**
 * Saves the given world object as a downloadable JSON file.
 * @param {Object} world - The world object containing terrainMap, biomeMap, heightMap, and meta
 */
export function saveWorldToJSON(world, seedID = null) {
    if (!world || !world.terrainMap) {
        console.warn('[WorldLoader] ⚠️ No valid world object to save.');
        return;
    }

    const finalSeedID = seedID || generateSeedID();
    const data = {
        seedID: finalSeedID,
        terrainMap: world.terrainMap,
        biomeMap: world.biomeMap,
        heightMap: world.heightMap,
        meta: world.meta
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `seed_${finalSeedID}.json`;

    link.href = url;
    link.download = filename;
    link.click();

    console.log(`[SaveWorld] 💾 Seed ID: ${finalSeedID}`);
    console.log(`[SaveWorld] ✅ World exported as ${filename}`);
}


/**
 * Loads a world JSON from a remote URL (e.g., /seeds/seed_demo.json).
 * @param {string} url - Path to the seed JSON file
 * @returns {Promise<Object|null>} - Parsed world object or null on failure
 */
export async function loadWorldFromJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        // Basic validation check
        if (!data.terrainMap || !data.biomeMap || !data.heightMap || !data.meta) {
            console.error('[WorldLoader] ❌ Invalid world format.');
            return null;
        }

        console.log(`[WorldLoader] ✅ Loaded world from ${url}`);
        return data;

    } catch (err) {
        console.error(`[WorldLoader] ❌ Failed to load world from ${url}:`, err);
        return null;
    }
}

export function generateSeedID(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let seed = '';
  for (let i = 0; i < length; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return seed;
}
