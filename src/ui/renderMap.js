import { getBiomeColor } from './colorUtils.js';
import { drawDevOverlay } from './mapOverlay.js';
import { getCameraPosition } from './camera.js';


/**
 * Renders a portion of the biome map inside #viewport.
 *
 * @param {Array<Array<string>>} biomeMap - The world’s biome grid
 * @param {Object} settings - Global config settings
 * @param {Array<Object>} chunks - Optional chunk data
 * @param {number} tileSize - Size of each tile in pixels
 * @param {number} visibleCols - How many columns (tiles) to draw
 * @param {number} visibleRows - How many rows (tiles) to draw
 * @returns {Object} { canvas, ctx, draw }
 */
function renderMap(biomeMap, settings = {}, chunks = [], tileSize = 16, visibleCols = 40, visibleRows = 40) {
  const viewport = document.getElementById('viewport');
  if (!viewport) {
    console.error('[renderMap] ❌ Missing #viewport container.');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = visibleCols * tileSize;
  canvas.height = visibleRows * tileSize;
  canvas.dataset.tileSize = tileSize;

  viewport.innerHTML = ''; // Clear old canvas
  viewport.appendChild(canvas);

  const ctx = canvas.getContext('2d');


  /**
 * draw()
 * Renders a portion of the world map to the canvas, based on the current camera position.
 * - Uses camera.x and camera.y as the top-left visible tile (viewport origin).
 * - Loops through visibleCols × visibleRows tiles starting from the camera offset.
 * - Each tile is rendered using getBiomeColor() and drawn at screen-relative coordinates.
 * - Optionally draws dev overlays (tile grid, region borders, labels) if devMode is enabled.
 */

  function draw() {
  const { x: camX, y: camY } = getCameraPosition();

  for (let screenY = 0; screenY < visibleRows; screenY++) {
    for (let screenX = 0; screenX < visibleCols; screenX++) {
      const worldX = camX + screenX;
      const worldY = camY + screenY;

      const biome = biomeMap[worldY]?.[worldX] || 'void';

      ctx.fillStyle = getBiomeColor(biome);
      ctx.fillRect(screenX * tileSize, screenY * tileSize, tileSize, tileSize);
    }
  }

  if (settings.enableDevMode && (settings.showTileGrid || settings.showRegionBorders)) {
  drawDevOverlay(ctx, biomeMap, tileSize, settings);
}

}


  console.log(`[Render] 🎯 ${visibleCols}x${visibleRows} tiles → ${canvas.width}x${canvas.height}px`);
  draw();

  return { canvas, ctx, draw };
}

export {
  renderMap
};
