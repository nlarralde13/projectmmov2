import { loadSettings, getSettings } from './configLoader.js';
import { loadRegionMap, generateWorld, generateChunks } from './worldEngine.js';
import { renderMap, enableChunkHoverStatic, enableTileClickHandler } from './ui/renderMap.js';
import { loadBiomeRules, getBiomeRules } from './biomeRulesLoader.js';
import { floodFillConnectedWater } from './ui/floodFillConnectedWater.js';
import { initializeContextMenu } from './ui/contextMenu.js';
import { saveWorldToJSON, loadWorldFromJSON } from './worldLoader.js';

let world = null;
let settings = null;
let tileSize = 10;
let seedID = null;
let devMode = false;

async function init() {
    await loadSettings();
    await loadBiomeRules();
    await loadRegionMap();

    settings = getSettings();
    tileSize = settings.tileSize || 10;
    devMode = isDevMode();

    // Load seedID or default fallback
    seedID = new URLSearchParams(window.location.search).get('seedID');
    if (!seedID) {
        seedID = 'R9LOTE2ECRYGYSXR';
        const url = new URL(window.location);
        url.searchParams.set('seedID', seedID);
        window.history.replaceState({}, '', url);
        console.log(`[Main] 🌱 No seedID provided. Using default: ${seedID}`);
    } else {
        console.log(`[Main] 🌱 Using seedID from URL: ${seedID}`);
    }

    console.log(`[Main] 🚩 Current Mode: ${devMode ? 'DEV' : 'STANDARD'}`);

    // Load saved world
    const seedPath = `/seeds/seed_${seedID}.json`;
    world = await loadWorldFromJSON(seedPath);

    if (!world) {
        console.error('[Main] ❌ Failed to load world.');
        return;
    }

    floodFillConnectedWater(world.terrainMap);
    console.log('[Main] ✅ World ready:', world);

    renderWorld();
    createResetButton(() => location.reload());
    createSaveButton(() => saveWorldToJSON(world, seedID));
}

function renderWorld() {
    const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);
    const { canvas, ctx } = renderMap(world.biomeMap, settings, chunks, tileSize);

    canvas.dataset.tileSize = tileSize;
    enableChunkHoverStatic(canvas, chunks, tileSize, world.biomeMap);
    enableTileClickHandler(canvas, world.biomeMap, tileSize);

    initializeContextMenu(
        canvas,
        world.terrainMap,
        (tile, biome) => {
            if (devMode) {
                tile.biome = biome;
                world.biomeMap[tile.y][tile.x] = biome; // <--- ✅ Sync for render
                console.log(`[Editor] ✅ Biome set to '${biome}' at (${tile.x}, ${tile.y})`);
                renderWorld(); // Trigger full rerender
    }
},

        devMode ? 'dev' : 'standard'
    );
}

function createResetButton(onClick) {
    const btn = document.createElement('button');
    btn.textContent = "Reset & Regenerate World";
    btn.style.margin = "1em";
    btn.onclick = onClick;
    document.body.appendChild(btn);
    console.log('[UI] ✅ Reset button created.');
}

function createSaveButton(onClick) {
    const btn = document.createElement('button');
    btn.textContent = "💾 Save World";
    btn.style.margin = "1em";
    btn.onclick = onClick;
    document.body.appendChild(btn);
    console.log('[UI] ✅ Save button created.');
}

function isDevMode() {
    return new URLSearchParams(window.location.search).get('devMode') === '1';
}

init();
