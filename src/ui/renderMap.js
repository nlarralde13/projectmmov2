import { getBiomeColor } from './colorUtils.js';

/**
 * Renders the biome map on a canvas, draws chunk grid with IDs,
 * and returns { canvas, ctx } so you can attach hover handlers.
 */
export function renderMap(biomeMap, settings, chunks, tileSize = 10) {
    // Enable devMode from query string (?devMode=1)
    settings.devMode = isDevMode();

    // Remove any previous canvas
    const oldCanvas = document.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    const width = biomeMap[0].length;
    const height = biomeMap.length;

    // Create and append new canvas
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

    // Optional chunk grid overlay
    if (settings.showGrid) {
        drawChunkGridOverlay(ctx, chunks, tileSize);
    }

    // Developer debug overlay
    if (settings.devMode) {
        drawDevOverlay(ctx, biomeMap, tileSize);
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

        // Optional: label chunk ID
        // const centerX = ((startX + endX) / 2) * tileSize;
        // const centerY = ((startY + endY) / 2) * tileSize;
        // ctx.fillText(chunk.id, centerX, centerY);
    });

    console.log(`[UI] 🔍 Drew grid overlay + IDs for ${chunks.length} chunks.`);
}

/**
 * Enables floating hover box that shows chunk metadata.
 */
export function enableChunkHoverStatic(canvas, chunks, tileSize, biomeMap) {
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
        const mouseX = Math.floor(e.clientX - rect.left);
        const mouseY = Math.floor(e.clientY - rect.top);

        const tileX = Math.floor(mouseX / tileSize);
        const tileY = Math.floor(mouseY / tileSize);

        let found = false;

        if (
            tileX >= 0 && tileX < canvas.width / tileSize &&
            tileY >= 0 && tileY < canvas.height / tileSize
        ) {
            for (const chunk of chunks) {
                const { startX, startY, endX, endY } = chunk.bounds;
                const width = biomeMap[0].length;
                const height = biomeMap.length;
                const regionLabel = getRegionName(tileX, tileY, width, height);

                if (tileX >= startX && tileX <= endX && tileY >= startY && tileY <= endY) {
                    infoBox.style.left = `${e.pageX + 12}px`;
                    infoBox.style.top = `${e.pageY + 12}px`;
                    infoBox.innerHTML = `
                        <div><b>${chunk.id}</b> – Region: ${regionLabel}</div>
                        <div>(${startX},${startY}) → (${endX},${endY})</div>
                        <div>Tile: (${tileX}, ${tileY})</div>
                        <div>Biome: ${biomeMap[tileY][tileX]}</div>
                    `;

                    infoBox.style.display = 'block';
                    found = true;
                    break;
                }
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
 * Highlights clicked tile with a green border overlay.
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

        const tileX = Math.floor(mouseX / tileSize);
        const tileY = Math.floor(mouseY / tileSize);

        // Bounds check
        if (
            tileY >= 0 && tileY < biomeMap.length &&
            tileX >= 0 && tileX < biomeMap[0].length
        ) {
            const width = biomeMap[0].length;
            const height = biomeMap.length;
            const regionLabel = getRegionName(tileX, tileY, width, height);
            selectedTile = { x: tileX, y: tileY, biome: biomeMap[tileY][tileX] };
            console.log('[TileClick] ✅ Selected tile:', selectedTile,'Region: ', regionLabel);

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

/**
 * Converts tile coordinates to region label (e.g., NW, C, SE) in a 3x3 grid.
 */
export function getRegionName(x, y, width, height) {
    const thirdX = Math.floor(width / 3);
    const thirdY = Math.floor(height / 3);

    const col = x < thirdX ? 'W' : x < 2 * thirdX ? '' : 'E';
    const row = y < thirdY ? 'N' : y < 2 * thirdY ? '' : 'S';

    return (row + col) || 'C';
}

/**
 * Draws developer overlay:
 * - Blue region grid (3x3)
 * - Red tile borders
 * - Region labels (NW, C, etc.)
 */
function drawDevOverlay(ctx, biomeMap, tileSize) {
    const width = biomeMap[0].length;
    const height = biomeMap.length;

    // 🔵 Region grid lines (vertical & horizontal thirds)
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.75)';
    ctx.lineWidth = 2;
    const thirdWidth = width / 3;
    const thirdHeight = height / 3;

    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * thirdWidth * tileSize, 0);
        ctx.lineTo(i * thirdWidth * tileSize, height * tileSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * thirdHeight * tileSize);
        ctx.lineTo(width * tileSize, i * thirdHeight * tileSize);
        ctx.stroke();
    }

    // 🔴 Per-tile red border
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // 🏷️ Region labels (NW, C, etc.)
    ctx.fillStyle = 'blue';
    ctx.font = `${tileSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelOffsetX = thirdWidth / 2;
    const labelOffsetY = thirdHeight / 2;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const labelX = Math.floor((col * thirdWidth + labelOffsetX) * tileSize);
            const labelY = Math.floor((row * thirdHeight + labelOffsetY) * tileSize);
            const regionLabel = getRegionName(
                col * thirdWidth,
                row * thirdHeight,
                width,
                height
            );
            ctx.fillText(regionLabel, labelX, labelY);
        }
    }

    console.log('[DevOverlay] 🧪 Dev overlay drawn.');
}

/**
 * Detects whether ?devMode=1 is present in URL query string.
 */
function isDevMode() {
    return new URLSearchParams(window.location.search).get('devMode') === '1';
}
