import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  ResourceType,
  WorldEntity,
  DayPhase,
  WeatherType,
} from '../types/game';
import {
  createPlayerTexture,
  createEvergreenTreeTexture,
  createGrassTexture,
  createSaplingTexture,
  createBoulderTexture,
  createBerryBushTexture,
  createFlowerTexture,
  createCampfireTexture,
  createScienceMachineTexture,
  createCrockPotTexture,
  createShadowCreatureTexture,
  createGroundTexture,
} from '../graphics/textureGenerator';
import { soundEngine } from '../audio/soundEngine';

// ============================================================================
// WEATHER CONSTANTS & CONFIGURATION
// ============================================================================
export const BASE_PLAYER_SPEED = 10.5;

export const BASE_SANITY_DECAY: Record<DayPhase, number> = {
  day: 0.15,   // Gentle natural baseline decay during daytime
  dusk: 0.8,   // Twilight anxiety
  night: 2.2,  // Midnight terror
};

export const WEATHER_CONFIG: Record<
  WeatherType,
  {
    name: string;
    icon: string;
    movementSpeedMultiplier: number;
    sanityDecayMultiplier: number;
    fogDensity: number;
    ambientColor: { day: number; dusk: number; night: number };
    ambientIntensity: { day: number; dusk: number; night: number };
    description: string;
  }
> = {
  clear: {
    name: '晴朗 (Clear)',
    icon: '☀️',
    movementSpeedMultiplier: 1.0,
    sanityDecayMultiplier: 1.0,
    fogDensity: 0.024,
    ambientColor: { day: 0xd6c5a9, dusk: 0xaa5b38, night: 0x0c0e18 },
    ambientIntensity: { day: 0.88, dusk: 0.48, night: 0.04 },
    description: '風和日麗，視野清晰，移速與精神狀態正常。',
  },
  rain: {
    name: '暴雨 (Rain)',
    icon: '🌧️',
    movementSpeedMultiplier: 0.75, // -25% player movement speed (muddy tracks)
    sanityDecayMultiplier: 1.85,    // +85% sanity decay due to cold rain soak
    fogDensity: 0.038,
    ambientColor: { day: 0x6e828f, dusk: 0x7a4a35, night: 0x080b12 },
    ambientIntensity: { day: 0.58, dusk: 0.38, night: 0.03 },
    description: '地面泥濘減緩移動速度 25%，刺骨雨水大幅加速理智流失！',
  },
  fog: {
    name: '濃霧 (Fog)',
    icon: '🌫️',
    movementSpeedMultiplier: 0.85, // -15% player movement speed (disoriented vision)
    sanityDecayMultiplier: 1.55,    // +55% sanity decay due to psychological dread
    fogDensity: 0.068,
    ambientColor: { day: 0x8f8173, dusk: 0x8a5440, night: 0x07080e },
    ambientIntensity: { day: 0.65, dusk: 0.42, night: 0.03 },
    description: '能見度極度受限，迷失與孤寂恐懼加速理智流失，移速降低 15%！',
  },
};

// ============================================================================
// DYNAMIC WEATHER MANAGER CLASS
// ============================================================================
export class WeatherManager {
  private weather: WeatherType = 'clear';
  private timer: number = 35;
  private onWeatherChange?: (w: WeatherType, reason: string) => void;

  constructor(
    initial: WeatherType = 'clear',
    onChange?: (w: WeatherType, reason: string) => void
  ) {
    this.weather = initial;
    this.onWeatherChange = onChange;
  }

  public getWeather(): WeatherType {
    return this.weather;
  }

  public setWeather(next: WeatherType, reason: string = '天候切換') {
    if (this.weather === next) return;
    this.weather = next;
    this.timer = 35 + Math.random() * 25;
    this.onWeatherChange?.(next, reason);
  }

  public toggleWeather(): WeatherType {
    const states: WeatherType[] = ['clear', 'rain', 'fog'];
    const nextIdx = (states.indexOf(this.weather) + 1) % states.length;
    const nextState = states[nextIdx];
    this.setWeather(nextState, '手動切換');
    return nextState;
  }

  public update(dt: number) {
    this.timer -= dt;
    if (this.timer <= 0) {
      const roll = Math.random();
      let next: WeatherType = 'clear';
      if (roll < 0.45) next = 'clear';
      else if (roll < 0.75) next = 'rain';
      else next = 'fog';

      if (next !== this.weather) {
        this.setWeather(next, '荒野自然演變');
      } else {
        this.timer = 30 + Math.random() * 20;
      }
    }
  }

