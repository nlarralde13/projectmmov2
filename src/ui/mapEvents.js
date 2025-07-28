import { initializeContextMenu } from './contextMenu.js';

export function bindInteractions(canvas, worldData, chunks, draw, settings) {
  const tileSize = parseInt(canvas.dataset.tileSize, 10) || 16;
  const biomeMap = worldData.biomeMap;
  const terrainMap = worldData.terrainMap;
  const devMode = settings.enableDevMode;

  let hoverBox = createHoverBox();
  document.body.appendChild(hoverBox);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const tileX = Math.floor(mouseX / tileSize);
    const tileY = Math.floor(mouseY / tileSize);

    // Validate bounds
    if (
      tileX >= 0 && tileX < biomeMap[0].length &&
      tileY >= 0 && tileY < biomeMap.length
    ) {
      const biome = biomeMap[tileY][tileX];
      const tile = terrainMap[tileY][tileX];
      const elevation = tile.elevation;

      // Position hover box
      hoverBox.style.left = `${e.pageX + 10}px`;
      hoverBox.style.top = `${e.pageY + 10}px`;
      hoverBox.style.display = 'block';
      hoverBox.innerHTML = `🧭 x: ${tileX}, y: ${tileY}<br>🌎 Biome: ${biome}<br>⛰️ Elevation: ${elevation}`;

      // Optional: highlight tile with overlay
      draw(); // Clear previous highlight
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = 'limegreen';
      ctx.lineWidth = 1;
      ctx.strokeRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    } else {
      hoverBox.style.display = 'none';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoverBox.style.display = 'none';
    draw(); // Clear hover outline
  });

  initializeContextMenu(
    canvas,
    terrainMap,
    (tileInfo, newBiome) => {
      const { x, y, tile } = tileInfo;

      if (
        devMode &&
        x >= 0 && y >= 0 &&
        y < biomeMap.length &&
        x < biomeMap[0].length
      ) {
        tile.biome = newBiome;
        biomeMap[y][x] = newBiome;
        console.log(`[Editor] ✅ Biome set to '${newBiome}' at (${x}, ${y})`);
        draw();
      } else {
        console.warn('[Editor] ⚠️ Invalid coordinates or mode.');
      }
    },
    devMode ? 'dev' : 'standard'
  );
}

function createHoverBox() {
  const box = document.createElement('div');
  box.id = 'tile-hover-box';
  box.style.position = 'absolute';
  box.style.pointerEvents = 'none';
  box.style.padding = '6px 10px';
  box.style.background = 'rgba(0, 0, 0, 0.7)';
  box.style.color = '#fff';
  box.style.fontSize = '12px';
  box.style.borderRadius = '4px';
  box.style.zIndex = 1000;
  box.style.display = 'none';
  box.style.fontFamily = 'monospace';
  return box;
}
