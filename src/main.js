// main.js
import { bindInteractions } from './ui/mapEvents.js';
import { loadSettings, getSettings } from './configLoader.js';
import {
  loadRegionMap,
  generateWorldFromRegionMap,
  saveWorldToJSON,
  loadWorldFromJSON,
  generateSeedID
} from './worldEngine.js';
import { renderMap } from './ui/renderMap.js';
import { loadBiomeRules } from './biomeRulesLoader.js';
import { generateChunks } from './utils/chunkUtils.js';
import { floodFillConnectedWater } from './ui/floodFillConnectedWater.js';
import { getVisibleTileBounds } from './utils/chunkUtils.js';
import { initializeDevTools} from './devTools.js';
import { displaySeedID } from './ui/devUI.js';





let world = null;
let seedID = null;
let tileSize = 16;
let devMode = false;

async function init() {
  // Load config files
  await loadSettings();
  const settings = getSettings();
  await loadBiomeRules();
  await loadRegionMap();

  // Set up main layout before rendering starts
  createMainLayout();

  // Parse config from query or settings
  const urlParams = new URLSearchParams(window.location.search);
  const defaultSeedID = settings.defaultSeedID || 'R9LOTE2ECRYGYSXR';
  seedID = urlParams.get('seedID') || defaultSeedID;
  tileSize = parseInt(settings.tileSize, 10) || 16;
  devMode = settings.enableDevMode || urlParams.get('devMode') === '1';

  console.log(`[Main] 🌱 Loading seedID: ${seedID}`);
  console.log(`[Main] 🛠 Mode: ${devMode ? 'DEV' : 'STANDARD'}`);

  // Try to load saved world
  const seedPath = `/seeds/seed_${seedID}.json`;
  world = await loadWorldFromJSON(seedPath);

  // If not found, generate a new one from settings
  if (!world) {
    console.warn(`[Main] ❗️No saved world found. Generating new world with current settings.`);

    const newSeedID = generateSeedID();
    seedID = newSeedID;

    const result = await generateWorldFromRegionMap(newSeedID);
    if (!result || !result.world) {
      console.error('[Main] ❌ Failed to generate fallback world.');
      return;
    }

    world = result.world;

    // Update browser URL
    const url = new URL(window.location);
    url.searchParams.set('seedID', newSeedID);
    window.history.replaceState({}, '', url);
  }

  if (!world) {
    console.error('[Main] ❌ Failed to load or generate a valid world.');
    return;
  }

  // Apply any post-processing (like tagging lakes)
  floodFillConnectedWater(world.terrainMap);

  renderWorld(world, settings);
  displaySeedID(seedID);

 initializeDevTools(world, seedID, (newWorld, newSeedID) => {
  world = newWorld;
  seedID = newSeedID;

  renderWorld(world, getSettings()); // ✅ must re-render here
});

}



function renderWorld(worldData, settings) {
  const { visibleCols, visibleRows } = getVisibleTileBounds(tileSize, 40);
  const chunks = generateChunks(worldData.biomeMap, settings.gridChunkSize || 10);
  const { canvas, draw } = renderMap(
    worldData.biomeMap,
    settings,
    chunks,
    tileSize,
    visibleCols,
    visibleRows
  );
  bindInteractions(canvas, worldData, chunks, draw, settings);
}



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

function createDevPanel(currentWorld, currentSeedID) {
  const panel = document.getElementById('dev-panel');
  if (!panel) return;

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

    bindInteractions(result.canvas, world, result.chunks, result.draw, getSettings());
    displaySeedID(seedID);
  };

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Save World';
  saveBtn.onclick = () => {
    saveWorldToJSON(currentWorld, currentSeedID);
  };

  panel.appendChild(regenBtn);
  panel.appendChild(saveBtn);
}

init();

window.addEventListener('resize', () => {
  if (world) {
    console.log('[Main] 🔄 Resizing viewport...');
    renderWorld(world, getSettings());
  }
});

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (world) {
      console.log('[Main] 🔄 Debounced resize → re-render');
      renderWorld(world, getSettings());
    }
  }, 150);
});

import { moveCamera } from './ui/camera.js';

window.addEventListener('keydown', (e) => {
  const settings = getSettings();
  if (!settings.cameraControl) return;

  let moved = false;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      moveCamera(0, -1);
      moved = true;
      break;
    case 'ArrowDown':
    case 's':
      moveCamera(0, 1);
      moved = true;
      break;
    case 'ArrowLeft':
    case 'a':
      moveCamera(-1, 0);
      moved = true;
      break;
    case 'ArrowRight':
    case 'd':
      moveCamera(1, 0);
      moved = true;
      break;
  }

  if (moved && world) {
    renderWorld(world, settings);
  }
});



