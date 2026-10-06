import React, { useState, useEffect, useRef } from 'react';
import { WorldEntity } from '../types/game';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  cameraAngle: number;
  entities: WorldEntity[];
  dayCount?: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  cameraAngle,
  entities,
  dayCount = 1,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fog-of-War exploration state: collection of visited world positions
  const exploredPointsRef = useRef<{ x: number; z: number }[]>([
    { x: 0, z: 0 },
    { x: 4, z: 3 },  // initial safe campfire
    { x: -4, z: 2 }, // initial crock pot
  ]);

  // Set of 6m x 6m visited grid cells for accurate exploration percentage
  const visitedGridCellsRef = useRef<Set<string>>(new Set<string>());
  const [explorationPercentage, setExplorationPercentage] = useState<number>(3);

  // Reset exploration on day 1 restart if needed
  const lastDayRef = useRef(dayCount);
  useEffect(() => {
    if (dayCount === 1 && lastDayRef.current > 1) {
      exploredPointsRef.current = [
        { x: 0, z: 0 },
        { x: 4, z: 3 },
        { x: -4, z: 2 },
      ];
      visitedGridCellsRef.current.clear();
      setExplorationPercentage(3);
    }
    lastDayRef.current = dayCount;
  }, [dayCount]);

  const radarRange = isExpanded ? 70 : 45;
  const size = isExpanded ? 160 : 110;
  const half = size / 2;
  const revealRadius = 15; // world units revealed around each exploration step

  // Update exploration footprint as player moves
  useEffect(() => {
    const points = exploredPointsRef.current;
    let shouldAdd = false;

    // Check distance to closest existing explored point
    let minDistance = Infinity;
    for (const pt of points) {
      const d = Math.hypot(pt.x - playerX, pt.z - playerZ);
      if (d < minDistance) minDistance = d;
    }

    // Add new exploration breadcrumb if moved more than 3.5 units
    if (minDistance > 3.5) {
      points.push({ x: playerX, z: playerZ });
      shouldAdd = true;
    }

    // Update visited grid cells (5m x 5m blocks within reveal radius)
    const cellRadius = 3;
    const centerGX = Math.round(playerX / 5);
    const centerGZ = Math.round(playerZ / 5);
    const gridSet = visitedGridCellsRef.current;

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dz = -cellRadius; dz <= cellRadius; dz++) {
        if (dx * dx + dz * dz <= cellRadius * cellRadius) {
          gridSet.add(`${centerGX + dx},${centerGZ + dz}`);
        }
      }
    }

    if (shouldAdd || gridSet.size % 4 === 0) {
      // Estimated playable area is ~500 grid cells
      const pct = Math.min(100, Math.max(3, Math.round((gridSet.size / 480) * 100)));
      setExplorationPercentage(pct);
    }
  }, [playerX, playerZ]);

  // Color mapping for world entities
  const getEntityColor = (type: string) => {
    switch (type) {
      case 'campfire':
        return '#ff7700';
      case 'crock_pot':
        return '#ff9800';
      case 'science':
        return '#00e5ff';
      case 'tree':
        return '#2e7d32';
      case 'boulder':
        return '#9e9e9e';
      case 'berrybush':
        return '#e91e63';
      case 'grass':
        return '#8bc34a';
      case 'sapling':
        return '#795548';
      case 'flower':
        return '#f48fb1';
      case 'shadow_creature':
        return '#ab47bc';
      default:
        return '#ffffff';
    }
  };

  // Check if a specific world position is inside the revealed Fog of War
  const isPositionExplored = (wx: number, wz: number): boolean => {
    // Immediate player vision radius (15m)
    if (Math.hypot(wx - playerX, wz - playerZ) <= revealRadius) {
      return true;
    }
    // Check against explored breadcrumbs
    const points = exploredPointsRef.current;
    for (let i = points.length - 1; i >= 0; i--) {
      const pt = points[i];
      if (Math.hypot(wx - pt.x, wz - pt.z) <= revealRadius) {
        return true;
      }
    }
    return false;
  };

  // Render Minimap with Fog of War on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crispness
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    // Circular radar clipping mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, half - 3, 0, Math.PI * 2);
    ctx.clip();

    // 1. BASE LAYER: Pitch-Black / Sepia Unexplored Fog of War
    ctx.fillStyle = '#0e0906';
    ctx.fillRect(0, 0, size, size);

    // Subtle gothic cross-hatch texture in unexplored darkness
    ctx.strokeStyle = '#18100a';
    ctx.lineWidth = 1;
    for (let i = -size; i < size * 2; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size, size);
      ctx.stroke();
    }

    // 2. FOG-OF-WAR REVEAL LAYER: Stamp soft radial light circles for explored nodes
    const scaleFactor = (half - 8) / radarRange;
    const pxRadius = revealRadius * scaleFactor;

    // Explored breadcrumbs within radar view
    const allExploredNodes = [
      ...exploredPointsRef.current,
      { x: playerX, z: playerZ }, // active player vision
    ];

    allExploredNodes.forEach((node) => {
      const distToPlayer = Math.hypot(node.x - playerX, node.z - playerZ);
      if (distToPlayer <= radarRange + revealRadius + 5) {
        const mx = half + (node.x - playerX) * scaleFactor;
        const my = half + (node.z - playerZ) * scaleFactor;

        // Soft feathered radial gradient burning away fog of war
        const grad = ctx.createRadialGradient(mx, my, pxRadius * 0.35, mx, my, pxRadius);
        grad.addColorStop(0, '#2c1e14');   // inner explored warm savanna
        grad.addColorStop(0.7, '#20150d');  // mid transition
        grad.addColorStop(1, 'rgba(14, 9, 6, 0)'); // fade out to fog

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mx, my, pxRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 3. RADAR COMPASS GRID LINES (clipped to circular radar)
    ctx.strokeStyle = '#3d281a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Concentric range rings
    ctx.arc(half, half, (half - 8) * 0.66, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(half, half, (half - 8) * 0.33, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = '#332014';
    ctx.beginPath();
    ctx.moveTo(half, 4);
    ctx.lineTo(half, size - 4);
    ctx.moveTo(4, half);
    ctx.lineTo(size - 4, half);
    ctx.stroke();

    // 4. ENTITY RENDERING (ONLY REVEALED ENTITIES ARE VISIBLE!)
    entities.forEach((ent) => {
      const dist = Math.hypot(ent.x - playerX, ent.z - playerZ);
      if (dist > radarRange) return;

      // FOG OF WAR VALIDATION: If entity location is unexplored, HIDE IT!
      if (!isPositionExplored(ent.x, ent.z)) {
        return; // Kept hidden under fog-of-war!
      }

      const ex = half + (ent.x - playerX) * scaleFactor;
      const ey = half + (ent.z - playerZ) * scaleFactor;

      const isKeyStructure =
        ent.type === 'campfire' ||
        ent.type === 'science' ||
        ent.type === 'crock_pot' ||
        ent.type === 'shadow_creature';

      const dotRadius = isKeyStructure ? 3.8 : 2.2;

      // Glow halo for active structures
      if (isKeyStructure) {
        ctx.fillStyle = getEntityColor(ent.type);
        ctx.beginPath();
        ctx.arc(ex, ey, dotRadius + 1.8, 0, Math.PI * 2);
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Main entity marker
      ctx.fillStyle = getEntityColor(ent.type);
      ctx.beginPath();
      ctx.arc(ex, ey, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sharp dark border
      ctx.strokeStyle = '#120b06';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 5. PLAYER WILSON CENTER MARKER
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(half, half, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#241400';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. CAMERA ORIENTATION CONE (Direction player is facing/viewing)
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(-cameraAngle + Math.PI);

    ctx.fillStyle = '#fce28b';
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(-4, -4);
    ctx.lineTo(4, -4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore(); // Restore circular clip

    // 7. OUTER GOTHIC BRASS RIVET BEZEL
    ctx.strokeStyle = '#6a4b35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(half, half, half - 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#8d6849';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(half, half, half - 5, 0, Math.PI * 2);
    ctx.stroke();

    // Compass Cardinal Indicators (N, S, E, W)
    ctx.fillStyle = '#caa066';
    ctx.font = 'bold 8px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', half, 8);
    ctx.fillText('S', half, size - 8);
    ctx.fillText('E', size - 8, half);
    ctx.fillText('W', 8, half);
  }, [playerX, playerZ, cameraAngle, entities, size, half, radarRange, isExpanded]);

  return (
    <div className="relative select-none pointer-events-auto flex flex-col items-center">
      {/* Interactive Minimap Frame */}
      <div
        className="relative rounded-full bg-[#17100b] border-2 md:border-3 border-[#614530] shadow-[0_6px_22px_rgba(0,0,0,0.92)] p-0.5 overflow-hidden transition-all duration-200 cursor-pointer"
        style={{ width: size, height: size }}
        onClick={() => setIsExpanded(!isExpanded)}
        title="點擊切換小地圖大小 (迷霧將隨探索逐漸揭曉)"
      >
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="rounded-full block"
        />

        {/* Ambient Fog-of-War Vignette Overlay */}
        <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_14px_rgba(0,0,0,0.85)] border border-[#8a6547]/40" />
      </div>

      {/* Exploration Progress & Range Readout */}
      <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#1b120c]/95 border border-[#523927] text-center shadow flex items-center gap-1.5">
        <span className="text-[10px] text-[#eedaa2] font-cinzel font-bold">
          🗺️ 探索度 {explorationPercentage}%
        </span>
        <span className="text-[9px] text-[#9c8976] font-semibold">
          ({isExpanded ? '70m' : '45m'})
        </span>
      </div>
    </div>
  );
};
