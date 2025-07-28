// === MAIN ENTRY POINT ===
// This file initializes the app, loads settings and world data,
// and renders the biome map using external modules.

import { loadSettings, getSettings } from './configLoader.js';
import {
  loadRegionMap,
  loadWorldFromJSON
} from './worldEngine.js';
import { renderMap } from './ui/renderMap.js';
import { enableChunkHoverStatic, enableTileClickHandler } from './ui/mapEvents.js';
import { loadBiomeRules } from './biomeRulesLoader.js';
import { generateChunks } from './utils/chunkUtils.js';
import { initializeContextMenu } from './ui/contextMenu.js';
import { floodFillConnectedWater } from './ui/floodFillConnectedWater.js';

import {
  isDevMode,
  createDevPanel,
  handleBiomeEdit
} from './devTools.js';

let world = null;
let settings = null;
let tileSize = 10;
let seedID = null;

// === Initialize Application ===
async function init() {
  // Load config and biome logic files
  await loadSettings();
  await loadBiomeRules();
  await loadRegionMap();

  settings = getSettings();
  tileSize = settings.tileSize || 10;

  // Determine which seed to load (URL or default)
  const defaultSeedID = 'R9LOTE2ECRYGYSXR';
  seedID = new URLSearchParams(window.location.search).get('seedID') || defaultSeedID;
  let seedPath = `/seeds/seed_${seedID}.json`;

  console.log(`[Main] 🌱 Loading world for seedID: ${seedID}`);
  console.log(`[Main] 🧪 Mode: ${isDevMode() ? 'DEV' : 'STANDARD'}`);

  // Load the world JSON
  world = await loadWorldFromJSON(seedPath);

  // Retry with default seed if load failed
  if (!world && seedID !== defaultSeedID) {
    console.warn(`[Main] ⚠️ World load failed. Falling back to default seed.`);
    const url = new URL(window.location);
    url.searchParams.set('seedID', defaultSeedID);
    window.history.replaceState({}, '', url);

    seedID = defaultSeedID;
    seedPath = `/seeds/seed_${defaultSeedID}.json`;
    world = await loadWorldFromJSON(seedPath);
  }

  if (!world) {
    console.error('[Main] ❌ No valid world could be loaded. Aborting.');
    return;
  }

  // Run any post-processing (e.g. water group tagging)
  floodFillConnectedWater(world.terrainMap);

  // Build layout and render canvas
  createMainLayout();
  renderWorld();

  // Initialize Dev UI if enabled
  createDevPanel(world, seedID, handleWorldUpdate);
}

// === Render World to Canvas ===
function renderWorld() {
  const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);
  const { canvas, draw } = renderMap(world.biomeMap, settings, chunks, tileSize);
  bindInteractions(canvas, world, chunks, draw);
}

// === Attach All Canvas Interactions ===
function bindInteractions(canvas, worldData, chunks, draw) {
  canvas.dataset.tileSize = tileSize;

  // Chunk and tile mouse events
  enableChunkHoverStatic(canvas, chunks, tileSize, worldData.biomeMap, draw);
  enableTileClickHandler(canvas, worldData.biomeMap, tileSize);

  // Right-click biome editing for dev mode
  initializeContextMenu(
    canvas,
    worldData.terrainMap,
    (tileInfo, biome) => {
      if (isDevMode()) {
        handleBiomeEdit(tileInfo, biome, draw, worldData);
      }
    },
    isDevMode() ? 'dev' : 'standard'
  );
}



// === Build Initial Page Layout ===
function createMainLayout() {
  const container = document.createElement('div');
  container.id = 'app-container';

  const viewport = document.createElement('div');
  viewport.id = 'viewport';

  const devPanel = document.createElement('div');
  devPanel.id = 'dev-panel';
  devPanel.innerHTML = `<h3>🛠 Dev Tools</h3>`;

  container.appendChild(viewport);
  container.appendChild(devPanel);
  document.body.appendChild(container);

  // 👇 If dev mode is active, unhide the panel
  if (isDevMode()) {
    devPanel.style.display = 'block';
  }
}

// === Update Callback for Dev Panel Regeneration ===
function handleWorldUpdate({ world: newWorld, chunks, draw, canvas }) {
  world = newWorld;
  bindInteractions(canvas, world, chunks, draw);
}

init();
