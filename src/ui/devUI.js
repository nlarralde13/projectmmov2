// devUI.js
export function displaySeedID(seedID) {
  let seedLabel = document.getElementById('seed-id-display');
  if (!seedLabel) {
    seedLabel = document.createElement('div');
    seedLabel.id = 'seed-id-display';
    seedLabel.style.textAlign = 'center';
    seedLabel.style.marginTop = '8px';
    seedLabel.style.fontFamily = 'monospace';
    seedLabel.style.color = '#666';
    document.body.appendChild(seedLabel);
  }
  seedLabel.textContent = `Seed ID: ${seedID}`;
}
