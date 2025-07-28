import {
  generateWorldFromRegionMap,
  saveWorldToJSON,
  generateSeedID
} from './worldEngine.js';

import {
  getSettings,
  setSettings
} from './configLoader.js';



/**
 * Checks if developer mode is enabled via URL param (?devMode=1)
 */
export function isDevMode() {
  return new URLSearchParams(window.location.search).get('devMode') === '1';
}

/**
 * Adds a labeled toggle (checkbox + label) to the dev panel
 */
function addToggle(panel, labelText, settingKey) {
  console.log('[DevTools] 🛠 Adding toggle for:', settingKey);
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'row';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `toggle-${settingKey}`;

  const settings = getSettings(); // ✅ freshly fetched settings
  if (!settings.devOptions) settings.devOptions = {};
  checkbox.checked = settings.devOptions[settingKey] ?? false;

  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.textContent = labelText;

  checkbox.onchange = () => {
    const updatedSettings = getSettings();
    if (!updatedSettings.devOptions) updatedSettings.devOptions = {};
    updatedSettings.devOptions[settingKey] = checkbox.checked;
    setSettings(updatedSettings);
    console.log(`[DevTools] 🔄 ${settingKey} set to:`, checkbox.checked);
    document.dispatchEvent(new Event('redrawMap'));
  };

  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  panel.appendChild(wrapper);
}


/**
 * Creates the full dev panel UI, including buttons and toggles
 */
export function createDevPanel(world, seedID, handleWorldUpdate) {
  const panel = document.getElementById('dev-panel');
  if (!panel) return;

  // Clear panel content to avoid duplicate tools
  panel.innerHTML = '<h3>🛠 Dev Tools</h3>';

  // Buttons
  const regenBtn = document.createElement('button');
  regenBtn.textContent = '🔄 Generate New World';
  regenBtn.onclick = async () => {
    const newWorld = await generateWorldFromRegionMap(seedID);
    handleWorldUpdate(newWorld);
  };

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Save World';
  saveBtn.onclick = () => {
    const filename = `seed_${seedID}.json`;
    const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  panel.appendChild(regenBtn);
  panel.appendChild(saveBtn);

  // Toggles
  addToggle(panel, 'Tile Grid', 'showGrid');
  addToggle(panel, 'Region Grid', 'showRegions');
}


/**
 * Handles biome editing in dev mode when a tile is right-clicked
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
