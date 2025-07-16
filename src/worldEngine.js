import Ajv from 'ajv';
import schema from './regionMap.schema.json';

let regionMapData = {};
let validationErrors = [];

const ajv = new Ajv();

/**
 * Loads regionMap.json from public directory.
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
 * Uses AJV to validate regionMap.json against schema.
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
 * Same generator logic as before
 */
export function generateWorld() {
    if (!validateRegionMap()) {
        console.error('[WorldEngine] ❌ Cannot generate world: invalid config.');
        return null;
    }

    const { width, height } = regionMapData.dimensions;
    const heightMap = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => Math.random())
    );
    const biomeMap = heightMap.map(row =>
        row.map(h => (h > 0.5 ? 'grassland' : 'water'))
    );

    console.log('[WorldEngine] 🌍 Generated heightMap + biomeMap.');
    return { heightMap, biomeMap, meta: regionMapData };
}


/**
 * Generates logical chunk metadata from your biomeMap.
 * Returns an array of chunks, each with id and bounds.
 *
 * @param {Array<Array<string>>} biomeMap - your generated 2D map
 * @param {number} chunkSize - how many tiles wide/tall per chunk
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
