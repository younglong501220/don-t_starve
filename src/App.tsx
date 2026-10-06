import React, { useState, useRef, useCallback } from 'react';
import {
  ResourceType,
  DayPhase,
  WeatherType,
  WorldEntity,
  CraftRecipe,
} from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { ClockDial } from './components/ClockDial';
import { StatBadge } from './components/StatBadge';
import { CraftingPanel } from './components/CraftingPanel';
import { InventoryBar } from './components/InventoryBar';
import { Minimap } from './components/Minimap';
import { SanityVignette } from './components/SanityVignette';
import { GameOverModal } from './components/GameOverModal';
import { soundEngine } from './audio/soundEngine';
import { Volume2, VolumeX, HelpCircle } from 'lucide-react';

export default function App() {
  // Survival attributes state
  const [stats, setStats] = useState({
    health: 150,
    maxHealth: 150,
    hunger: 150,
    maxHunger: 150,
    sanity: 200,
    maxSanity: 200,
    dayCount: 1,
    timeOfDay: 0,
    phase: 'day' as DayPhase,
    weather: 'clear' as WeatherType,
    techLevel: 0,
    torchDurability: 100,
    isDead: false,
    deathReason: '',
    itemsCraftedCount: 0,
    resourcesGatheredCount: 0,
  });

  // Inventory state
  const [inventory, setInventory] = useState<Record<ResourceType, number>>({
    cutgrass: 3,
    twigs: 3,
    flint: 2,
    rocks: 2,
    berries: 4,
    flower: 2,
    torch: 0,
    axe: 0,
    pickaxe: 0,
    spear: 0,
    garland: 0,
    cooked_berries: 0,
    crock_pot: 0,
    jam: 0,
    fruit_medley: 0,
    flower_salad: 0,
    kabobs: 0,
    soothing_tea: 0,
    trail_mix: 0,
    wet_goop: 0,
  });

  const [equippedTool, setEquippedTool] = useState<ResourceType | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>(
    '歡迎來到荒野！WASD 移動，Q/E 旋轉視角，空白鍵採集，左側可打開【烹飪鍋】燉煮美食！'
  );
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Entities info for Minimap
  const [minimapData, setMinimapData] = useState<{
    entities: WorldEntity[];
    playerX: number;
    playerZ: number;
    angle: number;
  }>({
    entities: [],
    playerX: 0,
    playerZ: 0,
    angle: Math.PI / 4,
  });

  // Action trigger ref to communicate between App and GameCanvas
  const actionTriggerRef = useRef<{
    placeCampfire?: () => void;
    placeScience?: () => void;
    placeCrockPot?: () => void;
  }>({});

  // Display system announcement / toast
  const showMessage = useCallback((msg: string) => {
    setSystemMessage(msg);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setSystemMessage('');
    }, 4500);
  }, []);

  // Update stats from canvas engine
  const handleUpdateStats = useCallback(
    (
      updater: (prev: {
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
      }) => any
    ) => {
      setStats((prev) => {
        const next = updater(prev);
        return {
          ...prev,
          health: next.health,
          hunger: next.hunger,
          sanity: next.sanity,
          dayCount: next.dayCount,
          timeOfDay: next.timeOfDay,
          phase: next.phase,
          weather: next.weather ?? prev.weather,
          techLevel: next.techLevel,
          torchDurability: next.torchDurability,
          isDead: next.isDead,
          deathReason: next.deathReason,
          resourcesGatheredCount: next.resourcesGatheredCount
            ? prev.resourcesGatheredCount + next.resourcesGatheredCount
            : prev.resourcesGatheredCount,
        };
      });
    },
    []
  );

  const handleUpdateEntitiesList = useCallback(
    (entities: WorldEntity[], px: number, pz: number, angle: number) => {
      setMinimapData({
        entities,
        playerX: px,
        playerZ: pz,
        angle,
      });
    },
    []
  );

  // Crafting execution
  const handleCraft = (recipe: CraftRecipe) => {
    // Deduct materials
    setInventory((prev) => {
      const next = { ...prev };
      for (const [res, needed] of Object.entries(recipe.cost)) {
        next[res as ResourceType] = Math.max(0, (next[res as ResourceType] || 0) - (needed || 0));
      }

      if (recipe.onCraftResult === 'inventory' && recipe.targetItem) {
        next[recipe.targetItem] = (next[recipe.targetItem] || 0) + 1;
      }
      return next;
    });

    setStats((prev) => ({
      ...prev,
      itemsCraftedCount: prev.itemsCraftedCount + 1,
    }));

    soundEngine.play('craft');

    if (recipe.onCraftResult === 'place_campfire') {
      actionTriggerRef.current.placeCampfire?.();
    } else if (recipe.onCraftResult === 'place_science') {
      actionTriggerRef.current.placeScience?.();
    } else if (recipe.onCraftResult === 'place_crock_pot') {
      actionTriggerRef.current.placeCrockPot?.();
    } else if (recipe.onCraftResult === 'instant_buff') {
      if (recipe.id === 'garland') {
        setStats((prev) => ({
          ...prev,
          sanity: Math.min(prev.maxSanity, prev.sanity + 35),
        }));
        showMessage('編織了美麗的花環戴在頭上，理智獲得修復 (+35)');
      } else if (recipe.id === 'straw_roll') {
        setStats((prev) => ({
          ...prev,
          hunger: Math.max(0, prev.hunger - 30),
          health: Math.min(prev.maxHealth, prev.health + 50),
          sanity: Math.min(prev.maxSanity, prev.sanity + 50),
        }));
        showMessage('在草席上小憩片刻，精神與體力大幅恢復！(-30 飽食, +50 生命與理智)');
      } else if (recipe.id === 'shadow_amulet') {
        setStats((prev) => ({
          ...prev,
          sanity: Math.min(prev.maxSanity, prev.sanity + 70),
          health: Math.min(prev.maxHealth, prev.health + 30),
        }));
        showMessage('配戴了暗影精煉護符，強大安魂力量驅散了一切恐懼！(+70 理智, +30 生命)');
      }
    } else if (recipe.onCraftResult === 'inventory') {
      showMessage(`成功製作了 ${recipe.name}！已放入背包。`);
    }
  };

  // Cooking dish from Crock Pot
  const handleCookDish = (dishKey: ResourceType, consumedIngredients: ResourceType[]) => {
    setInventory((prev) => {
      const next = { ...prev };
      for (const ing of consumedIngredients) {
        next[ing] = Math.max(0, (next[ing] || 0) - 1);
      }
      next[dishKey] = (next[dishKey] || 0) + 1;
      return next;
    });

    setStats((prev) => ({
      ...prev,
      itemsCraftedCount: prev.itemsCraftedCount + 1,
    }));
  };

  // Using item (Eating / Flower smelling / Gourmet dishes)
  const handleUseItem = (item: ResourceType) => {
    switch (item) {
      case 'berries':
        if ((inventory.berries || 0) > 0) {
          setInventory((prev) => ({ ...prev, berries: prev.berries - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 25),
            health: Math.min(prev.maxHealth, prev.health + 3),
          }));
          soundEngine.play('eat');
          showMessage('食用了新鮮漿果 (+25 飽食, +3 生命)');
        }
        break;

      case 'cooked_berries':
        if ((inventory.cooked_berries || 0) > 0) {
          setInventory((prev) => ({ ...prev, cooked_berries: prev.cooked_berries - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 35),
            health: Math.min(prev.maxHealth, prev.health + 15),
            sanity: Math.min(prev.maxSanity, prev.sanity + 5),
          }));
          soundEngine.play('eat');
          showMessage('品嚐了熱騰騰的烤漿果！營養美味！(+35 飽食, +15 生命, +5 理智)');
        }
        break;

      case 'flower':
        if ((inventory.flower || 0) > 0) {
          setInventory((prev) => ({ ...prev, flower: prev.flower - 1 }));
          setStats((prev) => ({
            ...prev,
            sanity: Math.min(prev.maxSanity, prev.sanity + 5),
          }));
          soundEngine.play('gather');
          showMessage('輕嗅野花的清香 (+5 理智)');
        }
        break;

      // --- Crock Pot Gourmet Dishes ---
      case 'jam':
        if ((inventory.jam || 0) > 0) {
          setInventory((prev) => ({ ...prev, jam: prev.jam - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 37.5),
            health: Math.min(prev.maxHealth, prev.health + 5),
            sanity: Math.min(prev.maxSanity, prev.sanity + 8),
          }));
          soundEngine.play('eat');
          showMessage('享用了甜潤濃郁的【果醬蜜餞】！(+37.5 飽食, +5 生命, +8 理智)');
        }
        break;

      case 'fruit_medley':
        if ((inventory.fruit_medley || 0) > 0) {
          setInventory((prev) => ({ ...prev, fruit_medley: prev.fruit_medley - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 30),
            health: Math.min(prev.maxHealth, prev.health + 30),
            sanity: Math.min(prev.maxSanity, prev.sanity + 20),
          }));
          soundEngine.play('eat');
          showMessage('大快朵頤【水果拼盤】！身心獲得強烈治癒！(+30 飽食, +30 生命, +20 理智)');
        }
        break;

      case 'flower_salad':
        if ((inventory.flower_salad || 0) > 0) {
          setInventory((prev) => ({ ...prev, flower_salad: prev.flower_salad - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 15),
            health: Math.min(prev.maxHealth, prev.health + 40),
            sanity: Math.min(prev.maxSanity, prev.sanity + 30),
          }));
          soundEngine.play('eat');
          showMessage('品嚐精緻的【花瓣沙拉】！高額修復生命與理智！(+15 飽食, +40 生命, +30 理智)');
        }
        break;

      case 'kabobs':
        if ((inventory.kabobs || 0) > 0) {
          setInventory((prev) => ({ ...prev, kabobs: prev.kabobs - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 37.5),
            health: Math.min(prev.maxHealth, prev.health + 12),
            sanity: Math.min(prev.maxSanity, prev.sanity + 10),
          }));
          soundEngine.play('eat');
          showMessage('咬下香脆的【碳烤串燒】！充實飽足！(+37.5 飽食, +12 生命, +10 理智)');
        }
        break;

      case 'soothing_tea':
        if ((inventory.soothing_tea || 0) > 0) {
          setInventory((prev) => ({ ...prev, soothing_tea: prev.soothing_tea - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 10),
            health: Math.min(prev.maxHealth, prev.health + 15),
            sanity: Math.min(prev.maxSanity, prev.sanity + 45),
          }));
          soundEngine.play('eat');
          showMessage('飲下溫熱的【舒緩花草茶】！心靈得到深層平靜！(+10 飽食, +15 生命, +45 理智)');
        }
        break;

      case 'trail_mix':
        if ((inventory.trail_mix || 0) > 0) {
          setInventory((prev) => ({ ...prev, trail_mix: prev.trail_mix - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 25),
            health: Math.min(prev.maxHealth, prev.health + 25),
            sanity: Math.min(prev.maxSanity, prev.sanity + 15),
          }));
          soundEngine.play('eat');
          showMessage('食用探險家必備的【綜合果乾】！(+25 飽食, +25 生命, +15 理智)');
        }
        break;

      case 'wet_goop':
        if ((inventory.wet_goop || 0) > 0) {
          setInventory((prev) => ({ ...prev, wet_goop: prev.wet_goop - 1 }));
          setStats((prev) => ({
            ...prev,
            hunger: Math.min(prev.maxHunger, prev.hunger + 15),
            health: Math.max(1, prev.health - 5),
            sanity: Math.max(0, prev.sanity - 10),
          }));
          soundEngine.play('eat');
          showMessage('勉強吞下【黏稠物】...肚子是飽了一點，但胃部與心情在抗議。(-5 生命, -10 理智, +15 飽食)');
        }
        break;
    }
  };

  // Toggle equipping tools (Torch, Axe, Pickaxe, Spear)
  const handleToggleEquip = (tool: ResourceType) => {
    if (equippedTool === tool) {
      setEquippedTool(null);
      showMessage(`卸下了 ${tool === 'torch' ? '火把' : tool === 'axe' ? '石斧' : tool === 'pickaxe' ? '十字鎬' : '長矛'}`);
    } else {
      setEquippedTool(tool);
      soundEngine.play(tool === 'torch' ? 'torch' : 'click');
      showMessage(`裝備了 ${tool === 'torch' ? '火把 (黑夜照明)' : tool === 'axe' ? '石斧 (快速砍樹)' : tool === 'pickaxe' ? '十字鎬 (快速挖礦)' : '長矛 (對抗暗影怪)'}`);
    }
  };

  // Full Game Restart
  const handleRestart = () => {
    setStats({
      health: 150,
      maxHealth: 150,
      hunger: 150,
      maxHunger: 150,
      sanity: 200,
      maxSanity: 200,
      dayCount: 1,
      timeOfDay: 0,
      phase: 'day',
      weather: 'clear',
      techLevel: 0,
      torchDurability: 100,
      isDead: false,
      deathReason: '',
      itemsCraftedCount: 0,
      resourcesGatheredCount: 0,
    });
    setInventory({
      cutgrass: 3,
      twigs: 3,
      flint: 2,
      rocks: 2,
      berries: 4,
      flower: 2,
      torch: 0,
      axe: 0,
      pickaxe: 0,
      spear: 0,
      garland: 0,
      cooked_berries: 0,
      crock_pot: 0,
      jam: 0,
      fruit_medley: 0,
      flower_salad: 0,
      kabobs: 0,
      soothing_tea: 0,
      trail_mix: 0,
      wet_goop: 0,
    });
    setEquippedTool(null);
    showMessage('你再次在荒野甦醒。收集乾草、樹枝與食材，烹煮美食活下去！');
  };

  // Toggle Audio
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const isDarknessActive =
    stats.phase === 'night' && equippedTool !== 'torch' && !stats.isDead;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090705] font-parchment select-none">
      {/* 1. Three.js 2.5D World Canvas */}
      <div className="absolute inset-0 z-0">
        <GameCanvas
          key={stats.isDead ? 'dead' : 'alive'}
          onUpdateStats={handleUpdateStats}
          inventory={inventory}
          setInventory={setInventory}
          equippedTool={equippedTool}
          setEquippedTool={setEquippedTool}
          onShowMessage={showMessage}
          onUpdateEntitiesList={handleUpdateEntitiesList}
          actionTriggerRef={actionTriggerRef}
        />
      </div>

      {/* 2. Sanity Distortion & Charlie Attack Vignette */}
      <SanityVignette
        sanityRatio={stats.sanity / stats.maxSanity}
        isCharlieAttacking={false}
        isInDarkness={isDarknessActive}
      />

      {/* 3. Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 pointer-events-none">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1a120c]/90 border-2 border-[#523b2a] rounded-lg shadow-lg">
            <span className="text-xl">🕯️</span>
            <div>
              <h1 className="font-cinzel text-sm md:text-base font-bold text-[#eedaa2] tracking-wider leading-none">
                Don't Starve
              </h1>
              <span className="text-[10px] text-[#a4917e] font-semibold tracking-wider">
                荒野求生 (Web Survival)
              </span>
            </div>
          </div>
        </div>

        {/* Top Control Buttons (Sound, Help) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-[#1a120c]/90 border border-[#4a3424] text-[#c9b59f] hover:text-[#fff] hover:border-[#8f6848] transition-all cursor-pointer shadow-md"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a120c]/90 border border-[#4a3424] text-[#eedaa2] font-cinzel text-xs font-bold hover:border-[#8f6848] transition-all cursor-pointer shadow-md"
            title="生存指南"
          >
            <HelpCircle size={16} />
            <span className="hidden sm:inline">指南</span>
          </button>
        </div>
      </header>

      {/* 4. Top-Right Clock Dial, Weather & Radar */}
      <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-none">
        <ClockDial
          dayCount={stats.dayCount}
          timeOfDay={stats.timeOfDay}
          phase={stats.phase}
          weather={stats.weather}
        />

        <Minimap
          playerX={minimapData.playerX}
          playerZ={minimapData.playerZ}
          cameraAngle={minimapData.angle}
          entities={minimapData.entities}
          dayCount={stats.dayCount}
        />
      </div>

      {/* 5. Right-Hand Survival Stat Badges */}
      <div className="absolute top-96 right-4 z-20 flex flex-col gap-2.5 pointer-events-auto select-none">
        <StatBadge
          label="飽食度"
          subLabel="Hunger"
          current={stats.hunger}
          max={stats.maxHunger}
          type="hunger"
          icon="🍖"
        />
        <StatBadge
          label="理智值"
          subLabel="Sanity"
          current={stats.sanity}
          max={stats.maxSanity}
          type="sanity"
          icon="🧠"
        />
        <StatBadge
          label="生命值"
          subLabel="Health"
          current={stats.health}
          max={stats.maxHealth}
          type="health"
          icon="❤️"
        />
      </div>

      {/* 6. Left-Hand Crafting & Cooking Panel */}
      <div className="absolute top-20 left-4 z-20">
        <CraftingPanel
          inventory={inventory}
          techLevel={stats.techLevel}
          onCraft={handleCraft}
          onCookDish={handleCookDish}
        />
      </div>

      {/* 7. Center Message HUD Toast */}
      {systemMessage && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 max-w-[90vw] text-center pointer-events-none">
          <div className="inline-block px-4 py-2 bg-[#170f0a]/95 border-2 border-[#684b35] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
            <p className="font-cinzel text-xs md:text-sm font-bold text-[#f2e2be] tracking-wide">
              {systemMessage}
            </p>
          </div>
        </div>
      )}

      {/* 8. Bottom Inventory Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[95vw]">
        <InventoryBar
          inventory={inventory}
          equippedTool={equippedTool}
          torchDurability={stats.torchDurability}
          onUseItem={handleUseItem}
          onToggleEquip={handleToggleEquip}
        />
      </div>

      {/* 9. Game Over Modal */}
      {stats.isDead && (
        <GameOverModal
          dayCount={stats.dayCount}
          deathReason={stats.deathReason}
          itemsCrafted={stats.itemsCraftedCount}
          resourcesGathered={stats.resourcesGatheredCount}
          onRestart={handleRestart}
        />
      )}

      {/* 10. Help & Survival Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
          <div className="relative w-full max-w-lg bg-[#18110a] border-3 border-[#6b4c33] rounded-2xl p-6 shadow-2xl text-[#e8ded2] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#4d3624]">
              <h3 className="font-cinzel text-lg font-bold text-[#eedaa2] flex items-center gap-2">
                <span>📜</span> 《饑荒》荒野求生與料理法則
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-full bg-[#271910] border border-[#4d3522] text-[#a99480] hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs md:text-sm leading-relaxed text-[#cbbba9]">
              <div>
                <h4 className="font-cinzel font-bold text-[#60a5fa] text-sm">
                  1. 動態天候系統 (晴天 / 暴雨 / 濃霧)
                </h4>
                <p className="mt-1 text-[#b5a390]">
                  • <strong>暴雨（Rain）</strong>: 天空暗沉降下雨滴。地面泥濘導致玩家<strong>移動速度降低 25%</strong>，且濕冷雨水會<strong>加劇理智流失</strong>（靠近營火或點燃火把可抵禦寒意）！<br />
                  • <strong>濃霧（Fog）</strong>: 能見度大幅縮減，荒野被森冷迷霧籠罩，使<strong>移動速度降低 15%</strong> 並隨時間持續侵蝕理智。
                </p>
              </div>

              <div>
                <h4 className="font-cinzel font-bold text-[#f59e0b] text-sm">
                  2. 烹飪鍋系統 (Crock Pot)
                </h4>
                <p className="mt-1 text-[#b5a390]">
                  • 點擊左側選單的【🍲 烹飪鍋】工作台，放入 <strong>4 種食材</strong>（漿果、烤漿果、野花、樹枝、乾草等）。<br />
                  • <strong>花瓣沙拉</strong>: 2+ 花朵 + 漿果 ➔ +40 生命、+30 理智、+15 飽食！<br />
                  • <strong>舒緩花草茶</strong>: 2+ 花朵 + 樹枝/乾草 ➔ +45 理智、+15 生命、+10 飽食！<br />
                  • <strong>水果拼盤</strong>: 2+ 漿果 + 花朵/樹枝 ➔ +30 生命、+20 理智、+30 飽食！<br />
                  • <strong>碳烤串燒</strong>: 2+ 漿果 + 樹枝 ➔ +37.5 飽食、+12 生命、+10 理智！<br />
                  • <strong>果醬蜜餞</strong>: 3+ 漿果 ➔ +37.5 飽食、+5 生命、+8 理智！
                </p>
              </div>

              <div>
                <h4 className="font-cinzel font-bold text-[#e06346] text-sm">
                  3. 查理（Charlie）與黑夜恐怖
                </h4>
                <p className="mt-1 text-[#b5a390]">
                  • 日夜循環分為「白天 ➔ 黃昏 ➔ 夜晚」。<br />
                  • <strong>夜晚一旦沒有光源超過 2.8 秒</strong>，暗夜怪獸查理將會發動致命突襲撕裂你！入夜前務必合成<strong>火把 (Torch)</strong> 或搭建<strong>營火 (Campfire)</strong>。
                </p>
              </div>

              <div>
                <h4 className="font-cinzel font-bold text-[#4dd0e1] text-sm">
                  4. 操控與 360° 視角旋轉
                </h4>
                <p className="mt-1 text-[#b5a390]">
                  • <strong>WASD / 方向鍵</strong>: 移動威爾遜<br />
                  • <strong>Q / E 鍵</strong>: 360 度旋轉視角<br />
                  • <strong>空白鍵 / 右下互動按鈕</strong>: 採集資源、砍伐樹木、開採巨石
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 bg-[#8c5225] hover:bg-[#a86532] text-[#fff8ea] border border-[#d5a85b] rounded-lg font-cinzel text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                前往荒野！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
