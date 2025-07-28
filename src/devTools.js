// === DEV TOOLS MODULE ===
// Developer-only tools and UI, gated by devMode=1

import { generateWorldFromRegionMap, saveWorldToJSON, generateSeedID } from './worldEngine.js';

/**
 * Determines if developer mode is enabled via ?devMode=1.
 */
export function isDevMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('devMode') === '1';
}

/**
 * Builds the Dev Panel UI and attaches its actions.
 * Expects a callback to update world + interactions after regeneration.
 *
 * @param {Object} world - Current world object
 * @param {String} seedID - Current world seed ID
 * @param {Function} updateWorldCallback - Called after new world is generated
 */
export function createDevPanel(world, seedID, updateWorldCallback) {
  if (!isDevMode()) return;

  const panel = document.getElementById('dev-panel');
  if (!panel) return;

  // === Button: Generate New World ===
  const regenBtn = document.createElement('button');
  regenBtn.textContent = '🌍 Generate New World';
  regenBtn.onclick = async () => {
    const confirmed = confirm("Are you sure you want to regenerate the world?");
    if (!confirmed) return;

    const newSeedID = generateSeedID();
    const newURL = `${window.location.origin}${window.location.pathname}?seedID=${newSeedID}&devMode=1`;
    window.history.pushState({}, '', newURL);

    const result = await generateWorldFromRegionMap(newSeedID);
    if (!result) return;

    // Update world state in main
    updateWorldCallback(result);
  };

  // === Button: Save World to JSON ===
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Save World';
  saveBtn.onclick = () => {
    saveWorldToJSON(world, seedID);
  };

  // === Append buttons to dev panel ===
  panel.appendChild(regenBtn);
  panel.appendChild(saveBtn);
}

/**
 * Handles biome editing when a tile is selected in dev mode.
 * Used by the context menu when right-clicking.
 *
 * @param {Object} tileInfo - { x, y, tile } from contextMenu
 * @param {String} biome - The biome to assign to the tile
 * @param {Function} draw - Repaint function from renderMap
 * @param {Object} world - The full world object (biomeMap and terrainMap)
 */
export function handleBiomeEdit(tileInfo, biome, draw, world) {
  const { x, y, tile } = tileInfo;
  const map = world.biomeMap;

  if (
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
}
