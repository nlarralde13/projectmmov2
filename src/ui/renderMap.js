// /src/renderMap.js

import { drawDevOverlay, drawTileGridOverlay } from './mapOverlay.js';
import { getBiomeColor, regionColors, tileGrid} from './colors.js';

/**
 * Renders the entire biome map into a large canvas that supports native scrolling.
 * @param {Array} biomeMap - 2D array of biome data
 * @param {Object} settings - global settings object
 * @param {Array} chunks - optional chunk data
 * @param {number} tileSize - size of each tile in pixels
 * @returns {Object} - canvas, context, and draw function
 */
export function renderMap(biomeMap, settings = {}, chunks = [], tileSize = 16) {
  const container = document.getElementById('viewport');
  if (!container) {
    console.error('[RenderMap] ❌ #viewport not found.');
    return;
  }

  const mapWidth = biomeMap[0].length;
  const mapHeight = biomeMap.length;

  const canvas = document.createElement('canvas');
  canvas.width = mapWidth * tileSize;
  canvas.height = mapHeight * tileSize;
  canvas.style.display = 'block'; // full-size canvas

  // Clear and insert canvas into the container
  container.innerHTML = '';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  /**
   * Redraws the map using current data and settings.
   */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tile = biomeMap[y][x];
        const biome = typeof tile === 'object' ? tile.biome : tile;
        
        ctx.strokeStyle = regionColors.border;
        ctx.fillStyle = getBiomeColor(biome); // instead of tileGrid.border
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // Optional dev overlays
    if (settings.devOptions?.showRegions) {
      drawDevOverlay(ctx, biomeMap, tileSize);
    }

    if (settings.devOptions?.showGrid) {
      drawTileGridOverlay(ctx, biomeMap, tileSize);
    }
  }

  draw();

  return { canvas, ctx, draw };
}
