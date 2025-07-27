import { pickWeightedBiome } from './utils/biomeUtils.js';

// Internal counter for labeling blobs
let blobCounter = 0;

/**
 * Adds a structured landmass blob to the terrainMap.
 *
 * Supports:
 * - Falloff-based elevation shaping
 * - Biome zoning (center vs edge)
 * - Tagging and blob metadata
 *
 * @param {Array<Array<Object>>} terrainMap - 2D grid of tiles
 * @param {number} cx - center X of the blob
 * @param {number} cy - center Y of the blob
 * @param {number} radius - approximate blob radius
 * @param {Object} biomeWeights - center-biased biome mix (e.g. mountains, forest)
 * @param {Object} [options] - blob generation template
 * @param {string} [options.type] - 'continent' | 'island' | 'archipelago'
 * @param {Object} [options.edgeBiomes] - optional edge biome weights
 * @param {string[]} [options.tags] - tags like 'mainland', 'volcanic'
 */
export function addLandmassBlob(
  terrainMap,
  cx,
  cy,
  radius,
  biomeWeights,
  options = {}
) {
  const height = terrainMap.length;
  const width = terrainMap[0].length;

  const {
    type = 'continent',
    edgeBiomes = biomeWeights,
    tags = []
  } = options;

  const blobId = `blob_${blobCounter++}`;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = cx + dx;
      const y = cy + dy;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / radius;

      // Add some falloff randomness
      const falloff = 1 - normDist + (Math.random() * 0.2 - 0.1);

      if (falloff <= 0.25) continue; // skip outermost edge

      const tile = terrainMap[y][x];

      // 🌊 Replace only water tiles
      if (tile.biome === 'water') {
        // 📏 Elevation: higher near center, lower near edge
        const elevation = clamp(0.3 + (falloff * 0.7), 0.1, 1.0);

        // 🧭 Biome: use edge-biomes near edge, core-biomes near center
        const useCore = normDist < 0.5;
        const biome = useCore
          ? pickWeightedBiome(biomeWeights)
          : pickWeightedBiome(edgeBiomes);

        tile.elevation = elevation;
        tile.biome = biome;

        // 🏷️ Tag + track metadata
        tile.tags.push(...tags, 'land', type);
        tile.meta = {
          blobId,
          distFromCenter: parseFloat(normDist.toFixed(2)),
          falloff: parseFloat(falloff.toFixed(2)),
          blobType: type
        };
      }
    }
  }

  console.log(`[BlobGen] 🏔️ Generated ${type} ${blobId} at (${cx}, ${cy})`);
}

/**
 * Clamp a number between min and max.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
