// /src/ui/camera.js

let camera = { x: 0, y: 0 };

export function setCamera(x, y, mapWidth, mapHeight, viewWidth, viewHeight) {
  camera.x = Math.max(0, Math.min(x, mapWidth - viewWidth));
  camera.y = Math.max(0, Math.min(y, mapHeight - viewHeight));
}

export function getCamera() {
  return { ...camera };
}
