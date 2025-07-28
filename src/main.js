// UI + Layout
import { initLayout } from './layout.js';
import { createDevPanel } from './devTools.js';

// Config
import { loadSettings, getSettings } from './configLoader.js';

// World Generation
import { generateEmptyWorld } from './worldEngine.js'; // ✅ manual map creation
import { generateChunks } from './utils/chunkUtils.js';

// Rendering + UI Hooks
import { renderMap } from './ui/renderMap.js';
import { enableHoverTooltip } from './ui/toolTips.js';
import { initKeyboardControls } from './ui/input.js';

// Global state
let currentWorld = null;
let currentSeedID = null;
let drawFn = null;

/**
 * Initializes layout, settings, world state, and UI hooks
 */
async function init() {
  initLayout(); // Setup UI panels

  await loadSettings();
  const settings = getSettings();

  // Query params
  const params = new URLSearchParams(window.location.search);
  const devMode = params.get('devMode') === '1';
  const seedID = params.get('seedID') || 'R9LOTE2ECRYGYSXR';
  currentSeedID = seedID;

  console.log(`[Main] 🌍 Loading seed: ${seedID}`);
  console.log(`[Main] 🔧 Mode: ${devMode ? 'DEV' : 'STANDARD'}`);

  // Generate new world manually
  const { worldWidth, worldHeight } = settings;
  const biomeMap = Array.from({ length: worldHeight }, () =>
    Array.from({ length: worldWidth }, () => ({
      biome: 'water',
      elevation: 0,
      region: null,
      tags: []
    }))
  );

  generateEmptyWorld(biomeMap, settings); // could just be a wrapper
  const chunks = generateChunks(biomeMap);
  currentWorld = { biomeMap, chunks };

  // Initialize dev panel only after world is ready
  if (devMode) {
    createDevPanel(currentWorld, currentSeedID, handleWorldUpdate);
  }

  // Kick off initial render
  handleWorldUpdate(currentWorld);

  // Listen for redraw events (from dev tools, etc.)
  document.addEventListener('redrawMap', () => {
    const { biomeMap, chunks } = currentWorld;
    const settings = getSettings();
    const tileSize = settings.tileSize || 16;
    const render = renderMap(biomeMap, settings, chunks, tileSize);
    if (render) drawFn = render.draw;
  });
}

/**
 * Updates the canvas and HUD with the given world object
 */
function handleWorldUpdate(result) {
  if (!result || !Array.isArray(result.biomeMap) || !result.biomeMap[0]) {
    console.warn('[Main] ❌ Invalid world data passed to handleWorldUpdate:', result);
    return;
  }

  currentWorld = result;

  const { biomeMap, chunks } = result;
  const settings = getSettings();
  const tileSize = settings.tileSize || 16;

  const render = renderMap(biomeMap, settings, chunks, tileSize);
  if (render && render.canvas) {
    drawFn = render.draw;
    enableHoverTooltip(render.canvas, biomeMap, settings);
    initKeyboardControls(biomeMap, drawFn);
  }
}

window.addEventListener('DOMContentLoaded', init);
