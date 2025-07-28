import { getSettings } from '../configLoader.js';

let camera = { x: 0, y: 0 };

export function moveCamera(dx, dy, mapWidth = 100, mapHeight = 100) {
  const settings = getSettings();
  const { visibleCols, visibleRows } = settings;

  const maxX = mapWidth - visibleCols;
  const maxY = mapHeight - visibleRows;

  camera.x = Math.max(0, Math.min(camera.x + dx, maxX));
  camera.y = Math.max(0, Math.min(camera.y + dy, maxY));

  console.log(`[Camera] Moved to (${camera.x}, ${camera.y})`);
}

export function centerCameraOnTile(targetX, targetY, visibleCols, visibleRows) {
  camera.x = targetX - Math.floor(visibleCols / 2);
  camera.y = targetY - Math.floor(visibleRows / 2);
  console.log(`[Camera] Centered on tile (${targetX}, ${targetY})`);
}

export function getCameraPosition() {
  return { ...camera };
}

export function resetCamera() {
  camera.x = 0;
  camera.y = 0;
}