  public getMovementSpeedMultiplier(): number {
    return WEATHER_CONFIG[this.weather].movementSpeedMultiplier;
  }

  public getSanityDecayMultiplier(): number {
    return WEATHER_CONFIG[this.weather].sanityDecayMultiplier;
  }
}

interface GameCanvasProps {
  onUpdateStats: (updater: (prev: {
    health: number;
    hunger: number;
    sanity: number;
    dayCount: number;
    timeOfDay: number;
    phase: DayPhase;
    weather: WeatherType;
    techLevel: number;
    torchDurability: number;
    isDead: boolean;
    deathReason: string;
    itemsCraftedCount: number;
    resourcesGatheredCount: number;
  }) => any) => void;
  inventory: Record<ResourceType, number>;
  setInventory: React.Dispatch<React.SetStateAction<Record<ResourceType, number>>>;
  equippedTool: ResourceType | null;
  setEquippedTool: React.Dispatch<React.SetStateAction<ResourceType | null>>;
  onShowMessage: (msg: string) => void;
  onUpdateEntitiesList: (entities: WorldEntity[], playerX: number, playerZ: number, angle: number) => void;
  actionTriggerRef: React.MutableRefObject<{
    placeCampfire?: () => void;
    placeScience?: () => void;
    placeCrockPot?: () => void;
    toggleWeather?: () => void;
  }>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onUpdateStats,
  inventory,
  setInventory,
  equippedTool,
  setEquippedTool,
  onShowMessage,
  onUpdateEntitiesList,
  actionTriggerRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References for mutable game loop state
  const stateRef = useRef({
    playerX: 0,
    playerZ: 0,
    cameraAngle: Math.PI / 4,
    targetCameraAngle: Math.PI / 4,
    timeOfDay: 0,
    dayCount: 1,
    phase: 'day' as DayPhase,
    weather: 'clear' as WeatherType,
    health: 150,
    maxHealth: 150,
    hunger: 150,
    maxHunger: 150,
    sanity: 200,
    maxSanity: 200,
    torchDurability: 100,
    inDarknessTimer: 0,
    techLevel: 0,
    isDead: false,
    deathReason: '',
    walkFrame: 0,
    isMoving: false,
    keys: {} as Record<string, boolean>,
  });

  // Weather Manager Reference
  const weatherManagerRef = useRef<WeatherManager>(
    new WeatherManager('clear', (nextWeather, reason) => {
      stateRef.current.weather = nextWeather;
      if (nextWeather === 'rain') {
        soundEngine.play('thunder');
        soundEngine.updateRainAmbient(true);
        onShowMessage(`⛈️ 暴雨驟降（${reason}）！地面泥濘使移動速度降低 25%，刺骨雨水大幅加速理智流失！`);
      } else if (nextWeather === 'fog') {
        soundEngine.play('fog_wind');
        soundEngine.updateRainAmbient(false);
        onShowMessage(`🌫️ 刺骨濃霧瀰漫（${reason}）！能見度驟降，迷失恐慌加速理智流失，移速降低 15%！`);
      } else {
        soundEngine.updateRainAmbient(false);
        onShowMessage(`☀️ 天氣放晴了（${reason}）！雨霧散去，視野開闊，移動速度與理智回歸正常。`);
      }
    })
  );

  const entitiesRef = useRef<{
    ent: WorldEntity;
    mesh: THREE.Mesh;
  }[]>([]);

  const shadowCreaturesRef = useRef<{
    id: string;
    mesh: THREE.Mesh;
    x: number;
    z: number;
    hp: number;
  }[]>([]);

  // Track textures to dispose or swap
  const playerTexturesRef = useRef<{
    normal?: THREE.CanvasTexture;
    torch?: THREE.CanvasTexture;
    axe?: THREE.CanvasTexture;
  }>({});

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const playerMeshRef = useRef<THREE.Mesh | null>(null);
  const torchLightRef = useRef<THREE.PointLight | null>(null);
  const campfireLightsRef = useRef<THREE.PointLight[]>([]);

