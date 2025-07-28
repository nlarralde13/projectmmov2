// /src/ui/colors.js

export const biomeColors = {
  water: '#4733ffff',
  forest: '#228B22',
  desert: '#DAA520',
  tundra: '#A9A9A9',
  mountain: '#888888',
  grassland: '#7CFC00',
  swamp: '#556B2F',
  bedrock: '#f10e0eff',
  unknown: '#ff00ff' // fallback
};

export const regionColors = {
  border: 'rgba(0, 0, 255, 0.6)', // semi-transparent blue
  label: '#0033cc'
};

export const tileGrid = {
  border: 'rgba(255, 0, 0, 0.4)' // thin red border
};

export const tooltipColors = {
  background: '#222',
  text: '#fff',
  border: '#444'
};

export function getBiomeColor(biomeType) {
  return biomeColors[biomeType] || biomeColors.unknown;
}
