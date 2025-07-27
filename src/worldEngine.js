import Ajv from 'ajv';
import schema from './regionMap.schema.json';
import { getRegionName } from './ui/renderMap.js';
import { pickWeightedBiome } from './biomeUtils.js';
import { addLandmassBlob } from './landmassUtils.js';

let regionMapData = {};
let validationErrors = [];

const ajv = new Ajv();

/**
 * Loads regionMap.json from public directory with cache buster
 */
export async function loadRegionMap() {
    try {
        const response = await fetch(`/regionMap.json?nocache=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        regionMapData = await response.json();
        console.log('[WorldEngine] ✅ Loaded regionMap.json:', regionMapData);
    } catch (err) {
        console.error('[WorldEngine] ❌ Failed to load regionMap.json:', err);
        regionMapData = {};
    }
}

/**
 * Validates the region map file using AJV and the provided schema.
 */
export function validateRegionMap() {
    const validate = ajv.compile(schema);
    const valid = validate(regionMapData);
    if (!valid) {
        validationErrors = validate.errors;
        console.error('[WorldEngine] ❌ regionMap.json failed validation:', validationErrors);
    } else {
        console.log('[WorldEngine] ✅ regionMap.json passed AJV validation.');
    }
    return valid;
}

/**
 * Generates a world using per-region biome rules and landmass blob logic.
 *
 * @param {Object} biomeRules - parsed biome rules per 3x3 region
 * @returns {{terrainMap, biomeMap, heightMap, meta}}
 */
export function generateWorld(biomeRules = {}) {
    if (!validateRegionMap()) {
        console.error('[WorldEngine] ❌ Cannot generate world: invalid config.');
        return null;
    }

    if (!regionMapData || !regionMapData.dimensions) {
        console.error('[WorldEngine] ❌ regionMapData is missing or incomplete.');
        return null;
    }

    const { width, height } = regionMapData.dimensions;

    const terrainMap = [];
    const biomeMap = [];
    const heightMap = [];

    // 🌊 Step 1: Start with all tiles as water
    for (let y = 0; y < height; y++) {
        terrainMap[y] = [];
        biomeMap[y] = [];
        heightMap[y] = [];

        for (let x = 0; x < width; x++) {
            const region = getRegionName(x, y, width, height);
            const tile = {
                x,
                y,
                region,
                elevation: 0,
                biome: 'water',
                tags: [],
                resources: {},
                actions: []
            };
            terrainMap[y][x] = tile;
            biomeMap[y][x] = 'water';
            heightMap[y][x] = 0;
        }
    }

    console.log('[WorldEngine] 🌊 Initialized map as ocean');

    // 🗺️ Step 2: Region-configurable landmass blob generation
    const regionLandmassConfig = {
        NW: { count: 10, radius: 10 },
        N:  { count: 3, radius: 12 },
        NE: { count: 2, radius: 10 },
        W:  { count: 3, radius: 12 },
        C:  { count: 1, radius: 50 },
        E:  { count: 3, radius: 12 },
        SW: { count: 2, radius: 10 },
        S:  { count: 3, radius: 12 },
        SE: { count: 2, radius: 10 }
    };

    for (const [regionKey, config] of Object.entries(regionLandmassConfig)) {
        const rule = biomeRules[regionKey];
        if (!rule) continue;

        for (let i = 0; i < config.count; i++) {
            const tries = 25;
            let placed = false;

            for (let attempt = 0; attempt < tries && !placed; attempt++) {
                const cx = Math.floor(Math.random() * width);
                const cy = Math.floor(Math.random() * height);
                if (getRegionName(cx, cy, width, height) === regionKey) {
                    addLandmassBlob(terrainMap, cx, cy, config.radius, rule.biomeWeights, ['mainland']);
                    placed = true;
                }
            }
        }
    }

    console.log('[WorldEngine] 🏝️ Landmass generation complete.');

    // 🗺️ Step 3: Update biomeMap and elevationMap from terrainMap
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = terrainMap[y][x];
            biomeMap[y][x] = tile.biome;
            heightMap[y][x] = tile.elevation;
        }
    }

    return {
        terrainMap,
        biomeMap,
        heightMap,
        meta: regionMapData
    };
}

/**
 * Generates logical chunk metadata from biomeMap.
 */
export function generateChunks(biomeMap, chunkSize = 100) {
    const height = biomeMap.length;
    const width = biomeMap[0].length;
    const chunks = [];

    let chunkId = 0;
    for (let y = 0; y < height; y += chunkSize) {
        for (let x = 0; x < width; x += chunkSize) {
            const endX = Math.min(x + chunkSize - 1, width - 1);
            const endY = Math.min(y + chunkSize - 1, height - 1);

            chunks.push({
                id: `chunk_${chunkId++}`,
                bounds: { startX: x, startY: y, endX, endY }
            });
        }
    }

    console.log(`[WorldEngine] ✅ Generated ${chunks.length} chunks.`);
    return chunks;
}
