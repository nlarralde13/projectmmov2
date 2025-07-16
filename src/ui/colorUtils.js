export function getBiomeColor(biome) {
    switch (biome) {
        case 'water': return '#3399ff';
        case 'grassland': return '#66cc66';
        case 'forest': return '#336633';
        case 'mountain': return '#999999';
        default: return '#000000';
    }
}
