import { loadSettings, getSettings } from './configLoader.js';
import { loadRegionMap, generateWorld, generateChunks } from './worldEngine.js';
import { renderMap, enableChunkHoverStatic, enableTileClickHandler } from './ui/renderMap.js';


async function init() {
    // Load global settings from settings.json
    await loadSettings();
    const settings = getSettings();
    console.log('[Main] ✅ Settings loaded:', settings);

    // Load & validate your regionMap.json for map generation
    await loadRegionMap();
    const world = generateWorld();

    if (world) {
        console.log('[Main] ✅ World generated:', world);

        const tileSize = settings.tileSize || 10;
        const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);

        const { canvas, ctx } = renderMap(world.biomeMap, settings, chunks, tileSize);
        enableChunkHoverStatic(canvas, chunks, tileSize);
        enableTileClickHandler(canvas, world.biomeMap, tileSize);

        createResetButton(() => {
            const newWorld = generateWorld();
            const newChunks = generateChunks(newWorld.biomeMap, settings.gridChunkSize || 10);
            const result = renderMap(newWorld.biomeMap, settings, newChunks, tileSize);
            enableChunkHoverStatic(result.canvas, newChunks, tileSize);
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
