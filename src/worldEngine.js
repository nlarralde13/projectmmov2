// --- Import core dependencies and utilities ---
import { getSettings } from './configLoader.js';
import { generateChunks } from './utils/chunkUtils.js';
import { renderMap } from './ui/renderMap.js';
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

    // Initialize biome map (used for visual rendering)
    const biomeMap = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 'water')
    );

    // Initialize terrain map (used for gameplay logic)
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
        tags: [], // world-level metadata
        generatedAt: new Date().toISOString()
    };
}

/**
 * Loads and validates the regionMap.json file.
 * This defines landmass size per region (e.g. NW, NE, C, etc.).
 *
 * @returns {Object|null} - Parsed region map or null if validation fails
 */
export async function loadRegionMap() {
    try {
        const res = await fetch('/regionMap.json');
        const json = await res.json();

        // Define validation schema
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
        const valid = validate(json);
        if (!valid) {
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
 * Builds a new world object using the current region map and settings,
 * and returns it alongside a rendered canvas and chunk metadata.
 *
 * @param {string} seedID - New seed identifier for this world
 * @returns {Object|null} - { world, canvas, chunks, draw } or null on failure
 */
export async function generateWorldFromRegionMap(seedID) {
    const settings = getSettings();
    const regionMap = await loadRegionMap();
    if (!regionMap) return null;

    const world = generateWorld(regionMap, settings, seedID);

    // Split world into renderable chunks and draw the map
    const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);
    const { canvas, draw } = renderMap(world.biomeMap, settings, chunks, settings.tileSize || 10);

    return {
        world,
        canvas,
        chunks,
        draw
    };
}

/**
 * Triggers a browser download of the current world as a .json file.
 *
 * @param {Object} world - World object to save
 * @param {string} seedID - Used for naming the saved file
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
 * Loads a saved world file from disk or server by URL.
 *
 * @param {string} url - Path to seed JSON file
 * @returns {Object|null} - Parsed world object or null on failure
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
 *
 * @param {number} length - Length of seed (default 16)
 * @returns {string} - New random seed ID
 */
export function generateSeedID(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Crockford base32
    let id = '';
    for (let i = 0; i < length; i++) {
        id += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return id;
}
