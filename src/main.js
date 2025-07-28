import { initLayout } from './layout.js';
import { loadSettings, getSettings } from './configLoader.js';
import { loadWorldFromSeed, generateWorldFromRegionMap } from './worldEngine.js';
import { renderMap } from './ui/renderMap.js';
import { createDevPanel } from './devTools.js';
import { enableHoverTooltip } from './ui/toolTips.js';
import { initKeyboardControls } from './ui/input.js';


let currentWorld = null;
let currentSeedID = null;
let drawFn = null;

/**
 * Initializes layout, settings, world state, and UI hooks
 */
async function init() {
  initLayout(); // Build UI structure
  await loadSettings();
  const settings = getSettings();

  const params = new URLSearchParams(window.location.search);
  const devMode = params.get('devMode') === '1';
  const seedID = params.get('seedID') || 'R9LOTE2ECRYGYSXR';
  currentSeedID = seedID;

  console.log(`[Main] 🌍 Loading seed: ${seedID}`);
  console.log(`[Main] 🔧 Mode: ${devMode ? 'DEV' : 'STANDARD'}`);

  const devPanel = document.getElementById('dev-panel');
  const devHeader = document.createElement('h3');

  if (devMode) {
    devPanel.style.display = 'flex';
    devHeader.innerHTML = '🛠 Dev Tools';
    devPanel.appendChild(devHeader);
    createDevPanel(currentWorld, currentSeedID, handleWorldUpdate);
  } else {
    devPanel.style.display = 'flex';
    devHeader.innerHTML = '🎮 User Tools';
    devPanel.appendChild(devHeader);
  }


  const result = await loadWorldFromSeed(seedID);
  if (!result) {
    console.warn('[Main] ❌ Could not load world — generating fallback.');
    const fallback = await generateWorldFromRegionMap(seedID);
    if (!fallback) return;
    handleWorldUpdate(fallback);
    return;
  }

  handleWorldUpdate(result);


  document.addEventListener('redrawMap', () => {
    const settings = getSettings();
    const { biomeMap, chunks } = currentWorld;
    const tileSize = settings.tileSize || 16;
    const render = renderMap(biomeMap, settings, chunks, tileSize);
    if (render) drawFn = render.draw;
  });
}

/**
 * Renders the given world object using renderMap()
 */
function handleWorldUpdate(result) {
  // If fallback format (nested world), unwrap it
  if (result.world && result.world.biomeMap) {
    result = {
      ...result.world,
      chunks: result.chunks || []
    };
  }

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