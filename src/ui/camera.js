/**
 * camera.js
 * Controls map viewport offset and movement logic.
 */

let camera = {
  x: 0,
  y: 0
};

/**
 * Centers the camera on a specific tile.
 * @param {number} targetX - Tile X to center on
 * @param {number} targetY - Tile Y to center on
 * @param {number} visibleCols - How many tiles fit horizontally
 * @param {number} visibleRows - How many tiles fit vertically
 */
export function centerCameraOnTile(targetX, targetY, visibleCols, visibleRows) {
  camera.x = targetX - Math.floor(visibleCols / 2);
  camera.y = targetY - Math.floor(visibleRows / 2);
  console.log(`[Camera] 🎯 Centered at (${camera.x}, ${camera.y})`);
}

/**
 * Move the camera (god mode dev only).
 * @param {number} dx - Change in tiles (horizontal)
 * @param {number} dy - Change in tiles (vertical)
 */
export function moveCamera(dx, dy) {
  camera.x += dx;
  camera.y += dy;
  console.log(`[Camera] 🕹️ Moved to (${camera.x}, ${camera.y})`);
}

/**
 * Get current camera position (top-left visible tile)
 * @returns {{ x: number, y: number }}
 */
export function getCameraPosition() {
  return { ...camera };
}

/**
 * Reset camera to top-left (optional helper)
 */
export function resetCamera() {
  camera.x = 0;
  camera.y = 0;
}
