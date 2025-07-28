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

export function updateCameraHUD(pos) {
  let hud = document.getElementById('camera-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'camera-hud';
    hud.style.position = 'fixed';
    hud.style.bottom = '8px';
    hud.style.left = '8px';
    hud.style.background = 'rgba(0,0,0,0.5)';
    hud.style.color = 'lime';
    hud.style.font = '12px monospace';
    hud.style.padding = '4px 8px';
    hud.style.borderRadius = '4px';
    document.body.appendChild(hud);
  }
  hud.textContent = `📷 Camera: (${pos.x}, ${pos.y})`;
}
