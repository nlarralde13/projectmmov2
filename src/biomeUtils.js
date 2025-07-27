export function pickWeightedBiome(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [_, w]) => sum + w, 0);
  const rand = Math.random() * total;

  let cumulative = 0;
  for (const [biome, weight] of entries) {
    cumulative += weight;
    if (rand <= cumulative) return biome;
  }

  return entries[0][0]; // fallback
}
