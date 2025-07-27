import { getBiomeColor } from './colorUtils.js';
import { drawChunkGridOverlay, drawDevOverlay } from './mapOverlay.js';

/**
 * Renders the biome map inside #viewport.
 */
function renderMap(biomeMap, settings = {}, chunks = [], tileSize = 10) {
    const viewport = document.getElementById('viewport');
    if (!viewport) {
        console.error('[renderMap] ❌ Missing #viewport container.');
        return;
    }

    const width = biomeMap[0].length;
    const height = biomeMap.length;

    const canvas = document.createElement('canvas');
    canvas.width = width * tileSize;
    canvas.height = height * tileSize;
    viewport.innerHTML = ''; // Clear old canvas
    viewport.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function draw() {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                ctx.fillStyle = getBiomeColor(biomeMap[y][x]);
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }

        if (settings.showGrid && chunks.length > 0) {
            drawChunkGridOverlay(ctx, chunks, tileSize);
        }

        if (settings.devMode) {
            drawDevOverlay(ctx, biomeMap, tileSize);
        }
    }

    draw(); // Initial paint

    return { canvas, ctx, draw };
}


function isDevMode() {
    return new URLSearchParams(window.location.search).get('devMode') === '1';
}

export {
    renderMap
};
