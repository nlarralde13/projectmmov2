// /src/ui/toolTips.js

import { tooltipColors } from './colors.js';

/**
 * Enables a floating tooltip when hovering over map tiles.
 * Displays X/Y coordinates, biome type, elevation, and weather.
 *
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @param {Array} biomeMap - 2D biome map (may contain string or object tiles)
 * @param {Object} settings - settings (must include tileSize)
 */
export function enableHoverTooltip(canvas, biomeMap, settings = {}) {
  if (!canvas || !biomeMap || !Array.isArray(biomeMap)) return;

  const tileSize = settings.tileSize || 16;

  // Create the floating div tooltip once
  const tooltipDiv = document.createElement('div');
  tooltipDiv.style.position = 'absolute';
  tooltipDiv.style.padding = '6px 8px';
  tooltipDiv.style.background = tooltipColors.background;
  tooltipDiv.style.color = tooltipColors.text;
  tooltipDiv.style.fontSize = '12px';
  tooltipDiv.style.borderRadius = '4px';
  tooltipDiv.style.pointerEvents = 'none';
  tooltipDiv.style.zIndex = '999';
  tooltipDiv.style.border = `1px solid ${tooltipColors.border}`;
  tooltipDiv.style.display = 'none';
  document.body.appendChild(tooltipDiv);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);

    const row = biomeMap[y];
    const tile = row ? row[x] : null;

    if (!tile) {
      tooltipDiv.style.display = 'none';
      return;
    }

    const biome = typeof tile === 'object' ? tile.biome ?? 'unknown' : tile;
    const elevation = typeof tile === 'object' ? tile.elevation ?? 0 : 0;
    const weather = typeof tile === 'object' ? tile.weather ?? 'none' : 'none';

    tooltipDiv.innerHTML = `
      <b>Tile:</b> (${x}, ${y})<br>
      <b>Biome:</b> ${biome}<br>
      <b>Elevation:</b> ${elevation}<br>
      <b>Weather:</b> ${weather}
    `;
    tooltipDiv.style.left = `${e.pageX + 12}px`;
    tooltipDiv.style.top = `${e.pageY + 12}px`;
    tooltipDiv.style.display = 'block';
  });

  canvas.addEventListener('mouseleave', () => {
    tooltipDiv.style.display = 'none';
  });
}
