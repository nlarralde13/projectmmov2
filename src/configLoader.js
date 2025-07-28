// configLoader.js
// Manages global game settings loaded from settings.json

let settings = {};

/**
 * Loads settings.json from public folder with cache-busting.
 */
export async function loadSettings() {
  try {
    const response = await fetch(`/settings.json?nocache=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    settings = await response.json();
    console.log('[ConfigLoader] ✅ Loaded settings:');
    console.table(settings);
  } catch (err) {
    console.error('[ConfigLoader] ❌ Failed to load settings.json:', err);
    settings = {};
  }
}

/**
 * Returns current global settings object.
 */
export function getSettings() {
  return settings;
}

/**
 * Overwrites global settings reference with a new object.
 * Useful for reactive updates across modules.
 */
export function setSettings(newSettings) {
  settings = newSettings;
}
