// --- Imports: Load core modules for config, world logic, rendering, and UI ---
import { loadSettings, getSettings } from './configLoader.js';
import {
  loadRegionMap,
  generateWorldFromRegionMap,
  saveWorldToJSON,
  loadWorldFromJSON,
  generateSeedID
} from './worldEngine.js';
import { renderMap } from './ui/renderMap.js';
import { enableChunkHoverStatic, enableTileClickHandler } from './ui/mapEvents.js';
import { loadBiomeRules } from './biomeRulesLoader.js';
import { generateChunks } from './utils/chunkUtils.js';
import { initializeContextMenu } from './ui/contextMenu.js';
import { floodFillConnectedWater } from './ui/floodFillConnectedWater.js';

// --- Global State Variables ---
let world = null;
let settings = null;
let tileSize = 10;
let seedID = null;
let devMode = false;

// --- App Initialization Entry Point ---
async function init() {
  // Load core config files and region rules
  await loadSettings();
  await loadBiomeRules();
  await loadRegionMap();

  // Apply loaded settings
  settings = getSettings();
  tileSize = settings.tileSize || 10;
  devMode = isDevMode();

  // Determine seedID from query param or fall back to default
  const defaultSeedID = 'R9LOTE2ECRYGYSXR';
  seedID = new URLSearchParams(window.location.search).get('seedID') || defaultSeedID;
  let seedPath = `/seeds/seed_${seedID}.json`;

  console.log(`[Main] 🌱 Attempting to load world with seedID: ${seedID}`);
  console.log(`[Main] 🚩 Current Mode: ${devMode ? 'DEV' : 'STANDARD'}`);

  // Try loading world from JSON
  world = await loadWorldFromJSON(seedPath);

  // If failed, try default seed
  if (!world && seedID !== defaultSeedID) {
    console.warn(`[Main] ⚠️ Failed to load world from seedID: ${seedID}. Falling back to default seed.`);
    const url = new URL(window.location);
    url.searchParams.set('seedID', defaultSeedID);
    window.history.replaceState({}, '', url);

    seedID = defaultSeedID;
    seedPath = `/seeds/seed_${defaultSeedID}.json`;
    world = await loadWorldFromJSON(seedPath);
  }

  // Abort if loading still failed
  if (!world) {
    console.error('[Main] ❌ Failed to load any valid world. Aborting.');
    return;
  }

  // Optional pass to mark connected water bodies
  floodFillConnectedWater(world.terrainMap);

  // Build DOM layout, render world, and initialize dev panel
  createMainLayout();
  renderWorld();
  createDevPanel(world, seedID);
}

// --- Main Render Pipeline ---
function renderWorld() {
  const chunks = generateChunks(world.biomeMap, settings.gridChunkSize || 10);
  const { canvas, draw } = renderMap(world.biomeMap, settings, chunks, tileSize);
  bindInteractions(canvas, world, chunks, draw);
}

// --- Attach UI Interactions ---
function bindInteractions(canvas, worldData, chunks, draw) {
  canvas.dataset.tileSize = tileSize;

  // Enable dev or standard hover/click handlers
  enableChunkHoverStatic(canvas, chunks, tileSize, worldData.biomeMap, draw);
  enableTileClickHandler(canvas, worldData.biomeMap, tileSize);

  // Right-click context menu for editing (dev only)
  initializeContextMenu(
    canvas,
    worldData.terrainMap,
    (tileInfo, biome) => {
      const { x, y, tile } = tileInfo;
      const map = worldData.biomeMap;

      if (
        devMode &&
        typeof x === 'number' && typeof y === 'number' &&
        y >= 0 && y < map.length &&
        x >= 0 && x < map[0].length
      ) {
        tile.biome = biome;
        map[y][x] = biome;
        console.log(`[Editor] ✅ Biome set to '${biome}' at (${x}, ${y})`);
        draw();
      } else {
        console.warn('[Editor] ⚠️ Invalid tile or coordinates:', tileInfo);
      }
    },
    devMode ? 'dev' : 'standard'
  );
}

// --- Build App DOM Structure ---
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
}

// --- Dev Panel: World Controls ---
function createDevPanel(currentWorld, currentSeedID) {
  if (!isDevMode()) return;

  const panel = document.getElementById('dev-panel');
  if (!panel) return;

  // Regenerate world with new seed
  const regenBtn = document.createElement('button');
  regenBtn.textContent = '🌍 Generate New World';
  regenBtn.onclick = async () => {
    const confirmed = confirm("Are you sure?");
    if (!confirmed) return;

    const newSeedID = generateSeedID();
    const newURL = `${window.location.origin}${window.location.pathname}?seedID=${newSeedID}&devMode=1`;
    window.history.pushState({}, '', newURL);

    const result = await generateWorldFromRegionMap(newSeedID);
    if (!result) return;

    world = result.world;
    seedID = newSeedID;

    bindInteractions(result.canvas, world, result.chunks, result.draw);
  };

  // Save world to JSON
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Save World';
  saveBtn.onclick = () => {
    saveWorldToJSON(currentWorld, currentSeedID);
  };

  panel.appendChild(regenBtn);
  panel.appendChild(saveBtn);
}

// --- Check Dev Mode via Query String ---
function isDevMode() {
  return new URLSearchParams(window.location.search).get('devMode') === '1';
}

// --- Kickstart Everything ---
init();
