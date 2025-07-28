// /src/ui/renderMap.js

import { drawDevOverlay, drawTileGridOverlay } from './mapOverlay.js';
import { getBiomeColor, regionColors } from './colors.js';
import {
  getSelectedTile,
  shouldShowGrid,
  shouldShowRegions
} from '../devTools.js';

/**
 * Renders the entire biome map into a canvas with optional overlays.
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
  canvas.style.display = 'block';

  container.innerHTML = '';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  /**
   * Redraws the entire visible map, overlays, and highlight
   */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw base biome tiles
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tile = biomeMap[y][x];
        const biome = typeof tile === 'object' ? tile.biome : tile;

        ctx.fillStyle = getBiomeColor(biome);
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // 2. Optional overlays (controlled by dev tools panel)
    if (shouldShowGrid()) {
      drawTileGridOverlay(ctx, mapWidth, mapHeight, tileSize);
    }

    if (shouldShowRegions()) {
      drawDevOverlay(ctx, biomeMap, tileSize);
    }

    // 3. Highlight selected tile (if one is selected)
    const selected = getSelectedTile?.();
    if (selected) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'yellow';
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(
        selected.x * tileSize,
        selected.y * tileSize,
        tileSize,
        tileSize
      );
      ctx.setLineDash([]);
    }
  }

  draw();

  return { canvas, ctx, draw };
}
