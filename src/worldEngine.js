import { getSettings } from './configLoader.js';
import { generateChunks } from './utils/chunkUtils.js';
import { renderMap } from './ui/renderMap.js';

import Ajv from 'ajv';

function generateWorld(regionMap, settings, seedID) {
    const width = parseInt(settings.worldWidth) || 100;
    const height = parseInt(settings.worldHeight) || 100;

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

    console.log(`[WorldEngine] 🌍 Generated ${width}x${height} world filled with water.`);

    return {
        seedID,
        biomeMap,
        terrainMap,
        tags: [],
        generatedAt: new Date().toISOString()
    };
}


// Validate and load regionMap.json
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

// Generate and render a new world from regionMap + seed
export async function generateWorldFromRegionMap(seedID) {
    const settings = getSettings();
    const regionMap = await loadRegionMap();
    if (!regionMap) return null;

    const world = generateWorld(regionMap, settings, seedID);
    const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);
    const { canvas, draw } = renderMap(world.biomeMap, settings, chunks, settings.tileSize || 10);

    return {
        world,
        canvas,
        chunks,
        draw
    };
}

// Save world to downloadable JSON
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

// Load world JSON from disk or URL
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

// Generate short seed ID
export function generateSeedID(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return id;
}
