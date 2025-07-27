/**
 * Converts tile coordinates to a region label (e.g., "NW", "C", "SE") 
 * for a 3×3 grid layout based on world width and height.
 */
export function getRegionName(x, y, width, height) {
    const thirdX = Math.floor(width / 3);
    const thirdY = Math.floor(height / 3);

    const col = x < thirdX ? 'W' : x < 2 * thirdX ? '' : 'E';
    const row = y < thirdY ? 'N' : y < 2 * thirdY ? '' : 'S';

    return (row + col) || 'C';
}

/**
 * Returns the bounding box (startX, startY, endX, endY) of a named region
 * (e.g., "NW", "C", "SE") in a 3x3 grid for a given world size.
 */
export function getRegionBounds(regionKey, width, height) {
    const thirdsX = Math.floor(width / 3);
    const thirdsY = Math.floor(height / 3);

    const bounds = {
        NW: { startX: 0, startY: 0, endX: thirdsX - 1, endY: thirdsY - 1 },
        N:  { startX: thirdsX, startY: 0, endX: 2 * thirdsX - 1, endY: thirdsY - 1 },
        NE: { startX: 2 * thirdsX, startY: 0, endX: width - 1, endY: thirdsY - 1 },

        W:  { startX: 0, startY: thirdsY, endX: thirdsX - 1, endY: 2 * thirdsY - 1 },
        C:  { startX: thirdsX, startY: thirdsY, endX: 2 * thirdsX - 1, endY: 2 * thirdsY - 1 },
        E:  { startX: 2 * thirdsX, startY: thirdsY, endX: width - 1, endY: 2 * thirdsY - 1 },

        SW: { startX: 0, startY: 2 * thirdsY, endX: thirdsX - 1, endY: height - 1 },
        S:  { startX: thirdsX, startY: 2 * thirdsY, endX: 2 * thirdsX - 1, endY: height - 1 },
        SE: { startX: 2 * thirdsX, startY: 2 * thirdsY, endX: width - 1, endY: height - 1 }
    };

    return bounds[regionKey] || null;
}
