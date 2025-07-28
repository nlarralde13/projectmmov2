import { loadSettings, getSettings } from './configLoader.js';
import { loadRegionMap, loadWorldFromJSON, generateWorldFromRegionMap } from './worldEngine.js';
import { getVisibleTileBounds } from './utils/chunkUtils.js';
import { renderMap } from './ui/renderMap.js';
import { bindInteractions } from './ui/mapEvents.js';
import { displaySeedID, updateCameraHUD } from './ui/devUI.js';
import { moveCamera, getCameraPosition } from './ui/camera.js';

let world = null;
let seedID = null;

async function init() {
  await loadSettings();
  const settings = getSettings();
  await loadRegionMap();

  seedID = settings.defaultSeedID || null;
  console.log('[Main] 🌱 Loading seedID:', seedID);

  try {
    world = await loadWorldFromJSON(seedID);
  } catch (err) {
    console.warn('[Main] ⚠️ Seed not found or corrupt. Generating new world...');
    const result = await generateWorldFromRegionMap();
    if (!result || !result.world) {
      console.error('[Main] ❌ World generation failed.');
      return;
    }
    seedID = result.seedID;
    world = result.world;
  }

  displaySeedID(seedID);
  renderWorld(world, getSettings());
  setupKeyboardControls();
}

function renderWorld(worldData, settings) {
  if (!worldData) {
    console.error('[Main] ❌ renderWorld called with null worldData.');
    return;
  }

  const oldCanvas = document.getElementById('game-canvas');
  if (oldCanvas) oldCanvas.remove();

  const tileSize = settings.tileSize || 16;
  const { visibleCols, visibleRows } = getVisibleTileBounds(tileSize, 40);
  const biomeMap = worldData.biomeMap;

  const { canvas, draw } = renderMap(biomeMap, settings, tileSize, visibleCols, visibleRows);
  if (!canvas || !draw) {
    console.error('[Main] ❌ Failed to render map.');
    return;
  }

  bindInteractions(canvas, worldData, null, draw, settings);
  updateCameraHUD(getCameraPosition());
}

function setupKeyboardControls() {
  window.addEventListener('keydown', (e) => {
    const settings = getSettings();
    const biomeMap = world?.biomeMap;
    if (!biomeMap || !settings.cameraControl) return;

    const mapWidth = biomeMap[0].length;
    const mapHeight = biomeMap.length;
    let moved = false;

    switch (e.key) {
      case 'ArrowUp':
      case 'w': moved = moveAndRender(0, -1, mapWidth, mapHeight); break;
      case 'ArrowDown':
      case 's': moved = moveAndRender(0, 1, mapWidth, mapHeight); break;
      case 'ArrowLeft':
      case 'a': moved = moveAndRender(-1, 0, mapWidth, mapHeight); break;
      case 'ArrowRight':
      case 'd': moved = moveAndRender(1, 0, mapWidth, mapHeight); break;
      case '+':
      case '=':
        settings.tileSize = Math.min(64, settings.tileSize + 2);
        renderWorld(world, settings);
        break;
      case '-':
      case '_':
        settings.tileSize = Math.max(8, settings.tileSize - 2);
        renderWorld(world, settings);
        break;
    }

    if (moved) updateCameraHUD(getCameraPosition());
  });
}

function moveAndRender(dx, dy, mapWidth, mapHeight) {
  moveCamera(dx, dy, mapWidth, mapHeight);
  renderWorld(world, getSettings());
  return true;
}

init();
