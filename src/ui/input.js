// /src/ui/input.js
import { setCamera, getCamera } from './camera.js';
import { getSettings } from '../configLoader.js';

export function initKeyboardControls(biomeMap, redraw) {
  window.addEventListener('keydown', (e) => {
    const settings = getSettings();
    const tileSize = settings.tileSize || 16;
    const viewWidth = Math.floor(window.innerWidth / tileSize);
    const viewHeight = Math.floor((window.innerHeight - 60) / tileSize); // subtract UI panel height

    const mapHeight = biomeMap.length;
    const mapWidth = biomeMap[0].length;

    const camera = getCamera();

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        setCamera(camera.x, camera.y - 1, mapWidth, mapHeight, viewWidth, viewHeight);
        redraw();
        break;
      case 'ArrowDown':
      case 's':
        setCamera(camera.x, camera.y + 1, mapWidth, mapHeight, viewWidth, viewHeight);
        redraw();
        break;
      case 'ArrowLeft':
      case 'a':
        setCamera(camera.x - 1, camera.y, mapWidth, mapHeight, viewWidth, viewHeight);
        redraw();
        break;
      case 'ArrowRight':
      case 'd':
        setCamera(camera.x + 1, camera.y, mapWidth, mapHeight, viewWidth, viewHeight);
        redraw();
        break;
      case '+':
        console.log('[Input] Zoom in (not implemented yet)');
        break;
      case '-':
        console.log('[Input] Zoom out (not implemented yet)');
        break;
    }
  });
}
