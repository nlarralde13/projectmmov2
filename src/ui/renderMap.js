import { getCameraPosition } from './camera.js';
import { drawDevOverlay } from './mapOverlay.js';
import { getBiomeColor } from './colorUtils.js';

/**
 * Render a tile-based map to a canvas and insert it into #viewport.
 */
export function renderMap(biomeMap, settings, tileSize, visibleCols, visibleRows) {
  const target = document.getElementById('viewport');
  if (!target) {
    console.error('[RenderMap] ❌ #viewport not found.');
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.width = visibleCols * tileSize;
  canvas.height = visibleRows * tileSize;
  const ctx = canvas.getContext('2d');

  function draw() {
    const { x: camX, y: camY } = getCameraPosition();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let screenY = 0; screenY < visibleRows; screenY++) {
      for (let screenX = 0; screenX < visibleCols; screenX++) {
        const worldX = camX + screenX;
        const worldY = camY + screenY;
        const tile = biomeMap[worldY]?.[worldX];
        if (!tile) continue;

        ctx.fillStyle = getBiomeColor(tile.type);
        ctx.fillRect(screenX * tileSize, screenY * tileSize, tileSize, tileSize);
      }
    }

    if (settings.enableDevMode && (settings.showTileGrid || settings.showRegionBorders)) {
      drawDevOverlay(ctx, biomeMap, tileSize, settings);
    }
  }

  draw();
  target.appendChild(canvas);
  return { canvas, draw };
}
