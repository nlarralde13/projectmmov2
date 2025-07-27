// biomeRulesLoader.js
// --------------------------------------------------
// Loads biomeRules.json and exposes it via getBiomeRules()
// Handles errors and caches the loaded rules.

let biomeRules = {};  // Store loaded rules

/**
 * Loads biomeRules.json from the public directory with a cache buster.
 */
export async function loadBiomeRules() {
  try {
    const response = await fetch(`/biomeRules.json?nocache=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    biomeRules = await response.json();
    console.log('[BiomeRulesLoader] ✅ Loaded biomeRules.json');
    console.table(biomeRules);
  } catch (err) {
    console.error('[BiomeRulesLoader] ❌ Failed to load biomeRules.json:', err);
    biomeRules = {};  // fallback to empty
  }
}

/**
 * Returns the loaded biome rules.
 */
export function getBiomeRules() {
  return biomeRules;
}
