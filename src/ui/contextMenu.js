// contextMenu.js

let menuElement = null;
let activeTile = null;
let terrainMapRef = null;
let currentMode = 'standard';


/**
 * Initializes the context menu for either dev or standard users.
 * @param {HTMLCanvasElement} canvas
 * @param {Array<Array<Object>>} terrainMap
 * @param {Function} onBiomeChange - callback(tile, newBiome)
 * @param {string} mode - 'dev' or 'standard'
 */
export function initializeContextMenu(canvas, terrainMap, onBiomeChange, mode = 'standard') {
  terrainMapRef = terrainMap;
  currentMode = mode; // <--- store mode for use in right-click handler


  // Create the menu if not already created
  if (!menuElement) {
    menuElement = document.createElement('div');
    menuElement.id = 'biomeContextMenu';
    menuElement.style.position = 'absolute';
    menuElement.style.display = 'none';
    menuElement.style.background = '#222';
    menuElement.style.color = '#fff';
    menuElement.style.border = '1px solid #888';
    menuElement.style.borderRadius = '4px';
    menuElement.style.padding = '4px';
    menuElement.style.zIndex = '1000';
    document.body.appendChild(menuElement);
  }

  // Hide menu on click anywhere
  document.addEventListener('click', () => {
    menuElement.style.display = 'none';
  });

  // Attach right-click handler to canvas
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const tileSize = canvas.dataset.tileSize ? parseInt(canvas.dataset.tileSize) : 10;
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);

    activeTile = getTileAt(x, y);
    if (!activeTile) return;

    if (currentMode === 'dev') {
      showDevMenu(e.clientX, e.clientY, onBiomeChange);
    } else {
      showUserMenu(e.clientX, e.clientY);
    }
  });
}

// 🛠 Dev Mode: Show biome editing menu
function showDevMenu(x, y, onBiomeChange) {
  const biomeOptions = ['plains', 'forest', 'desert', 'mountain', 'swamp', 'ice', 'water', 'tundra'];

  menuElement.innerHTML = '';
  biomeOptions.forEach((biome) => {
    const item = document.createElement('div');
    item.textContent = `Set biome: ${biome}`;
    item.style.cursor = 'pointer';
    item.style.padding = '4px';
    item.style.borderBottom = '1px solid #444';

    item.addEventListener('click', () => {
      if (activeTile) {
        activeTile.biome = biome;
        activeTile.tags = [...new Set([...(activeTile.tags || []), 'manual'])];
        onBiomeChange(activeTile, biome);
      }
      menuElement.style.display = 'none';
    });

    menuElement.appendChild(item);
  });

  showMenuAt(x, y);
}

// 🌐 Standard User Mode: Show placeholder user menu
function showUserMenu(x, y) {
  const options = [
    'Inspect Tile',
    'Mark Location',
    'Zoom In',
    'Zoom Out',
    'Go to Parent Map'
  ];

  menuElement.innerHTML = '';
  options.forEach((label) => {
    const item = document.createElement('div');
    item.textContent = label;
    item.style.cursor = 'pointer';
    item.style.padding = '4px';
    item.style.borderBottom = '1px solid #444';

    item.addEventListener('click', () => {
      console.log(`[UserMenu] 📍 Selected: ${label} at (${activeTile?.x}, ${activeTile?.y})`);
      menuElement.style.display = 'none';
    });

    menuElement.appendChild(item);
  });

  showMenuAt(x, y);
}

// Position menu at screen coordinates
function showMenuAt(x, y) {
  menuElement.style.left = `${x}px`;
  menuElement.style.top = `${y}px`;
  menuElement.style.display = 'block';
}

// Get tile at grid coordinates
function getTileAt(x, y) {
  return terrainMapRef?.[y]?.[x] || null;
}
