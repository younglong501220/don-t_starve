import * as THREE from 'three';

/**
 * Procedural Hand-Drawn Gothic Billboard Textures
 * Distinctive Don't Starve Tim Burton aesthetic:
 * - Scratchy ink outlines (cross-hatching)
 * - Muted sepia / forest tones
 * - Distressed silhouettes
 */

export function createPlayerTexture(hasTorch: boolean = false, hasAxe: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Shadow under feet
  ctx.fillStyle = 'rgba(15, 10, 8, 0.45)';
  ctx.beginPath();
  ctx.ellipse(128, 240, 38, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Wilson's iconic spiky black hair (back layer) ---
  ctx.fillStyle = '#110f12';
  ctx.strokeStyle = '#050405';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(70, 95);
  ctx.lineTo(25, 45); // left huge spike
  ctx.lineTo(60, 55);
  ctx.lineTo(50, 20); // top left spike
  ctx.lineTo(95, 40);
  ctx.lineTo(128, 8); // center top spike
  ctx.lineTo(160, 40);
  ctx.lineTo(205, 20); // top right spike
  ctx.lineTo(195, 55);
  ctx.lineTo(230, 45); // right huge spike
  ctx.lineTo(185, 95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hair scratchy highlights
  ctx.strokeStyle = '#322d36';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(128, 18);
  ctx.lineTo(128, 60);
  ctx.moveTo(75, 45);
  ctx.lineTo(100, 75);
  ctx.moveTo(180, 45);
  ctx.lineTo(155, 75);
  ctx.stroke();

  // --- Wilson's Face ---
  ctx.fillStyle = '#f7e7d0';
  ctx.strokeStyle = '#231811';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(128, 115, 42, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Subtle ear outlines
  ctx.fillStyle = '#f0dbc0';
  ctx.beginPath();
  ctx.ellipse(82, 118, 7, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(174, 118, 7, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Forehead hair wisps
  ctx.fillStyle = '#110f12';
  ctx.beginPath();
  ctx.moveTo(90, 85);
  ctx.lineTo(110, 102);
  ctx.lineTo(128, 90);
  ctx.lineTo(146, 102);
  ctx.lineTo(166, 85);
  ctx.closePath();
  ctx.fill();

  // Distressed Don't Starve Dark Circles & Big Gaunt Eyes
  ctx.fillStyle = '#423329';
  ctx.beginPath();
  ctx.arc(106, 112, 16, 0, Math.PI * 2);
  ctx.arc(150, 112, 16, 0, Math.PI * 2);
  ctx.fill();

  // Eye Whites
  ctx.fillStyle = '#fffaea';
  ctx.beginPath();
  ctx.arc(107, 111, 13, 0, Math.PI * 2);
  ctx.arc(149, 111, 13, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (curious / anxious look)
  ctx.fillStyle = '#080608';
  ctx.beginPath();
  ctx.arc(109, 111, 4.5, 0, Math.PI * 2);
  ctx.arc(151, 111, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye white reflection dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(107, 109, 2, 0, Math.PI * 2);
  ctx.arc(149, 109, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows (concerned, tilted)
  ctx.strokeStyle = '#1b120c';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(95, 96);
  ctx.lineTo(118, 93);
  ctx.moveTo(161, 96);
  ctx.lineTo(138, 93);
  ctx.stroke();

  // Pointy Nose
  ctx.strokeStyle = '#2b1b12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128, 108);
  ctx.lineTo(121, 126);
  ctx.lineTo(130, 126);
  ctx.stroke();

  // Mouth (slight anxious line)
  ctx.beginPath();
  ctx.moveTo(117, 140);
  ctx.quadraticCurveTo(128, 145, 139, 140);
  ctx.stroke();

  // --- Wilson's Body & Outfit ---
  // White collar
  ctx.fillStyle = '#ede5d8';
  ctx.strokeStyle = '#221812';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(110, 160);
  ctx.lineTo(128, 175);
  ctx.lineTo(146, 160);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red Waistcoat
  ctx.fillStyle = '#8b2518';
  ctx.strokeStyle = '#221812';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(102, 162);
  ctx.lineTo(154, 162);
  ctx.lineTo(158, 215);
  ctx.lineTo(98, 215);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Waistcoat buttons
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.arc(128, 180, 2.5, 0, Math.PI * 2);
  ctx.arc(128, 195, 2.5, 0, Math.PI * 2);
  ctx.arc(128, 208, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Legs & Boots
  ctx.fillStyle = '#211c24';
  ctx.fillRect(108, 215, 14, 25);
  ctx.strokeRect(108, 215, 14, 25);
  ctx.fillRect(134, 215, 14, 25);
  ctx.strokeRect(134, 215, 14, 25);

  // Arms & Hands
  ctx.fillStyle = '#ede5d8';
  ctx.strokeStyle = '#221812';
  // Left arm
  ctx.beginPath();
  ctx.ellipse(92, 185, 8, 18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right arm / hand
  ctx.beginPath();
  ctx.ellipse(164, 185, 8, 18, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // If holding Torch:
  if (hasTorch) {
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(170, 195);
    ctx.lineTo(195, 135);
    ctx.stroke();

    // Torch flame
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.ellipse(198, 125, 14, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(198, 127, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (hasAxe) {
    // Axe handle & blade
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(170, 195);
    ctx.lineTo(195, 140);
    ctx.stroke();

    ctx.fillStyle = '#8f929d';
    ctx.strokeStyle = '#1b1b22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(192, 138);
    ctx.lineTo(215, 125);
    ctx.lineTo(218, 150);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function createEvergreenTreeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 384);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Ground shadow
  ctx.fillStyle = 'rgba(15, 10, 8, 0.5)';
  ctx.beginPath();
  ctx.ellipse(128, 370, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gnarled Tree Trunk
  ctx.fillStyle = '#3c2718';
  ctx.strokeStyle = '#1d120a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(108, 260);
  ctx.lineTo(102, 365);
  ctx.lineTo(154, 365);
  ctx.lineTo(148, 260);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bark cross-hatching
  ctx.strokeStyle = '#21140c';
  ctx.lineWidth = 3;
  for (let y = 280; y < 355; y += 15) {
    ctx.beginPath();
    ctx.moveTo(110 + (y % 4), y);
    ctx.lineTo(145 - (y % 4), y + 6);
    ctx.stroke();
  }

  // Tiered jagged gothic pine boughs (3 layers from bottom to top)
  const drawPineLayer = (
    topY: number,
    botY: number,
    leftX: number,
    rightX: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#111b15';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(128, topY);
    // Left jagged edge
    ctx.lineTo((leftX + 128) / 2, topY + 25);
    ctx.lineTo((leftX + 128) / 2 + 15, topY + 28);
    ctx.lineTo(leftX, botY);
    // Jagged bottom
    const steps = 6;
    const dx = (rightX - leftX) / steps;
    for (let i = 1; i < steps; i++) {
      const curX = leftX + dx * i;
      const spikeY = botY + (i % 2 === 0 ? -12 : 8);
      ctx.lineTo(curX, spikeY);
    }
    ctx.lineTo(rightX, botY);
    // Right jagged edge
    ctx.lineTo((rightX + 128) / 2 + 5, topY + 28);
    ctx.lineTo((rightX + 128) / 2 - 10, topY + 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Don't Starve signature pine cross-hatch shading
    ctx.strokeStyle = '#16281e';
    ctx.lineWidth = 2.5;
    for (let x = leftX + 15; x < rightX - 15; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, botY - 10);
      ctx.lineTo(x + 10, botY - 35);
      ctx.stroke();
    }
  };

  // Bottom tier
  drawPineLayer(170, 285, 25, 231, '#1b3323');
  // Middle tier
  drawPineLayer(90, 205, 45, 211, '#23442f');
  // Top tier
  drawPineLayer(20, 125, 65, 191, '#2b5239');

  // Spiky top crown
  ctx.strokeStyle = '#111b15';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(128, 20);
  ctx.lineTo(128, 5);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 160, 160);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Grass blades
  ctx.fillStyle = '#8f9f4a';
  ctx.strokeStyle = '#2a3514';
  ctx.lineWidth = 4;

  const blades = [
    { startX: 40, c1x: 20, c1y: 70, endX: 10, endY: 25 },
    { startX: 55, c1x: 40, c1y: 60, endX: 35, endY: 15 },
    { startX: 70, c1x: 65, c1y: 40, endX: 62, endY: 10 },
    { startX: 85, c1x: 88, c1y: 40, endX: 92, endY: 8 },
    { startX: 100, c1x: 110, c1y: 50, endX: 125, endY: 18 },
    { startX: 115, c1x: 130, c1y: 70, endX: 150, endY: 30 },
  ];

  blades.forEach((b) => {
    ctx.beginPath();
    ctx.moveTo(b.startX - 6, 145);
    ctx.quadraticCurveTo(b.c1x, b.c1y, b.endX, b.endY);
    ctx.quadraticCurveTo(b.c1x + 10, b.c1y + 10, b.startX + 6, 145);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Base tuft
  ctx.fillStyle = '#596827';
  ctx.beginPath();
  ctx.ellipse(80, 144, 45, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createSaplingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 160, 192);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Stems
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(80, 185);
  ctx.lineTo(75, 110);
  ctx.lineTo(40, 45); // left twig
  ctx.moveTo(75, 110);
  ctx.lineTo(110, 55); // right twig
  ctx.moveTo(75, 130);
  ctx.lineTo(125, 95); // lower twig
  ctx.stroke();

  // Spikes and bark texture
  ctx.strokeStyle = '#2d1c0e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 185);
  ctx.lineTo(75, 110);
  ctx.stroke();

  // Little green leaves at tips
  ctx.fillStyle = '#7a9138';
  ctx.strokeStyle = '#2a3514';
  ctx.lineWidth = 2.5;

  const leaves = [
    { x: 38, y: 43 },
    { x: 50, y: 55 },
    { x: 110, y: 52 },
    { x: 125, y: 92 },
  ];
  leaves.forEach((l) => {
    ctx.beginPath();
    ctx.ellipse(l.x, l.y, 8, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createBoulderTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 200, 200);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Shadow
  ctx.fillStyle = 'rgba(15, 10, 8, 0.5)';
  ctx.beginPath();
  ctx.ellipse(100, 185, 75, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Angular Gothic Rock Facets
  ctx.fillStyle = '#6e6c6b';
  ctx.strokeStyle = '#222020';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(40, 175);
  ctx.lineTo(18, 120);
  ctx.lineTo(45, 50);
  ctx.lineTo(105, 30);
  ctx.lineTo(165, 55);
  ctx.lineTo(182, 120);
  ctx.lineTo(160, 175);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rock interior facet lines (geometric cleavage)
  ctx.fillStyle = '#545252';
  ctx.beginPath();
  ctx.moveTo(45, 50);
  ctx.lineTo(95, 100);
  ctx.lineTo(18, 120);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#858382';
  ctx.beginPath();
  ctx.moveTo(45, 50);
  ctx.lineTo(105, 30);
  ctx.lineTo(135, 85);
  ctx.lineTo(95, 100);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold / Flint mineral vein glistening
  ctx.strokeStyle = '#e6c84c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(95, 100);
  ctx.lineTo(125, 135);
  ctx.lineTo(110, 160);
  ctx.stroke();

  ctx.fillStyle = '#fceb79';
  ctx.beginPath();
  ctx.arc(125, 135, 4, 0, Math.PI * 2);
  ctx.arc(110, 160, 3, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createBerryBushTexture(hasBerries: boolean = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 192, 192);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Ground shadow
  ctx.fillStyle = 'rgba(15, 10, 8, 0.45)';
  ctx.beginPath();
  ctx.ellipse(96, 175, 65, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thorny branches
  ctx.strokeStyle = '#382515';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(96, 175);
  ctx.lineTo(75, 120);
  ctx.lineTo(50, 80);
  ctx.moveTo(96, 175);
  ctx.lineTo(120, 115);
  ctx.lineTo(145, 75);
  ctx.stroke();

  // Dense foliage cluster
  ctx.fillStyle = '#2d4b2e';
  ctx.strokeStyle = '#122313';
  ctx.lineWidth = 5;

  const lobes = [
    { x: 96, y: 95, r: 42 },
    { x: 62, y: 110, r: 35 },
    { x: 130, y: 110, r: 35 },
    { x: 70, y: 75, r: 30 },
    { x: 122, y: 75, r: 30 },
  ];
  lobes.forEach((l) => {
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Juicy red berries
  if (hasBerries) {
    const berries = [
      { x: 60, y: 95, r: 9 },
      { x: 80, y: 70, r: 10 },
      { x: 108, y: 65, r: 9.5 },
      { x: 132, y: 88, r: 9 },
      { x: 95, y: 115, r: 10.5 },
      { x: 118, y: 125, r: 8.5 },
      { x: 72, y: 130, r: 8 },
    ];

    berries.forEach((b) => {
      ctx.fillStyle = '#ad181f';
      ctx.strokeStyle = '#42080a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shiny highlight
      ctx.fillStyle = '#ff7b7b';
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.32, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createFlowerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 128);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Stem
  ctx.strokeStyle = '#324a20';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(64, 120);
  ctx.quadraticCurveTo(60, 85, 64, 60);
  ctx.stroke();

  // Little leaf
  ctx.fillStyle = '#496b2e';
  ctx.beginPath();
  ctx.ellipse(54, 90, 10, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Petals (golden wild daisy / rose)
  ctx.fillStyle = '#eb407a';
  ctx.strokeStyle = '#2b0916';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = 64 + Math.cos(angle) * 18;
    const py = 52 + Math.sin(angle) * 18;
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Flower Center
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath();
  ctx.arc(64, 52, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createCampfireTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 192, 192);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Burnt ground circle
  ctx.fillStyle = 'rgba(15, 10, 8, 0.7)';
  ctx.beginPath();
  ctx.ellipse(96, 160, 65, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Charred wood logs
  ctx.fillStyle = '#2b1b11';
  ctx.strokeStyle = '#120b07';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.ellipse(75, 158, 28, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(118, 158, 28, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Surrounding river stones
  ctx.fillStyle = '#696460';
  ctx.strokeStyle = '#201d1c';
  ctx.lineWidth = 3;
  const stones = [
    { x: 42, y: 160, r: 12 },
    { x: 62, y: 172, r: 11 },
    { x: 96, y: 176, r: 14 },
    { x: 130, y: 172, r: 11 },
    { x: 150, y: 160, r: 12 },
    { x: 140, y: 148, r: 10 },
    { x: 52, y: 148, r: 10 },
  ];
  stones.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Vibrant Dancing Flame
  ctx.fillStyle = '#e63900';
  ctx.strokeStyle = '#5a0f00';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(55, 150);
  ctx.quadraticCurveTo(60, 70, 96, 25);
  ctx.quadraticCurveTo(132, 70, 137, 150);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Yellow Flame
  ctx.fillStyle = '#ffbb00';
  ctx.beginPath();
  ctx.moveTo(72, 150);
  ctx.quadraticCurveTo(76, 95, 96, 50);
  ctx.quadraticCurveTo(116, 95, 120, 150);
  ctx.closePath();
  ctx.fill();

  // Core White Heat
  ctx.fillStyle = '#fff8e1';
  ctx.beginPath();
  ctx.ellipse(96, 140, 14, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createScienceMachineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Shadow
  ctx.fillStyle = 'rgba(15, 10, 8, 0.6)';
  ctx.beginPath();
  ctx.ellipse(128, 240, 75, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sturdy Victorian Oak Table Base
  ctx.fillStyle = '#593b22';
  ctx.strokeStyle = '#1f1309';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.rect(58, 145, 140, 90);
  ctx.fill();
  ctx.stroke();

  // Metal corner brackets
  ctx.fillStyle = '#8a7b68';
  ctx.fillRect(58, 145, 18, 90);
  ctx.strokeRect(58, 145, 18, 90);
  ctx.fillRect(180, 145, 18, 90);
  ctx.strokeRect(180, 145, 18, 90);

  // Steampunk Brass Chimney Pipe
  ctx.fillStyle = '#bf8f3b';
  ctx.strokeStyle = '#382506';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.rect(72, 50, 26, 95);
  ctx.fill();
  ctx.stroke();

  // Chimney Funnel Top
  ctx.beginPath();
  ctx.moveTo(64, 50);
  ctx.lineTo(106, 50);
  ctx.lineTo(112, 32);
  ctx.lineTo(58, 32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Giant Brass Gear / Clockwork Mechanism
  ctx.fillStyle = '#d4af37';
  ctx.strokeStyle = '#382506';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(165, 85, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gear teeth
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const tx = 165 + Math.cos(a) * 44;
    const ty = 85 + Math.sin(a) * 44;
    ctx.fillStyle = '#b38f29';
    ctx.fillRect(tx - 6, ty - 6, 12, 12);
    ctx.strokeRect(tx - 6, ty - 6, 12, 12);
  }

  // Inner Gear Hub
  ctx.fillStyle = '#2b1b11';
  ctx.beginPath();
  ctx.arc(165, 85, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing Vacuum / Alchemy Flask in center
  ctx.fillStyle = 'rgba(77, 208, 225, 0.4)';
  ctx.strokeStyle = '#006064';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(128, 175, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Core spark inside flask
  ctx.fillStyle = '#e0f7fa';
  ctx.beginPath();
  ctx.arc(128, 175, 9, 0, Math.PI * 2);
  ctx.fill();

  // Pressure gauge dial
  ctx.fillStyle = '#fffdf7';
  ctx.strokeStyle = '#2b1b11';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(128, 120, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dial needle
  ctx.strokeStyle = '#c62828';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(128, 120);
  ctx.lineTo(135, 110);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createShadowCreatureTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Smokey disjointed shadow body (Crawling Horror)
  ctx.fillStyle = 'rgba(12, 6, 14, 0.92)';
  ctx.strokeStyle = 'rgba(38, 14, 46, 0.9)';
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(60, 140);
  ctx.quadraticCurveTo(40, 80, 110, 60);
  ctx.quadraticCurveTo(180, 40, 210, 90);
  ctx.quadraticCurveTo(230, 150, 170, 170);
  ctx.quadraticCurveTo(110, 190, 60, 140);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spindly disjointed shadow legs
  ctx.strokeStyle = '#110614';
  ctx.lineWidth = 7;
  const legs = [
    { startX: 80, startY: 155, kneeX: 45, kneeY: 195, footX: 20, footY: 235 },
    { startX: 115, startY: 170, kneeX: 95, kneeY: 205, footX: 80, footY: 242 },
    { startX: 150, startY: 168, kneeX: 170, kneeY: 205, footX: 195, footY: 240 },
    { startX: 185, startY: 145, kneeX: 220, kneeY: 185, footX: 240, footY: 225 },
  ];

  legs.forEach((leg) => {
    ctx.beginPath();
    ctx.moveTo(leg.startX, leg.startY);
    ctx.lineTo(leg.kneeX, leg.kneeY);
    ctx.lineTo(leg.footX, leg.footY);
    ctx.stroke();
  });

  // Menacing glowing white slit eyes
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(135, 105, 12, 4, 0.3, 0, Math.PI * 2);
  ctx.ellipse(175, 108, 11, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Whispering smoke tendrils
  ctx.strokeStyle = 'rgba(20, 8, 25, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 60);
  ctx.quadraticCurveTo(80, 30, 95, 10);
  ctx.moveTo(150, 50);
  ctx.quadraticCurveTo(160, 20, 140, 5);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Don't Starve dry Savanna / Autumn ground palette
  ctx.fillStyle = '#3c2e21';
  ctx.fillRect(0, 0, 512, 512);

  // Dirt patches
  ctx.fillStyle = '#312519';
  for (let i = 0; i < 40; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    const rad = 20 + Math.random() * 45;
    ctx.beginPath();
    ctx.ellipse(rx, ry, rad, rad * 0.7, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }

  // Hand-drawn cross-hatching and dry cracks
  ctx.strokeStyle = '#22180f';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 12 + Math.random() * 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 10);
    ctx.stroke();
  }

  // Little pebbles
  ctx.fillStyle = '#4e3f30';
  for (let i = 0; i < 90; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.beginPath();
    ctx.arc(px, py, 2 + Math.random() * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 30);
  return texture;
}

export function createCrockPotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Ground shadow
  ctx.fillStyle = 'rgba(15, 10, 8, 0.6)';
  ctx.beginPath();
  ctx.ellipse(128, 235, 70, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone / Brick fire pit base
  ctx.fillStyle = '#4a3b32';
  ctx.strokeStyle = '#1b130e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Left leg
  ctx.rect(70, 165, 20, 65);
  // Center leg
  ctx.rect(118, 165, 20, 68);
  // Right leg
  ctx.rect(166, 165, 20, 65);
  ctx.fill();
  ctx.stroke();

  // Coals & Embers beneath pot
  ctx.fillStyle = '#b72c11';
  ctx.beginPath();
  ctx.ellipse(128, 195, 38, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(128, 194, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cauldron Pot Belly
  ctx.fillStyle = '#2c2b30';
  ctx.strokeStyle = '#121114';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(60, 100);
  ctx.quadraticCurveTo(45, 175, 128, 175);
  ctx.quadraticCurveTo(211, 175, 196, 100);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cauldron Rim
  ctx.fillStyle = '#3a3840';
  ctx.beginPath();
  ctx.ellipse(128, 100, 68, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Boiling Delicious Broth inside pot
  ctx.fillStyle = '#c84b25';
  ctx.beginPath();
  ctx.ellipse(128, 100, 58, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bubbles in soup
  ctx.fillStyle = '#fbb44c';
  const bubbles = [
    { x: 105, y: 98, r: 6 },
    { x: 135, y: 96, r: 8 },
    { x: 155, y: 102, r: 5 },
    { x: 118, y: 104, r: 6.5 },
  ];
  bubbles.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Wooden stirring ladle handle sticking out
  ctx.strokeStyle = '#7c532e';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(140, 105);
  ctx.lineTo(195, 40);
  ctx.stroke();

  ctx.fillStyle = '#996739';
  ctx.beginPath();
  ctx.ellipse(195, 38, 8, 12, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Rising steam puffs
  ctx.strokeStyle = 'rgba(235, 230, 220, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(110, 80);
  ctx.quadraticCurveTo(95, 55, 115, 30);
  ctx.moveTo(135, 75);
  ctx.quadraticCurveTo(150, 48, 130, 20);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

