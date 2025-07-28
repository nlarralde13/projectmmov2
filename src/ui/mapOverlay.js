// /src/ui/mapOverlay.js

import { getRegionName } from '../utils/regionUtils.js';
import { regionColors, tileGrid } from './colors.js';

/**
 * Draws a fine grid overlay on each tile.
 * Used to visually separate tiles during development.
 */
export function drawTileGridOverlay(ctx, biomeMap, tileSize) {
  const width = biomeMap[0].length;
  const height = biomeMap.length;

  ctx.strokeStyle = tileGrid.border;
  ctx.lineWidth = 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  console.log('[MapOverlay] 🔲 Tile grid overlay drawn.');
}

/**
 * Draws major region borders and region name labels.
 * Divides the map into a 3x3 grid: NW, N, NE, etc.
 */
export function drawDevOverlay(ctx, biomeMap, tileSize) {
  const width = biomeMap[0].length;
  const height = biomeMap.length;
  const thirdWidth = width / 3;
  const thirdHeight = height / 3;

  // Draw vertical and horizontal lines to separate regions
  ctx.strokeStyle = regionColors.border;
  ctx.lineWidth = 2;

  for (let i = 1; i < 3; i++) {
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(i * thirdWidth * tileSize, 0);
    ctx.lineTo(i * thirdWidth * tileSize, height * tileSize);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, i * thirdHeight * tileSize);
    ctx.lineTo(width * tileSize, i * thirdHeight * tileSize);
    ctx.stroke();
  }

  // Draw region labels (e.g., NW, C, SE)
  ctx.fillStyle = regionColors.label;
  ctx.font = `${tileSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const offsetX = thirdWidth / 2;
  const offsetY = thirdHeight / 2;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const labelX = Math.floor((col * thirdWidth + offsetX) * tileSize);
      const labelY = Math.floor((row * thirdHeight + offsetY) * tileSize);
      const regionLabel = getRegionName(
        col * thirdWidth,
        row * thirdHeight,
        width,
        height
      );
      ctx.fillText(regionLabel, labelX, labelY);
    }
  }

  console.log('[MapOverlay] 🧭 Region grid overlay drawn.');
}
