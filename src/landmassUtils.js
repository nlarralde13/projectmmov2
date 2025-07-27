import { pickWeightedBiome } from './biomeUtils.js';

/**
 * Adds an irregular landmass blob to the terrainMap centered at (cx, cy).
 * Replaces water tiles within a radius, using falloff and biome weights.
 *
 * @param {Array<Array<Object>>} terrainMap
 * @param {number} cx - center X tile
 * @param {number} cy - center Y tile
 * @param {number} radius - rough blob size in tiles
 * @param {Object} biomeWeights - biome weight map (e.g. {plains: 0.5, forest: 0.5})
 * @param {string[]} [tags] - optional array of tags like ['mainland']
 */
export function addLandmassBlob(terrainMap, cx, cy, radius, biomeWeights, tags = []) {
  const height = terrainMap.length;
  const width = terrainMap[0].length;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = cx + dx;
      const y = cy + dy;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const falloff = 1 - (distance / radius) + (Math.random() * 0.2 - 0.1); // randomness

      if (falloff > 0.3) {
        const tile = terrainMap[y][x];
        if (tile.biome === 'water') {
          tile.biome = pickWeightedBiome(biomeWeights);
          tile.tags.push(...tags);
        }
      }
    }
  }
}
