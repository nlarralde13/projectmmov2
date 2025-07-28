// --- Import core dependencies and utilities ---
import { getSettings } from './configLoader.js';
import { generateChunks } from './utils/chunkUtils.js';
import Ajv from 'ajv'; // JSON schema validator

/**
 * Generates a basic world object filled with default 'water' tiles.
 * This is a stub and will later use regionMap + rules to create landmasses.
 *
 * @param {Object} regionMap - Region-level config with landmass sizes
 * @param {Object} settings - Global settings loaded from settings.json
 * @param {string} seedID - Unique seed identifier for this world
 * @returns {Object} - World object including biome and terrain maps
 */
function generateWorld(regionMap, settings, seedID) {
  const width = settings.worldWidth || 25;
  const height = settings.worldHeight || 25;

  const biomeMap = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'water')
  );

  const terrainMap = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      biome: 'water',
      elevation: 0,
      tags: [],
      meta: {}
    }))
  );

  return {
    seedID,
    biomeMap,
    terrainMap,
    tags: [],
    generatedAt: new Date().toISOString()
  };
}

/**
 * Loads and validates the regionMap.json file.
 *
 * @returns {Object|null} - Parsed region map or null if validation fails
 */
export async function loadRegionMap() {
  try {
    const res = await fetch('/regionMap.json');
    const json = await res.json();

    const ajv = new Ajv();
    const schema = {
      type: 'object',
      patternProperties: {
        '^[A-Z]{1,2}$': {
          type: 'object',
          properties: {
            landmassSize: { type: 'string', enum: ['large', 'medium', 'small'] }
          },
          required: ['landmassSize']
        }
      }
    };

    const validate = ajv.compile(schema);
    if (!validate(json)) {
      console.error('[WorldEngine] ❌ regionMap.json failed validation:', validate.errors);
      return null;
    }

    console.log('[WorldEngine] ✅ regionMap.json passed AJV validation.');
    return json;
  } catch (err) {
    console.error('[WorldEngine] ❌ Failed to load regionMap.json:', err);
    return null;
  }
}

/**
 * Builds a new world object using current settings and region map.
 * Returns only the world + chunks (rendering is done in main.js).
 *
 * @param {string} seedID - New seed identifier
 * @returns {Object|null} - { world, chunks } or null on failure
 */
export async function generateWorldFromRegionMap(seedID) {
  const settings = getSettings();
  const regionMap = await loadRegionMap();
  if (!regionMap) return null;

  const world = generateWorld(regionMap, settings, seedID);
  const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);

  return {
    world,
    chunks
  };
}
/**
 * Wrapper to load a seed file based on its ID.
 * @param {string} seedID - Unique seed identifier
 * @returns {Promise<Object|null>} - Parsed world object or null if not found
 */
export async function loadWorldFromSeed(seedID) {
  const seedPath = `/seeds/seed_${seedID}.json`;
  return await loadWorldFromJSON(seedPath);
}

/**
 * Triggers a browser download of the current world as a .json file.
 */
export function saveWorldToJSON(world, seedID) {
  const json = JSON.stringify(world, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seed_${seedID}.json`;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`[WorldEngine] 💾 World saved as seed_${seedID}.json`);
}

/**
 * Loads a world object from a previously saved JSON file.
 */
export async function loadWorldFromJSON(url) {
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log('[WorldEngine] ✅ World loaded from:', url);
    return json;
  } catch (err) {
    console.error(`[WorldEngine] ❌ Failed to load world from ${url}:`, err);
    return null;
  }
}

/**
 * Generates a short, random Base32-style seed ID.
 */
export function generateSeedID(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return id;
}
