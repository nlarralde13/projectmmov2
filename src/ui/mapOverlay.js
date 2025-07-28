import { getRegionName } from '../utils/regionUtils.js';

export function drawDevOverlay(ctx, biomeMap, tileSize, settings = {}) {
  const rows = biomeMap.length;
  const cols = biomeMap[0].length;

  const regionCols = 3;
  const regionRows = 3;
  const regionWidth = Math.floor(cols / regionCols);
  const regionHeight = Math.floor(rows / regionRows);

  // --- 🔷 Region Borders ---
  if (settings.showRegionBorders) {
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.75)';
    ctx.lineWidth = 2;

    for (let i = 1; i < regionCols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * regionWidth * tileSize, 0);
      ctx.lineTo(i * regionWidth * tileSize, rows * tileSize);
      ctx.stroke();
    }

    for (let i = 1; i < regionRows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * regionHeight * tileSize);
      ctx.lineTo(cols * tileSize, i * regionHeight * tileSize);
      ctx.stroke();
    }
  }

  // --- 🟥 Tile Grid ---
  if (settings.showTileGrid) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 0.5;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  // --- 🏷️ Region Labels ---
  ctx.fillStyle = 'blue';
  ctx.font = `${tileSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let rY = 0; rY < regionRows; rY++) {
    for (let rX = 0; rX < regionCols; rX++) {
      const centerX = Math.floor((rX * regionWidth + regionWidth / 2) * tileSize);
      const centerY = Math.floor((rY * regionHeight + regionHeight / 2) * tileSize);
      const regionLabel = getRegionName(
        rX * regionWidth,
        rY * regionHeight,
        cols,
        rows
      );
      ctx.fillText(regionLabel, centerX, centerY);
    }
  }

  console.log('[MapOverlay] ✅ Dev overlay rendered (tile grid, region borders, labels).');
}
