/**
 * Highlights hovered chunk boundary (used in dev grid overlays).
 */
export function enableChunkHoverStatic(canvas, chunks, tileSize, biomeMap, repaintCallback) {
    if (!canvas || !chunks || chunks.length === 0) return;

    const ctx = canvas.getContext('2d');

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const tileX = Math.floor(mouseX / tileSize);
        const tileY = Math.floor(mouseY / tileSize);

        const chunk = chunks.find(chunk => {
            const { startX, startY, endX, endY } = chunk.bounds;
            return tileX >= startX && tileX <= endX && tileY >= startY && tileY <= endY;
        });

        // 🧼 Repaint full map first
        if (typeof repaintCallback === 'function') {
            repaintCallback();
        }

        // 🟩 Then overlay the current hovered chunk
        if (chunk) {
            const { startX, startY, endX, endY } = chunk.bounds;
            ctx.strokeStyle = 'limegreen';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                startX * tileSize,
                startY * tileSize,
                (endX - startX + 1) * tileSize,
                (endY - startY + 1) * tileSize
            );
        }
    });
}


/**
 * Enables tile click logging.
 */
export function enableTileClickHandler(canvas, biomeMap, tileSize) {
    canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const tileX = Math.floor(mouseX / tileSize);
        const tileY = Math.floor(mouseY / tileSize);

        if (
            tileY >= 0 &&
            tileY < biomeMap.length &&
            tileX >= 0 &&
            tileX < biomeMap[0].length
        ) {
            const biome = biomeMap[tileY][tileX];
            console.log(`[MapEvents] 📍 Clicked Tile (${tileX}, ${tileY}): ${biome}`);
        }
    });
}
