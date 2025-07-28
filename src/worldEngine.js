// worldEngine.js

/**
 * Fills the entire world grid with water tiles.
 * Used as the starting point for manual map editing.
 */
export function generateEmptyWorld(world, settings) {
  const { worldWidth, worldHeight } = settings;

  for (let y = 0; y < worldHeight; y++) {
    for (let x = 0; x < worldWidth; x++) {
      world[y][x] = {
        biome: 'water',
        elevation: 0,
        region: null,
        tags: []
      };
    }
  }

  return world;
}
