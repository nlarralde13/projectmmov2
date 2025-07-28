import { generateSeedID, generateWorldFromRegionMap, saveWorldToJSON } from './worldEngine.js';
import { getSettings } from './configLoader.js';
import { bindInteractions } from './ui/mapEvents.js';
import { displaySeedID } from './ui/devUI.js';


export function initializeDevTools(currentWorld, currentSeedID, onWorldUpdated) {
  const panel = document.getElementById('dev-panel');
  if (!panel) return;

  const settings = getSettings();
  panel.innerHTML = '<h3>🛠 Dev Tools</h3>';
  panel.appendChild(createToggle('📷 Enable Camera Control', 'cameraControl'));

  // ✅ Toggle builder
  function createToggle(labelText, settingKey) {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginBottom = '4px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!settings[settingKey];
    checkbox.style.marginRight = '6px';

    checkbox.onchange = () => {
      settings[settingKey] = checkbox.checked;
      console.log(`[DevPanel] ⚙️ ${settingKey} = ${checkbox.checked}`);
      onWorldUpdated(currentWorld, currentSeedID);
    };
   
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(labelText));
    return label;;

  }

  // 🌍 Regenerate button
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

    const world = result.world;

    bindInteractions(result.canvas, world, result.chunks, result.draw, getSettings());
    displaySeedID(newSeedID);
    onWorldUpdated(world, newSeedID);
  };

  // 💾 Save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Save World';
  saveBtn.onclick = () => {
    saveWorldToJSON(currentWorld, currentSeedID);
  };

  // 📦 Add elements to panel
  panel.appendChild(regenBtn);
  panel.appendChild(saveBtn);
  panel.appendChild(document.createElement('hr'));
  panel.appendChild(createToggle('🟥 Show Tile Grid', 'showTileGrid'));
  panel.appendChild(createToggle('🔷 Show Region Borders', 'showRegionBorders'));
  // Future: panel.appendChild(createToggle('📦 Show Chunk Bounds', 'showChunkOverlay'));
}
