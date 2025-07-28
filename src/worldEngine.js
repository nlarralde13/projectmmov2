import { getSettings } from './configLoader.js';
import { getRegionBounds } from './utils/regionUtils.js';
import { generateChunks } from './utils/chunkUtils.js';
import regionMap from '../public/regionMap.json' assert { type: 'json' };

/**
 * Generates a new world using current settings.
 * Returns an object containing the biomeMap and chunks.
 */
export function generateWorldFromRegionMap() {
  const settings = getSettings();
  const width = settings.worldWidth || 100;
  const height = settings.worldHeight || 100;

  // Step 1: Generate a blank world filled with water tiles
  const biomeMap = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      type: 'water',
      elevation: 0,
    }))
  );

  console.log(`[WorldEngine] 🌍 Generated ${width}x${height} world filled with water.`);

  // Step 2: Create world chunks
  const chunks = generateChunks(biomeMap, settings.gridChunkSize || 10);

  return {
    biomeMap,
    chunks,
    width,
    height,
  };
}
