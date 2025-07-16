// configLoader.js
// --------------------------------------------------
// This module loads your settings.json on page load,
// merges it with sensible defaults, logs everything nicely,
// and exposes getSettings() so the rest of your app can use it.

let settings = {};  // Holds the loaded config object

/**
 * Loads settings.json from the public directory with a cache buster,
 * then parses it as JSON and logs a nice summary.
 */
export async function loadSettings() {
    try {
        const response = await fetch(`/settings.json?nocache=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        // Parse the JSON
        settings = await response.json();

        // Log the loaded settings as a nice table
        console.log('[ConfigLoader] ✅ Loaded settings:');
        console.table(settings);

    } catch (err) {
        console.error('[ConfigLoader] ❌ Failed to load settings.json:', err);

        // Fallback to empty object to avoid crashes elsewhere
        settings = {};
    }
}

/**
 * Returns the currently loaded settings object.
 * Use this everywhere in your app to access config.
 */
export function getSettings() {
    return settings;
}
