// biomeUtils.js

/**
 * Picks a random biome from a weighted dictionary
 * @param {Object} weights - e.g., { forest: 3, tundra: 1 }
 * @returns {string} selected biome
 */
export function pickWeightedBiome(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [_, w]) => sum + w, 0);
  const rand = Math.random() * total;

  let cumulative = 0;
  for (const [biome, weight] of entries) {
    cumulative += weight;
    if (rand <= cumulative) return biome;
  }

  return entries[0][0]; // fallback
}

/**
 * Picks a random biome from an array of possible options (equal weight)
 * @param {string[]} biasList
 * @returns {string}
 */
export function pickRandomBiome(biasList) {
  if (!Array.isArray(biasList) || biasList.length === 0) return 'plains';
  const index = Math.floor(Math.random() * biasList.length);
  return biasList[index];
}

/**
 * Gets a randomized elevation based on region's profile
 * @param {string} profile - 'flat', 'hilly', or 'mountainous'
 * @returns {number} elevation value
 */
export function getElevationByProfile(profile) {
  switch (profile) {
    case 'flat':
      return Math.floor(Math.random() * 3); // 0–2
    case 'hilly':
      return Math.floor(Math.random() * 10); // 0–9
    case 'mountainous':
      return 10 + Math.floor(Math.random() * 15); // 10–24
    default:
      return 1;
  }
}
