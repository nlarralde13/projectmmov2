// devTools.js
import { getSettings } from './configLoader.js';
import { dispatchRedraw } from './ui/mapEvents.js';

const biomeList = [
  'water', 'grass', 'forest', 'desert', 'tundra', 'mountain',
  'ice', 'rocky', 'jungle', 'plains', 'bedrock'
];

let selectedBiome = 'grass';
let brushMode = false;
let selectedTile = null;
let worldRef = null;

// 🔧 NEW: Overlay toggle state
let showGrid = true;
let showRegions = true;

// 🔧 NEW: Exports for overlay draw modules
export function shouldShowGrid() {
  return showGrid;
}
export function shouldShowRegions() {
  return showRegions;
}

export function getSelectedTile() {
  return selectedTile;
}

export function createDevPanel(world, seedID, onWorldUpdate) {
  worldRef = world.biomeMap;

  const panel = document.getElementById('dev-panel');

  // Biome Picker
  const biomeSelect = document.createElement('select');
  biomeList.forEach(biome => {
    const option = document.createElement('option');
    option.value = biome;
    option.textContent = biome;
    biomeSelect.appendChild(option);
  });
  biomeSelect.value = selectedBiome;
  biomeSelect.addEventListener('change', () => {
    selectedBiome = biomeSelect.value;
  });
  panel.appendChild(biomeSelect);

  // Brush Mode Toggle
  const brushToggle = document.createElement('label');
  const brushCheckbox = document.createElement('input');
  brushCheckbox.type = 'checkbox';
  brushCheckbox.addEventListener('change', () => {
    brushMode = brushCheckbox.checked;
  });
  brushToggle.appendChild(brushCheckbox);
  brushToggle.appendChild(document.createTextNode(' Brush Mode'));
  panel.appendChild(brushToggle);

  // 🔧 NEW: Tile Grid Toggle
  const gridToggle = document.createElement('label');
  const gridCheckbox = document.createElement('input');
  gridCheckbox.type = 'checkbox';
  gridCheckbox.checked = showGrid;
  gridCheckbox.addEventListener('change', () => {
    showGrid = gridCheckbox.checked;
    dispatchRedraw();
  });
  gridToggle.appendChild(gridCheckbox);
  gridToggle.appendChild(document.createTextNode(' Show Tile Grid'));
  panel.appendChild(gridToggle);

  // 🔧 NEW: Region Borders Toggle
  const regionToggle = document.createElement('label');
  const regionCheckbox = document.createElement('input');
  regionCheckbox.type = 'checkbox';
  regionCheckbox.checked = showRegions;
  regionCheckbox.addEventListener('change', () => {
    showRegions = regionCheckbox.checked;
    dispatchRedraw();
  });
  regionToggle.appendChild(regionCheckbox);
  regionToggle.appendChild(document.createTextNode(' Show Region Borders'));
  panel.appendChild(regionToggle);

  panel.appendChild(document.createElement('hr'));

  // Selected Tile Editor
  const tileEditor = document.createElement('div');
  tileEditor.innerHTML = `
    <strong>Selected Tile</strong><br>
    X: <input type="number" id="tile-x" disabled size="3"> 
    Y: <input type="number" id="tile-y" disabled size="3"><br>
    Biome: <select id="tile-biome"></select><br>
    Elevation: <input type="number" id="tile-elevation"><br>
    Region: <input type="text" id="tile-region"><br>
    Tags: <input type="text" id="tile-tags"><br>
    <button id="apply-tile">Apply Changes</button>
  `;
  panel.appendChild(tileEditor);

  // Populate biome dropdown
  const tileBiomeSelect = tileEditor.querySelector('#tile-biome');
  biomeList.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    tileBiomeSelect.appendChild(opt);
  });

  // Hook up apply button
  const applyBtn = tileEditor.querySelector('#apply-tile');
  applyBtn.addEventListener('click', () => {
    if (!selectedTile) return;
    const { x, y } = selectedTile;

    const tile = worldRef[y][x];
    tile.biome = tileBiomeSelect.value;
    tile.elevation = parseInt(tileEditor.querySelector('#tile-elevation').value) || 0;
    tile.region = tileEditor.querySelector('#tile-region').value || null;

    const tagsRaw = tileEditor.querySelector('#tile-tags').value;
    tile.tags = tagsRaw.split(',').map(tag => tag.trim()).filter(Boolean);

    dispatchRedraw(); // re-render
  });

  // Hook up canvas interaction
  const canvas = document.getElementById('viewport');
  canvas.addEventListener('click', (e) => {
    const settings = getSettings();
    const rect = canvas.getBoundingClientRect();
    const tileSize = settings.tileSize || 16;

    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);

    if (!worldRef[y] || !worldRef[y][x]) return;

    if (brushMode) {
      worldRef[y][x].biome = selectedBiome;
      selectedTile = { x, y };
      dispatchRedraw();
      return;
    }

    // Update tile editor
    selectedTile = { x, y };
    const tile = worldRef[y][x];

    tileEditor.querySelector('#tile-x').value = x;
    tileEditor.querySelector('#tile-y').value = y;
    tileBiomeSelect.value = tile.biome || 'water';
    tileEditor.querySelector('#tile-elevation').value = tile.elevation || 0;
    tileEditor.querySelector('#tile-region').value = tile.region || '';
    tileEditor.querySelector('#tile-tags').value = tile.tags ? tile.tags.join(',') : '';

    dispatchRedraw();
  });
}
