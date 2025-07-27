import { getRegionName } from '../utils/regionUtils.js';

/**
 * Draws red grid lines around each chunk.
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
    });

    console.log(`[MapOverlay] 🔍 Drew grid overlay for ${chunks.length} chunks.`);
}

/**
 * Draws dev-mode overlays: region borders, tile outlines, region labels.
 */
export function drawDevOverlay(ctx, biomeMap, tileSize) {
    const width = biomeMap[0].length;
    const height = biomeMap.length;
    const thirdWidth = width / 3;
    const thirdHeight = height / 3;

    // Draw region grid (blue lines)
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.75)';
    ctx.lineWidth = 2;

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

    // Tile border overlays (light red)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 0.5;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Region labels (centered in each 3x3 zone)
    ctx.fillStyle = 'blue';
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

    console.log('[MapOverlay] 🧪 Dev overlay drawn.');
}
