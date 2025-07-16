import { loadSettings, getSettings } from './configLoader.js';
import { loadRegionMap, generateWorld, generateChunks } from './worldEngine.js';
import { renderMap, createResetButton } from './ui/renderUI.js';

async function init() {
    await loadSettings();
    await loadRegionMap();
    const world = generateWorld();
    const settings = getSettings();

    if (world) {
        renderMap(world.biomeMap, settings, 10);
        createResetButton(() => {
            const newWorld = generateWorld();
            renderMap(newWorld.biomeMap, settings, 10);
        });
    }
}

init();
