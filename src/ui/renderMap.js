import { getBiomeColor } from './colorUtils.js';

/**
 * Renders the biome map on a canvas, draws chunk grid with IDs,
 * and returns { canvas, ctx } so you can attach hover handlers.
 */
export function renderMap(biomeMap, settings, chunks, tileSize = 10) {
    const oldCanvas = document.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    const width = biomeMap[0].length;
    const height = biomeMap.length;

    const canvas = document.createElement('canvas');
    canvas.width = width * tileSize;
    canvas.height = height * tileSize;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Draw biome tiles
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.fillStyle = getBiomeColor(biomeMap[y][x]);
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    console.log('[UI] ✅ Biome map rendered.');

    // Draw chunk grid + IDs if settings says so
    if (settings.showGrid) {
        drawChunkGridOverlay(ctx, chunks, tileSize);
    }

    return { canvas, ctx };
}

/**
 * Draws chunk grid borders and labels the chunk ID in center.
 */
export function drawChunkGridOverlay(ctx, chunks, tileSize) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'black';
    ctx.font = `${tileSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    chunks.forEach(chunk => {
        const { startX, startY, endX, endY } = chunk.bounds;

        ctx.strokeRect(
            startX * tileSize,
            startY * tileSize,
            (endX - startX + 1) * tileSize,
            (endY - startY + 1) * tileSize
        );

        const centerX = ((startX + endX) / 2) * tileSize;
        const centerY = ((startY + endY) / 2) * tileSize;

        //ctx.fillText(chunk.id, centerX, centerY);
    });

    console.log(`[UI] 🔍 Drew grid overlay + IDs for ${chunks.length} chunks.`);
}

/**
 * Enables hover metadata without redrawing canvas.
 * Just shows a floating HTML info box on hover.
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

        const tileX = Math.floor(mouseX / tileSize);
        const tileY = Math.floor(mouseY / tileSize);

        // Bounds check
        if (
            tileY >= 0 && tileY < biomeMap.length &&
            tileX >= 0 && tileX < biomeMap[0].length
        ) {
            selectedTile = { x: tileX, y: tileY, biome: biomeMap[tileY][tileX] };
            console.log('[TileClick] ✅ Selected tile:', selectedTile);

            // Position the overlay on screen
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
