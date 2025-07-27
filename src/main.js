import { loadSettings, getSettings } from './configLoader.js';
import { loadRegionMap, generateWorld, generateChunks } from './worldEngine.js';
import { renderMap, enableChunkHoverStatic, enableTileClickHandler } from './ui/renderMap.js';
import { loadBiomeRules, getBiomeRules } from './biomeRulesLoader.js';
import { floodFillConnectedWater } from './ui/floodFillConnectedWater.js';



async function init() {
    // Load config and rules
    await loadSettings();
    await loadBiomeRules();
    await loadRegionMap();

    const settings = getSettings();
    const biomeRules = getBiomeRules();

    // Generate world now that regionMap is loaded
    const world = generateWorld(biomeRules);

    if (world) {
        floodFillConnectedWater(world.terrainMap);
        console.log('[Main] ✅ World generated:', world);

        const tileSize = settings.tileSize || 10;
        const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);

        const { canvas, ctx } = renderMap(world.biomeMap, settings, chunks, tileSize);
        enableChunkHoverStatic(canvas, chunks, tileSize, world.biomeMap);
        enableTileClickHandler(canvas, world.biomeMap, tileSize);

        createResetButton(() => {
            const newWorld = generateWorld(biomeRules);
            const newChunks = generateChunks(newWorld.biomeMap, settings.gridChunkSize || 10);
            const result = renderMap(newWorld.biomeMap, settings, newChunks, tileSize);
            enableChunkHoverStatic(result.canvas, newChunks, tileSize, newWorld.biomeMap);
            enableTileClickHandler(result.canvas, newWorld.biomeMap, tileSize);
        });

    } else {
        console.error('[Main] ❌ Failed to generate world.');
    }
}


init();


/**
 * Creates a simple button on the page that runs your callback on click.
 * You can reuse this for "Reset World" or future dev tools.
 *
 * @param {Function} onClick
 */
function createResetButton(onClick) {
    const btn = document.createElement('button');
    btn.textContent = "Reset & Regenerate World";
    btn.style.margin = "1em";
    btn.onclick = onClick;
    document.body.appendChild(btn);
    console.log('[UI] ✅ Reset button created.');
}

function isDevMode() {
    return new URLSearchParams(window.location.search).get('devMode') === '1';
}
