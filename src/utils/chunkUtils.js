/**
 * Splits a biome map into chunks for lazy rendering or zoning.
 *
 * @param {Array<Array<string>>} biomeMap - 2D array of biome types
 * @param {number} chunkSize - Size of square chunks in tiles (default 100)
 * @returns {Array<Object>} - List of chunk metadata with ID and bounds
 */
export function generateChunks(biomeMap, chunkSize = 100) {
    const height = biomeMap.length;
    const width = biomeMap[0].length;
    const chunks = [];

    let chunkId = 0;
    for (let y = 0; y < height; y += chunkSize) {
        for (let x = 0; x < width; x += chunkSize) {
            const endX = Math.min(x + chunkSize - 1, width - 1);
            const endY = Math.min(y + chunkSize - 1, height - 1);

            chunks.push({
                id: `chunk_${chunkId++}`,
                bounds: { startX: x, startY: y, endX, endY }
            });
        }
    }

    console.log(`[ChunkUtils] ✅ Generated ${chunks.length} chunks.`);
    return chunks;
}


/**
 * Calculates how many tiles can fit on screen, clamped to a max value.
 *
 * @param {number} tileSize - The size of each tile in pixels.
 * @param {number} maxTiles - Max number of tiles to show per dimension (default 40).
 * @returns {{ visibleCols: number, visibleRows: number }}
 */
export function getVisibleTileBounds(tileSize, maxTiles = 40) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const maxWidthTiles = Math.floor(windowWidth / tileSize);
  const maxHeightTiles = Math.floor(windowHeight / tileSize);

  return {
    visibleCols: Math.min(maxTiles, maxWidthTiles),
    visibleRows: Math.min(maxTiles, maxHeightTiles)
  };
}
