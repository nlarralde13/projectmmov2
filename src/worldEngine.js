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
 * Generates the world map using base water and region-driven landmass blobs.
 * @param {Object} biomeRules
 * @returns {Object} { terrainMap, biomeMap, heightMap, meta }
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

    // Initialize all tiles as ocean
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

    console.log('[WorldEngine] 🌊 Initialized base map as water');

    // Landmass configuration per region
    const regionLandmassConfig = {
        NW: { count: 1, radius: 30, type: 'archipelago' },
        N:  { count: 3, radius: 12, type: 'continent' },
        NE: { count: 2, radius: 10, type: 'island' },
        W:  { count: 3, radius: 12, type: 'continent' },
        C:  { count: 1, radius: 50, type: 'continent' },
        E:  { count: 3, radius: 12, type: 'continent' },
        SW: { count: 3, radius: 10, type: 'island' },
        S:  { count: 3, radius: 12, type: 'continent' },
        SE: { count: 4, radius: 9,  type: 'archipelago' }
    };

    // Place landmasses
    for (const [regionKey, config] of Object.entries(regionLandmassConfig)) {
        const rule = biomeRules[regionKey];
        if (!rule) continue;

        for (let i = 0; i < config.count; i++) {
            const maxTries = 25;
            let placed = false;

            for (let attempt = 0; attempt < maxTries && !placed; attempt++) {
                const cx = Math.floor(Math.random() * width);
                const cy = Math.floor(Math.random() * height);
                if (getRegionName(cx, cy, width, height) === regionKey) {
                    addLandmassBlob(
                        terrainMap,
                        cx,
                        cy,
                        config.radius,
                        rule.biomeWeights,
                        {
                            type: config.type || 'continent',
                            edgeBiomes: config.edgeBiomes || { plains: 0.8, beach: 0.2 },
                            tags: ['mainland', regionKey]
                        }
                    );
                    placed = true;
                }
            }
        }
    }

    console.log('[WorldEngine] 🏝️ Landmass blobs generated.');

    // Final pass: fill biomeMap and heightMap from terrain
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
 * Splits the map into logical chunks for lazy rendering, etc.
 * @param {Array<Array<string>>} biomeMap
 * @param {number} chunkSize
 * @returns {Array<Object>} chunk metadata
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