  // Function to spawn world entities
  const spawnEntity = useCallback((type: WorldEntity['type'], x: number, z: number) => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    let width = 2.4;
    let height = 2.4;
    let texture: THREE.CanvasTexture;

    switch (type) {
      case 'tree':
        width = 3.8;
        height = 5.2;
        texture = createEvergreenTreeTexture();
        break;
      case 'grass':
        width = 2.2;
        height = 2.2;
        texture = createGrassTexture();
        break;
      case 'sapling':
        width = 1.9;
        height = 2.4;
        texture = createSaplingTexture();
        break;
      case 'boulder':
        width = 2.6;
        height = 2.6;
        texture = createBoulderTexture();
        break;
      case 'berrybush':
        width = 2.4;
        height = 2.4;
        texture = createBerryBushTexture(true);
        break;
      case 'flower':
        width = 1.6;
        height = 1.6;
        texture = createFlowerTexture();
        break;
      case 'campfire':
        width = 2.4;
        height = 2.4;
        texture = createCampfireTexture();
        break;
      case 'science':
        width = 3.2;
        height = 3.2;
        texture = createScienceMachineTexture();
        break;
      case 'crock_pot':
        width = 2.8;
        height = 2.8;
        texture = createCrockPotTexture();
        break;
      default:
        width = 2.0;
        height = 2.0;
        texture = createGrassTexture();
    }

    const mat = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide,
    });
    const geo = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    scene.add(mesh);

    const entData: WorldEntity = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      x,
      z,
      harvestable: true,
      durability: type === 'tree' ? 3 : type === 'boulder' ? 3 : 1,
      maxDurability: type === 'tree' ? 3 : type === 'boulder' ? 3 : 1,
    };

    entitiesRef.current.push({ ent: entData, mesh });

    // If campfire, also add a warm point light to scene
    if (type === 'campfire') {
      const campLight = new THREE.PointLight(0xff7722, 2.2, 16, 1.2);
      campLight.position.set(x, 1.5, z);
      scene.add(campLight);
      campfireLightsRef.current.push(campLight);
    }

    return entData;
  }, []);

  // Connect actionTriggerRef for placing objects & toggling weather
  useEffect(() => {
    actionTriggerRef.current.placeCampfire = () => {
      const px = stateRef.current.playerX + Math.sin(stateRef.current.cameraAngle) * 2;
      const pz = stateRef.current.playerZ + Math.cos(stateRef.current.cameraAngle) * 2;
      spawnEntity('campfire', px, pz);
      soundEngine.play('torch');
      onShowMessage('搭建了 營火！夜晚可在此取暖、烹調並抵禦雨水寒意。');
    };

    actionTriggerRef.current.placeScience = () => {
      const px = stateRef.current.playerX + Math.sin(stateRef.current.cameraAngle) * 3;
      const pz = stateRef.current.playerZ + Math.cos(stateRef.current.cameraAngle) * 3;
      spawnEntity('science', px, pz);
      soundEngine.play('craft');
      onShowMessage('建造了 科學機器！解鎖科技等級 1！');
    };

    actionTriggerRef.current.placeCrockPot = () => {
      const px = stateRef.current.playerX + Math.sin(stateRef.current.cameraAngle) * 2.5;
      const pz = stateRef.current.playerZ + Math.cos(stateRef.current.cameraAngle) * 2.5;
      spawnEntity('crock_pot', px, pz);
      soundEngine.play('craft');
      onShowMessage('建造了 烹飪鍋！可在左側選單組合 4 種食材燉煮高階料理！');
    };

    actionTriggerRef.current.toggleWeather = () => {
      weatherManagerRef.current.toggleWeather();
    };
  }, [spawnEntity, onShowMessage, actionTriggerRef]);

  // Handle player texture swap based on equippedTool
  useEffect(() => {
    if (!playerMeshRef.current) return;
    const isTorch = equippedTool === 'torch';
    const isAxe = equippedTool === 'axe' || equippedTool === 'spear';

    let tex = playerTexturesRef.current.normal;
    if (isTorch) {
      if (!playerTexturesRef.current.torch) {
        playerTexturesRef.current.torch = createPlayerTexture(true, false);
      }
      tex = playerTexturesRef.current.torch;
    } else if (isAxe) {
      if (!playerTexturesRef.current.axe) {
        playerTexturesRef.current.axe = createPlayerTexture(false, true);
      }
      tex = playerTexturesRef.current.axe;
    } else {
      if (!playerTexturesRef.current.normal) {
        playerTexturesRef.current.normal = createPlayerTexture(false, false);
      }
      tex = playerTexturesRef.current.normal;
    }

    if (tex && playerMeshRef.current.material instanceof THREE.MeshLambertMaterial) {
      playerMeshRef.current.material.map = tex;
      playerMeshRef.current.material.needsUpdate = true;
    }
  }, [equippedTool]);

  // Interact with nearby entities
  const performInteraction = useCallback(() => {
    if (stateRef.current.isDead) return;
    const px = stateRef.current.playerX;
    const pz = stateRef.current.playerZ;

    // Check nearby Shadow Creatures to attack with weapon
    let nearestShadow = null;
    let minShadowDist = 3.5;
    for (const sc of shadowCreaturesRef.current) {
      const d = Math.sqrt((sc.x - px) ** 2 + (sc.z - pz) ** 2);
      if (d < minShadowDist) {
        minShadowDist = d;
        nearestShadow = sc;
      }
    }

    if (nearestShadow) {
      soundEngine.play('hit');
      const hasWeapon = equippedTool === 'spear' ? 2 : equippedTool === 'axe' ? 1.5 : 1;
      nearestShadow.hp -= hasWeapon;
      if (nearestShadow.hp <= 0) {
        if (sceneRef.current) sceneRef.current.remove(nearestShadow.mesh);
        shadowCreaturesRef.current = shadowCreaturesRef.current.filter((s) => s.id !== nearestShadow.id);
        stateRef.current.sanity = Math.min(stateRef.current.maxSanity, stateRef.current.sanity + 25);
        onShowMessage('擊退了 暗影怪物！精神得到了舒緩 (+25 理智)');
      } else {
        onShowMessage('揮擊攻擊暗影！');
      }
      return;
    }

    // Check world entities
    let nearest = null;
    let minDist = 3.6;

    for (const item of entitiesRef.current) {
      if (!item.ent.harvestable) continue;
      const d = Math.sqrt((item.ent.x - px) ** 2 + (item.ent.z - pz) ** 2);
      if (d < minDist) {
        minDist = d;
        nearest = item;
      }
    }

    if (!nearest) {
      onShowMessage('周圍沒有可採集的物件 (靠近植物、岩石或烹飪鍋)');
      return;
    }

    const { ent, mesh } = nearest;

    // Interacting with Crock Pot
    if (ent.type === 'crock_pot') {
      soundEngine.play('boil');
      onShowMessage('🍲 靠近了烹飪鍋！可在左側選單點擊【🍲 烹飪鍋】投入 4 種食材燉煮！');
      return;
    }

    // Cooking at Campfire
    if (ent.type === 'campfire') {
      if (inventory.berries > 0) {
        setInventory((prev) => ({
          ...prev,
          berries: prev.berries - 1,
          cooked_berries: (prev.cooked_berries || 0) + 1,
        }));
        soundEngine.play('cook');
        onShowMessage('在營火上烘烤了 漿果 ➔ 獲得 烤漿果！');
      } else {
        onShowMessage('溫暖的營火持續燃燒著。背包中若有生漿果可在此烘烤！');
      }
      return;
    }

    // Gathering or Harvesting
    let harvested = false;

    if (ent.type === 'tree') {
      const chopPower = equippedTool === 'axe' ? 2 : 1;
      ent.durability = (ent.durability || 3) - chopPower;
      soundEngine.play('chop');

      if ((ent.durability || 0) <= 0) {
        harvested = true;
        setInventory((prev) => ({
          ...prev,
          twigs: (prev.twigs || 0) + 3,
        }));
        onShowMessage('砍倒了常青樹！獲得 樹枝 x3');
      } else {
        onShowMessage(`砍伐中... (剩餘 ${(ent.durability || 0)} 下)`);
      }
    } else if (ent.type === 'boulder') {
      const minePower = equippedTool === 'pickaxe' ? 2 : 1;
      ent.durability = (ent.durability || 3) - minePower;
      soundEngine.play('mine');

      if ((ent.durability || 0) <= 0) {
        harvested = true;
        setInventory((prev) => ({
          ...prev,
          rocks: (prev.rocks || 0) + 3,
          flint: (prev.flint || 0) + 2,
        }));
        onShowMessage('開採了巨石！獲得 石頭 x3, 燧石 x2');
      } else {
        onShowMessage(`開採岩石中... (剩餘 ${(ent.durability || 0)} 下)`);
      }
    } else if (ent.type === 'grass') {
      harvested = true;
      soundEngine.play('gather');
      setInventory((prev) => ({
        ...prev,
        cutgrass: (prev.cutgrass || 0) + 1,
      }));
      onShowMessage('採集獲得: 乾草 x1');
    } else if (ent.type === 'sapling') {
      harvested = true;
      soundEngine.play('gather');
      setInventory((prev) => ({
        ...prev,
        twigs: (prev.twigs || 0) + 1,
      }));
      onShowMessage('採集獲得: 樹枝 x1');
    } else if (ent.type === 'berrybush') {
      harvested = true;
      soundEngine.play('gather');
      setInventory((prev) => ({
        ...prev,
        berries: (prev.berries || 0) + 2,
      }));
      onShowMessage('摘取獲得: 漿果 x2');
    } else if (ent.type === 'flower') {
      harvested = true;
      soundEngine.play('gather');
      setInventory((prev) => ({
        ...prev,
        flower: (prev.flower || 0) + 1,
      }));
      stateRef.current.sanity = Math.min(stateRef.current.maxSanity, stateRef.current.sanity + 5);
      onShowMessage('採集野花: 獲得 野花 x1 (+5 理智)');
    }

    if (harvested) {
      ent.harvestable = false;
      if (sceneRef.current) {
        sceneRef.current.remove(mesh);
      }
      onUpdateStats((prev) => ({
        ...prev,
        resourcesGatheredCount: prev.resourcesGatheredCount + 1,
      }));
    }
  }, [equippedTool, inventory, setInventory, onShowMessage, onUpdateStats]);

  // Main Three.js Lifecycle & Game Loop
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x19120c);
    scene.fog = new THREE.FogExp2(0x19120c, 0.024);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xd4c2a5, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e0, 0.75);
    dirLight.position.set(50, 90, 50);
    scene.add(dirLight);

    // Wilson's Torch/Lantern Light
    const torchLight = new THREE.PointLight(0xffaa33, 0, 18, 1.5);
    scene.add(torchLight);
    torchLightRef.current = torchLight;

    // --- Ground Plane ---
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const groundMat = new THREE.MeshLambertMaterial({ map: createGroundTexture() });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    scene.add(groundMesh);

    // --- Dynamic Weather: Rain Particle System ---
    const rainCount = 1600;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 70;
      rainPositions[i * 3 + 1] = Math.random() * 30;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x9bc2e8,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);

    // --- Wilson Player Mesh ---
    playerTexturesRef.current.normal = createPlayerTexture(false, false);
    const playerMat = new THREE.MeshLambertMaterial({
      map: playerTexturesRef.current.normal,
      transparent: true,
      alphaTest: 0.2,
      side: THREE.DoubleSide,
    });
    const playerGeo = new THREE.PlaneGeometry(2.3, 2.3);
    const playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.position.set(0, 1.15, 0);
    scene.add(playerMesh);
    playerMeshRef.current = playerMesh;

    // --- Spawn World Resources Initially ---
    const entitiesToSpawn: [WorldEntity['type'], number][] = [
      ['tree', 48],
      ['grass', 40],
      ['sapling', 38],
      ['boulder', 30],
      ['berrybush', 26],
      ['flower', 30],
    ];

    entitiesToSpawn.forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        const rad = 6 + Math.random() * 85;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        spawnEntity(type, x, z);
      }
    });

    // Spawn 1 initial campfire and 1 crock pot near start so player has safe haven
    spawnEntity('campfire', 4, 3);
    spawnEntity('crock_pot', -4, 2);

    // --- Keyboard Event Listeners ---
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'q') {
        stateRef.current.targetCameraAngle -= Math.PI / 4;
        soundEngine.play('click');
      }
      if (e.key.toLowerCase() === 'e') {
        stateRef.current.targetCameraAngle += Math.PI / 4;
        soundEngine.play('click');
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        performInteraction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation & Physics Loop ---
    let lastTime = performance.now();
    let animId: number;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = stateRef.current;
      if (state.isDead) {
        renderer.render(scene, camera);
        return;
      }

      // --- DYNAMIC WEATHER MANAGER TICK ---
      weatherManagerRef.current.update(dt);
      const currentWeather = weatherManagerRef.current.getWeather();
      state.weather = currentWeather;

      // 1. Player Movement & Speed modified by active weather constant
      const movementSpeedMultiplier = weatherManagerRef.current.getMovementSpeedMultiplier();
      const speed = BASE_PLAYER_SPEED * movementSpeedMultiplier * dt;

      const moveDir = new THREE.Vector3();
      const keys = state.keys;

      if (keys['w'] || keys['arrowup']) moveDir.z -= 1;
      if (keys['s'] || keys['arrowdown']) moveDir.z += 1;
      if (keys['a'] || keys['arrowleft']) moveDir.x -= 1;
      if (keys['d'] || keys['arrowright']) moveDir.x += 1;

      state.isMoving = moveDir.lengthSq() > 0;

      if (state.isMoving) {
        moveDir.normalize();
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.cameraAngle);
        playerMesh.position.addScaledVector(moveDir, speed);
        state.playerX = playerMesh.position.x;
        state.playerZ = playerMesh.position.z;

        // Walking vertical bobbing animation
        state.walkFrame += dt * 14;
        playerMesh.position.y = 1.15 + Math.sin(state.walkFrame) * 0.08;
      } else {
        playerMesh.position.y = 1.15;
      }

      // 2. Camera Orbit & Lerp
      state.cameraAngle += (state.targetCameraAngle - state.cameraAngle) * 0.12;

      const camDist = 23;
      const camHeight = 21;
      camera.position.x = state.playerX + Math.sin(state.cameraAngle) * camDist;
      camera.position.z = state.playerZ + Math.cos(state.cameraAngle) * camDist;
      camera.position.y = camHeight;
      camera.lookAt(state.playerX, 1.4, state.playerZ);

      // 3. Billboard rotation: all 2D sprites face camera
      playerMesh.rotation.y = state.cameraAngle;

      entitiesRef.current.forEach(({ mesh }) => {
        mesh.rotation.y = state.cameraAngle;
      });

      shadowCreaturesRef.current.forEach(({ mesh }) => {
        mesh.rotation.y = state.cameraAngle;
      });

      // 4. Update Dynamic Weather Particles & Fog in Scene
      if (currentWeather === 'rain') {
        rainParticles.visible = true;
        const posAttr = rainGeo.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          posArr[i * 3 + 1] -= 52 * dt;
          if (posArr[i * 3 + 1] < 0) {
            posArr[i * 3 + 1] = 26 + Math.random() * 4;
            posArr[i * 3] = state.playerX + (Math.random() - 0.5) * 60;
            posArr[i * 3 + 2] = state.playerZ + (Math.random() - 0.5) * 60;
          }
        }
        posAttr.needsUpdate = true;
      } else {
        rainParticles.visible = false;
      }

      // Smooth Fog density adjustment based on active weather condition
      if (scene.fog instanceof THREE.FogExp2) {
        const targetFogDensity = WEATHER_CONFIG[currentWeather].fogDensity;
        scene.fog.density += (targetFogDensity - scene.fog.density) * 0.04;
      }

      // 5. Day / Dusk / Night Cycle Progression
      const daySeconds = 65; // 65 seconds per full in-game day
      state.timeOfDay += dt / daySeconds;
      if (state.timeOfDay >= 1.0) {
        state.timeOfDay = 0;
        state.dayCount += 1;
        soundEngine.play('dawn');
        onShowMessage(`第 ${state.dayCount} 天黎明降臨！存活紀錄刷新！`);
      }

      const t = state.timeOfDay;
      let curPhase: DayPhase = 'day';

      if (t < 0.6) {
        curPhase = 'day';
        ambientLight.color.setHex(WEATHER_CONFIG[currentWeather].ambientColor.day);
        ambientLight.intensity = WEATHER_CONFIG[currentWeather].ambientIntensity.day;
        if (scene.fog) {
          scene.fog.color.setHex(currentWeather === 'rain' ? 0x273038 : currentWeather === 'fog' ? 0x383028 : 0x19120c);
        }
      } else if (t < 0.78) {
        curPhase = 'dusk';
        ambientLight.color.setHex(WEATHER_CONFIG[currentWeather].ambientColor.dusk);
        ambientLight.intensity = WEATHER_CONFIG[currentWeather].ambientIntensity.dusk;
        if (scene.fog) scene.fog.color.setHex(0x241108);
      } else {
        curPhase = 'night';
        ambientLight.color.setHex(WEATHER_CONFIG[currentWeather].ambientColor.night);
        ambientLight.intensity = WEATHER_CONFIG[currentWeather].ambientIntensity.night;
        if (scene.fog) scene.fog.color.setHex(0x090a12);
      }

      state.phase = curPhase;

      // Check proximity to Campfire
      const nearCampfire = entitiesRef.current.some(
        (e) =>
          e.ent.type === 'campfire' &&
          Math.sqrt((e.ent.x - state.playerX) ** 2 + (e.ent.z - state.playerZ) ** 2) < 7.5
      );

      // Check proximity to Science Machine
      const nearScience = entitiesRef.current.some(
        (e) =>
          e.ent.type === 'science' &&
          Math.sqrt((e.ent.x - state.playerX) ** 2 + (e.ent.z - state.playerZ) ** 2) < 5.5
      );
      state.techLevel = nearScience ? 1 : 0;

      // Handle Torch Equip & Durability
      const hasTorchEquipped = equippedTool === 'torch' && state.torchDurability > 0;
      if (hasTorchEquipped) {
        state.torchDurability -= (100 / 45) * dt;
        if (state.torchDurability <= 0) {
          state.torchDurability = 0;
          setEquippedTool(null);
          setInventory((prev) => ({
            ...prev,
            torch: Math.max(0, (prev.torch || 0) - 1),
          }));
          onShowMessage('火把燃燒殆盡燒成灰燼！');
        }
      }

      // Update Wilson's Light source
      if (hasTorchEquipped || nearCampfire) {
        torchLight.position.set(state.playerX, 2.4, state.playerZ);
        torchLight.intensity = 1.8 + Math.random() * 0.25;
      } else {
        torchLight.intensity = 0;
      }

      // --- SANITY DECAY MULTIPLIER APPLICATION BASED ON WEATHER ---
      const basePhaseSanityDecay = BASE_SANITY_DECAY[curPhase];
      const sanityDecayMultiplier = weatherManagerRef.current.getSanityDecayMultiplier();
      let calculatedSanityDecay = basePhaseSanityDecay * sanityDecayMultiplier;

      // Protective buffer: If raining, fire warmth mitigates cold rain soak
      if (currentWeather === 'rain' && (nearCampfire || hasTorchEquipped)) {
        calculatedSanityDecay *= 0.55;
      }

      state.sanity -= calculatedSanityDecay * dt;

      // 6. Darkness & Charlie Night Horror
      const isPitchDark = curPhase === 'night' && !hasTorchEquipped && !nearCampfire;

      if (isPitchDark) {
        state.inDarknessTimer += dt;

        if (state.inDarknessTimer >= 1.4 && state.inDarknessTimer - dt < 1.4) {
          soundEngine.play('charlie_warning');
        }

        if (state.inDarknessTimer >= 2.8) {
          // Charlie strikes!
          soundEngine.play('charlie');
          state.health -= 50;
          state.sanity -= 40;
          state.inDarknessTimer = 0;
          onShowMessage('「是誰在黑暗中...？！」(查理夜襲撕裂了你！)');

          if (state.health <= 0) {
            state.health = 0;
            state.isDead = true;
            state.deathReason = '被查理 (Charlie) 於無光永夜中殘忍撕裂';
          }
        }
      } else {
        state.inDarknessTimer = 0;
      }

      // 7. Hunger & Starvation
      state.hunger -= (150 / 420) * dt;
      if (state.hunger <= 0) {
        state.hunger = 0;
        state.health -= 2.6 * dt;
        if (state.health <= 0) {
          state.health = 0;
          state.isDead = true;
          state.deathReason = '饑餓難耐，死於漫漫荒野';
        }
      }

      // Clamp Sanity & Update Sanity Audio Drone
      state.sanity = Math.max(0, Math.min(state.maxSanity, state.sanity));
      soundEngine.updateSanityWhisper(state.sanity / state.maxSanity);

      // Low Sanity Spawn Shadow Creatures
      if (state.sanity < 70 && shadowCreaturesRef.current.length < 2) {
        const scTexture = createShadowCreatureTexture();
        const scMat = new THREE.MeshLambertMaterial({
          map: scTexture,
          transparent: true,
          alphaTest: 0.15,
          side: THREE.DoubleSide,
        });
        const scGeo = new THREE.PlaneGeometry(2.6, 2.6);
        const scMesh = new THREE.Mesh(scGeo, scMat);
        const angle = Math.random() * Math.PI * 2;
        const dist = 14 + Math.random() * 8;
        const sx = state.playerX + Math.cos(angle) * dist;
        const sz = state.playerZ + Math.sin(angle) * dist;
        scMesh.position.set(sx, 1.3, sz);
        scene.add(scMesh);

        shadowCreaturesRef.current.push({
          id: Math.random().toString(),
          mesh: scMesh,
          x: sx,
          z: sz,
          hp: 2,
        });
      }

      // Shadow Creatures creep towards player if Sanity is very low (< 40)
      if (state.sanity < 40) {
        shadowCreaturesRef.current.forEach((sc) => {
          const dx = state.playerX - sc.x;
          const dz = state.playerZ - sc.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > 1.8) {
            sc.x += (dx / dist) * 3.2 * dt;
            sc.z += (dz / dist) * 3.2 * dt;
            sc.mesh.position.set(sc.x, 1.3, sc.z);
          } else {
            state.health -= 8 * dt;
            state.sanity -= 5 * dt;
            if (state.health <= 0) {
              state.health = 0;
              state.isDead = true;
              state.deathReason = '被精神崩潰喚醒的暗影爬行怪物吞噬';
            }
          }
        });
      }

      // 8. Push stats update to React UI
      onUpdateStats(() => ({
        health: state.health,
        hunger: state.hunger,
        sanity: state.sanity,
        dayCount: state.dayCount,
        timeOfDay: state.timeOfDay,
        phase: state.phase,
        weather: currentWeather,
        techLevel: state.techLevel,
        torchDurability: state.torchDurability,
        isDead: state.isDead,
        deathReason: state.deathReason,
        itemsCraftedCount: 0,
        resourcesGatheredCount: 0,
      }));

      // Update Minimap entity positions
      onUpdateEntitiesList(
        entitiesRef.current.map((e) => e.ent),
        state.playerX,
        state.playerZ,
        state.cameraAngle
      );

      // Render
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      soundEngine.updateRainAmbient(false);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [spawnEntity, performInteraction, onShowMessage, onUpdateStats, onUpdateEntitiesList, equippedTool, setEquippedTool, setInventory]);

  // Method to rotate camera via buttons
  const rotateCamera = (dir: -1 | 1) => {
    stateRef.current.targetCameraAngle += dir * (Math.PI / 4);
    soundEngine.play('click');
  };

  // Method to toggle weather manually via button
  const handleToggleWeatherClick = () => {
    weatherManagerRef.current.toggleWeather();
  };

  return (
    <div className="relative w-full h-full">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* On-screen Camera & Action Controls (Useful on mobile or quick clicking) */}
      <div className="absolute bottom-24 right-4 flex flex-col items-end gap-2.5 z-30 pointer-events-auto select-none">
        {/* Weather Toggle & Quick Camera Rotate buttons */}
        <div className="flex gap-2">
          {/* Weather Toggle Button */}
          <button
            onClick={handleToggleWeatherClick}
            className="px-3 h-11 rounded-full bg-[#20150e]/95 border-2 border-[#5c402d] text-[#e8c688] font-cinzel font-bold text-xs shadow-xl hover:bg-[#342216] active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="手動切換天候 (晴朗 / 暴雨 / 濃霧)"
          >
            <span>{WEATHER_CONFIG[stateRef.current.weather].icon}</span>
            <span>切換天候</span>
          </button>

          <button
            onClick={() => rotateCamera(-1)}
            className="w-11 h-11 rounded-full bg-[#20150e]/90 border-2 border-[#5c402d] text-[#e8c688] font-cinzel font-bold text-sm shadow-xl hover:bg-[#342216] active:scale-95 flex items-center justify-center cursor-pointer"
            title="逆時針旋轉視角 (Q)"
          >
            Q ⟲
          </button>
          <button
            onClick={() => rotateCamera(1)}
            className="w-11 h-11 rounded-full bg-[#20150e]/90 border-2 border-[#5c402d] text-[#e8c688] font-cinzel font-bold text-sm shadow-xl hover:bg-[#342216] active:scale-95 flex items-center justify-center cursor-pointer"
            title="順時針旋轉視角 (E)"
          >
            ⟳ E
          </button>
        </div>

        {/* Primary Action Button (Space / Interact / Harvest) */}
        <button
          onClick={performInteraction}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#8c5225] to-[#a86532] border-2 border-[#f0c262] text-[#fff8ea] font-cinzel font-bold text-sm md:text-base shadow-2xl active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span>✋</span>
          <span>採集 / 互動 [Space]</span>
        </button>
      </div>
    </div>
  );
};
