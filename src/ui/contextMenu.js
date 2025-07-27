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
export function initializeContextMenu(canvas, terrainMap, onTileSelected, mode = 'standard') {
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        const tileSize = parseInt(canvas.dataset.tileSize) || 10;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize);
        const y = Math.floor((e.clientY - rect.top) / tileSize);

        const tile = terrainMap[y]?.[x];
        if (!tile) {
            console.warn('[ContextMenu] ❌ No tile found at', x, y);
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
        menu.style.position = 'absolute';
        menu.style.zIndex = 999;
        menu.style.background = '#222';
        menu.style.border = '1px solid #555';
        menu.style.padding = '0.5em';
        menu.style.color = '#fff';

        const biomeOptions = ['forest', 'desert', 'tundra', 'water', 'plains'];

        biomeOptions.forEach(biome => {
            const item = document.createElement('div');
            item.textContent = `Set Biome: ${biome}`;
            item.style.cursor = 'pointer';
            item.onclick = () => {
                onTileSelected({ x, y, tile }, biome);
                document.body.removeChild(menu);
            };
            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        document.addEventListener('click', () => {
            if (document.body.contains(menu)) {
                document.body.removeChild(menu);
            }
        }, { once: true });
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
