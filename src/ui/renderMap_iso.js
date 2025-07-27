import { getBiomeColor } from './colorUtils.js';

/**
 * Converts tile grid coordinates to isometric screen coordinates.
 */
function isoToScreen(x, y, tileWidth, tileHeight) {
    const screenX = (x - y) * (tileWidth / 2);
    const screenY = (x + y) * (tileHeight / 2);
    return [screenX, screenY];
}

/**
 * Draws a diamond-shaped tile at screen coordinates (cx, cy).
 */
function drawDiamondTile(ctx, cx, cy, tileWidth, tileHeight, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(cx, cy - tileHeight / 2);               // top
    ctx.lineTo(cx + tileWidth / 2, cy);                 // right
    ctx.lineTo(cx, cy + tileHeight / 2);                // bottom
    ctx.lineTo(cx - tileWidth / 2, cy);                 // left
    ctx.closePath();
    ctx.fill();
}

/**
 * Renders biomeMap as isometric diamonds and returns { canvas, ctx }
 */
export function renderMap(biomeMap, settings, chunks, tileSize = 10) {
    const oldCanvas = document.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    const tileWidth = tileSize;
    const tileHeight = tileSize / 2;

    const width = biomeMap[0].length;
    const height = biomeMap.length;

    const canvas = document.createElement('canvas');
    canvas.width = (width + height) * (tileWidth / 2);
    canvas.height = (width + height) * (tileHeight / 2);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, 0); // Center the map horizontally

    // Draw biome tiles
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [screenX, screenY] = isoToScreen(x, y, tileWidth, tileHeight);
            const biome = biomeMap[y][x];
            const color = getBiomeColor(biome);
            drawDiamondTile(ctx, screenX, screenY, tileWidth, tileHeight, color);
        }
    }

    console.log('[UI] ✅ Biome map rendered in isometric.');

    // Draw chunk grid if enabled
    if (settings.showGrid) {
        drawChunkGridOverlay(ctx, chunks, tileWidth, tileHeight);
    }

    return { canvas, ctx };
}

/**
 * Chunk grid overlay (doesn't align perfectly in isometric yet).
 * Future: use isometric bounds drawing for chunk visuals.
 */
export function drawChunkGridOverlay(ctx, chunks, tileWidth, tileHeight) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;

    chunks.forEach(chunk => {
        const { startX, startY, endX, endY } = chunk.bounds;
        const [sx, sy] = isoToScreen(startX, startY, tileWidth, tileHeight);
        const [ex, ey] = isoToScreen(endX + 1, endY + 1, tileWidth, tileHeight);

        ctx.strokeRect(
            sx,
            sy,
            ex - sx,
            ey - sy
        );
    });

    console.log(`[UI] 🔍 Grid overlay drawn (non-aligned).`);
}

/**
 * Hover box — still uses grid coords for now.
 */
export function enableChunkHoverStatic(canvas, chunks, tileSize) {
    const infoBox = document.createElement('div');
    infoBox.style.cssText = `
        position: fixed;
        pointer-events: none;
        background: rgba(0,0,0,0.7);
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        display: none;
        z-index: 1000;
    `;
    document.body.appendChild(infoBox);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Basic grid guess — TODO: add inverse of isoToScreen()
        const tileX = Math.floor(mouseX / tileSize);
        const tileY = Math.floor(mouseY / tileSize);

        let found = false;

        for (const chunk of chunks) {
            const { startX, startY, endX, endY } = chunk.bounds;
            if (tileX >= startX && tileX <= endX && tileY >= startY && tileY <= endY) {
                infoBox.style.left = `${e.pageX + 12}px`;
                infoBox.style.top = `${e.pageY + 12}px`;
                infoBox.innerHTML = `
                    <div><b>${chunk.id}</b></div>
                    <div>(${startX},${startY}) → (${endX},${endY})</div>
                `;
                infoBox.style.display = 'block';
                found = true;
                break;
            }
        }

        if (!found) {
            infoBox.style.display = 'none';
        }
    });

    canvas.addEventListener('mouseleave', () => {
        infoBox.style.display = 'none';
    });

    console.log('[UI] 🖱️ Static chunk hover metadata enabled.');
}

/**
 * Click handler still uses rectangular selection logic — fix later.
 */
export function enableTileClickHandler(canvas, biomeMap, tileSize) {
    let selectedTile = null;

    const selectionOverlay = document.createElement('div');
    selectionOverlay.style.cssText = `
        position: absolute;
        border: 2px solid lime;
        pointer-events: none;
        display: none;
        z-index: 900;
    `;
    document.body.appendChild(selectionOverlay);

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const tileX = Math.floor(mouseX / tileSize); // TODO: inverse isoToScreen()
        const tileY = Math.floor(mouseY / tileSize);

        if (
            tileY >= 0 && tileY < biomeMap.length &&
            tileX >= 0 && tileX < biomeMap[0].length
        ) {
            selectedTile = { x: tileX, y: tileY, biome: biomeMap[tileY][tileX] };
            console.log('[TileClick] ✅ Selected tile:', selectedTile);

            selectionOverlay.style.left = `${tileX * tileSize + rect.left}px`;
            selectionOverlay.style.top = `${tileY * tileSize + rect.top}px`;
            selectionOverlay.style.width = `${tileSize}px`;
            selectionOverlay.style.height = `${tileSize}px`;
            selectionOverlay.style.display = 'block';
        } else {
            selectionOverlay.style.display = 'none';
            selectedTile = null;
        }
    });

    console.log('[UI] 🖱️ Tile click selection enabled.');
}
