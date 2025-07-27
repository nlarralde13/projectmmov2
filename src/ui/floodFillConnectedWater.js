/**
 * Flood fills all connected water tiles starting from the map edges.
 * Marks connected tiles with tag 'ocean'.
 * Any remaining water tiles are considered 'lake' and tagged accordingly.
 *
 * @param {Array<Array<Object>>} terrainMap - 2D grid of tile objects
 */
export function floodFillConnectedWater(terrainMap) {
  const height = terrainMap.length;
  const width = terrainMap[0].length;

  const visited = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );

  const queue = [];

  // 🔹 Start from edges — enqueue all water tiles at border
  for (let x = 0; x < width; x++) {
    if (terrainMap[0][x].biome === 'water') queue.push([x, 0]);
    if (terrainMap[height - 1][x].biome === 'water') queue.push([x, height - 1]);
  }

  for (let y = 0; y < height; y++) {
    if (terrainMap[y][0].biome === 'water') queue.push([0, y]);
    if (terrainMap[y][width - 1].biome === 'water') queue.push([width - 1, y]);
  }

  // 🔵 Flood fill all connected water tiles and tag them as ocean
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited[y][x]) continue;

    const tile = terrainMap[y][x];
    if (tile.biome !== 'water') continue;

    visited[y][x] = true;
    tile.tags.push('ocean');

    // Explore 4-neighbors
    queue.push([x - 1, y]);
    queue.push([x + 1, y]);
    queue.push([x, y - 1]);
    queue.push([x, y + 1]);
  }

  // 🔹 Post-process: convert any unvisited water tiles to lake
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = terrainMap[y][x];
      if (tile.biome === 'water' && !tile.tags.includes('ocean')) {
        tile.biome = 'lake';
        tile.tags.push('lake');
      }
    }
  }

  console.log('[FloodFill] 🌊 Ocean tagging complete. Inland water converted to lakes.');
}
