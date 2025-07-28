// layout.js

export function initLayout() {
  const body = document.body;
  body.style.margin = '0';
  body.style.fontFamily = 'sans-serif';
  body.style.overflow = 'hidden';

  // === Top Navigation ===
  const uiPanel = document.createElement('div');
  uiPanel.id = 'ui-panel';
  uiPanel.textContent = 'Cogsprocket Games: BrowserMMOLite';
  body.appendChild(uiPanel);

  // === Main Flex Layout ===
  const mainLayout = document.createElement('div');
  mainLayout.id = 'main-layout';

  // === Character Panel (Left) ===
  const characterPanel = document.createElement('div');
  characterPanel.id = 'character-panel';
  characterPanel.textContent = 'Character Panel';
  mainLayout.appendChild(characterPanel);

  // === Viewport Container (Center) ===
  const viewportContainer = document.createElement('div');
  viewportContainer.id = 'viewport-container';
  const viewport = document.createElement('div');
  viewport.id = 'viewport';
  viewportContainer.appendChild(viewport);
  mainLayout.appendChild(viewportContainer);

  // === Dev Panel (Right) ===
  const devPanel = document.createElement('div');
  devPanel.id = 'dev-panel';
  devPanel.style.display = 'none'; // Hidden until devMode
  mainLayout.appendChild(devPanel);

  body.appendChild(mainLayout);
}
