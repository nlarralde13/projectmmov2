// /src/ui/mapOverlay.js

import { getRegionName } from '../utils/regionUtils.js';
import { regionColors, tileGrid } from './colors.js';

/**
 * Draws tile grid lines across the map (1px borders between tiles)
 */
export function drawTileGridOverlay(ctx, mapWidth, mapHeight, tileSize) {
  ctx.strokeStyle = tileGrid.border;
  ctx.lineWidth = 0.5;

  for (let y = 0; y <= mapHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * tileSize);
    ctx.lineTo(mapWidth * tileSize, y * tileSize);
    ctx.stroke();
  }

  for (let x = 0; x <= mapWidth; x++) {
    ctx.beginPath();
    ctx.moveTo(x * tileSize, 0);
    ctx.lineTo(x * tileSize, mapHeight * tileSize);
    ctx.stroke();
  }
}

/**
 * Draws region borders (3×3 grid) using regionNames from biomeMap
 */
export function drawDevOverlay(ctx, biomeMap, tileSize) {
  const mapHeight = biomeMap.length;
  const mapWidth = biomeMap[0].length;
  const thirdsX = Math.floor(mapWidth / 3);
  const thirdsY = Math.floor(mapHeight / 3);

  ctx.strokeStyle = regionColors.border;
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 1; x < 3; x++) {
    const px = x * thirdsX * tileSize;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, mapHeight * tileSize);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 1; y < 3; y++) {
    const py = y * thirdsY * tileSize;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(mapWidth * tileSize, py);
    ctx.stroke();
  }
}
