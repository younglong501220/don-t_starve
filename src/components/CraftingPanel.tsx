import React, { useState } from 'react';
import { CraftCategory, CraftRecipe, ResourceType } from '../types/game';
import { CROCK_POT_RECIPES, cookIngredients } from '../data/cookingRecipes';
import { soundEngine } from '../audio/soundEngine';

export const CRAFTING_RECIPES: CraftRecipe[] = [
  // --- Tools ---
  {
    id: 'axe',
    name: '石斧 (Axe)',
    category: 'tools',
    icon: '🪓',
    description: '砍伐常青樹。加速採集木材與樹枝。',
    techLevel: 0,
    cost: { twigs: 1, flint: 1 },
    onCraftResult: 'inventory',
    targetItem: 'axe',
  },
  {
    id: 'pickaxe',
    name: '十字鎬 (Pickaxe)',
    category: 'tools',
    icon: '⛏️',
    description: '開採巨石與礦物。加速採集燧石與石頭。',
    techLevel: 0,
    cost: { twigs: 2, flint: 2 },
    onCraftResult: 'inventory',
    targetItem: 'pickaxe',
  },
  {
    id: 'spear',
    name: '長矛 (Spear)',
    category: 'tools',
    icon: '🗡️',
    description: '銳利的自衛武器。驅散暗影怪物。',
    techLevel: 1,
    cost: { twigs: 2, flint: 2, cutgrass: 2 },
    onCraftResult: 'inventory',
    targetItem: 'spear',
  },

  // --- Light ---
  {
    id: 'torch',
    name: '火把 (Torch)',
    category: 'light',
    icon: '🔥',
    description: '便攜式手持光源。黑夜必備，驅散查理。',
    techLevel: 0,
    cost: { cutgrass: 2, twigs: 2 },
    onCraftResult: 'inventory',
    targetItem: 'torch',
  },
  {
    id: 'campfire',
    name: '營火 (Campfire)',
    category: 'light',
    icon: '🏕️',
    description: '在身旁搭建溫暖營火。大範圍照亮黑夜並可烤熟食物。',
    techLevel: 0,
    cost: { cutgrass: 3, twigs: 2 },
    onCraftResult: 'place_campfire',
  },

  // --- Survival ---
  {
    id: 'garland',
    name: '花環 (Garland)',
    category: 'survival',
    icon: '🌸',
    description: '編織野花戴在頭上。立即修復 +35 理智值。',
    techLevel: 0,
    cost: { flower: 5 },
    onCraftResult: 'instant_buff',
    targetItem: 'garland',
  },
  {
    id: 'straw_roll',
    name: '草席 (Straw Roll)',
    category: 'survival',
    icon: '🛏️',
    description: '就地休憩。消耗 30 飽食度，恢復 +50 生命與理智。',
    techLevel: 1,
    cost: { cutgrass: 6, twigs: 2 },
    onCraftResult: 'instant_buff',
  },

  // --- Science ---
  {
    id: 'crock_pot_struct',
    name: '烹飪鍋 (Crock Pot)',
    category: 'science',
    icon: '🍲',
    description: '在身旁建造石造烹飪鍋。將 4 種食材慢火燉煮為奢華美食！',
    techLevel: 0,
    cost: { rocks: 3, twigs: 2, cutgrass: 2 },
    onCraftResult: 'place_crock_pot',
  },
  {
    id: 'science_machine',
    name: '科學機器 (Science Machine)',
    category: 'science',
    icon: '⚙️',
    description: '在身旁建造蒸氣蒸餾儀器。解鎖科技等級 1 高級配方！',
    techLevel: 0,
    cost: { rocks: 4, twigs: 3, flint: 2 },
    onCraftResult: 'place_science',
  },
  {
    id: 'shadow_amulet',
    name: '精煉暗影護符 (Amulet)',
    category: 'science',
    icon: '✨',
    description: '古代鍊金結晶。完全驅逐瘋狂，回復 +70 理智與 +30 生命。',
    techLevel: 1,
    cost: { rocks: 6, flint: 4 },
    onCraftResult: 'instant_buff',
  },
];

interface CraftingPanelProps {
  inventory: Record<ResourceType, number>;
  techLevel: number;
  onCraft: (recipe: CraftRecipe) => void;
  onCookDish: (dishKey: ResourceType, consumedIngredients: ResourceType[]) => void;
}

export const CraftingPanel: React.FC<CraftingPanelProps> = ({
  inventory,
  techLevel,
  onCraft,
  onCookDish,
}) => {
  const [activeCategory, setActiveCategory] = useState<CraftCategory>('tools');
  const [isOpen, setIsOpen] = useState(true);

  // Cooking System States
  const [cookingSlots, setCookingSlots] = useState<(ResourceType | null)[]>([null, null, null, null]);
  const [isSimmering, setIsSimmering] = useState<boolean>(false);
  const [lastCookedResult, setLastCookedResult] = useState<{
    name: string;
    icon: string;
    hunger: number;
    health: number;
    sanity: number;
  } | null>(null);
  const [showCookbook, setShowCookbook] = useState<boolean>(false);

  const categories: { id: CraftCategory; name: string; icon: string }[] = [
    { id: 'tools', name: '工具', icon: '🪓' },
    { id: 'light', name: '光源', icon: '🔥' },
    { id: 'survival', name: '生存', icon: '❤️' },
    { id: 'science', name: '科技', icon: '⚙️' },
    { id: 'cooking', name: '烹飪鍋', icon: '🍲' },
  ];

  const currentRecipes = CRAFTING_RECIPES.filter((r) => r.category === activeCategory);

  const checkCanCraft = (recipe: CraftRecipe) => {
    if (techLevel < recipe.techLevel) return false;
    for (const [res, needed] of Object.entries(recipe.cost)) {
      if ((inventory[res as ResourceType] || 0) < (needed || 0)) {
        return false;
      }
    }
    return true;
  };

  const resourceLabels: Record<ResourceType, string> = {
    cutgrass: '🌾 乾草',
    twigs: '🥢 樹枝',
    flint: '🔪 燧石',
    rocks: '🪨 石頭',
    berries: '🫐 漿果',
    flower: '🌸 野花',
    torch: '🔥 火把',
    axe: '🪓 石斧',
    pickaxe: '⛏️ 十字鎬',
    spear: '🗡️ 長矛',
    garland: '👑 花環',
    cooked_berries: '🥧 烤漿果',
    crock_pot: '🍲 烹飪鍋',
    jam: '🍯 果醬蜜餞',
    fruit_medley: '🍨 水果拼盤',
    flower_salad: '🥗 花瓣沙拉',
    kabobs: '🍢 碳烤串燒',
    soothing_tea: '🍵 舒緩花草茶',
    trail_mix: '🌰 綜合果乾',
    wet_goop: '🥣 黏稠物',
  };

  // Potential cooking ingredients from inventory
  const cookingIngredients: ResourceType[] = [
    'berries',
    'cooked_berries',
    'flower',
    'twigs',
    'cutgrass',
    'rocks',
    'flint',
  ];

  // Count how many of each ingredient are currently placed in the pot
  const placedCount = (item: ResourceType) =>
    cookingSlots.filter((slot) => slot === item).length;

  // Add ingredient to next empty slot
  const handleAddIngredient = (item: ResourceType) => {
    if (isSimmering) return;
    const available = (inventory[item] || 0) - placedCount(item);
    if (available <= 0) return;

    const firstEmptyIndex = cookingSlots.findIndex((s) => s === null);
    if (firstEmptyIndex === -1) return; // All 4 slots full

    const nextSlots = [...cookingSlots];
    nextSlots[firstEmptyIndex] = item;
    setCookingSlots(nextSlots);
    soundEngine.play('click');
  };

  // Remove ingredient from slot
  const handleRemoveSlot = (index: number) => {
    if (isSimmering) return;
    if (cookingSlots[index] === null) return;
    const nextSlots = [...cookingSlots];
    nextSlots[index] = null;
    setCookingSlots(nextSlots);
    soundEngine.play('click');
  };

  // Clear all slots
  const handleClearSlots = () => {
    if (isSimmering) return;
    setCookingSlots([null, null, null, null]);
    soundEngine.play('click');
  };

  // Execute cooking
  const handleStartCooking = () => {
    if (isSimmering) return;
    if (cookingSlots.some((s) => s === null)) return;

    const usedIngredients = cookingSlots as ResourceType[];
    setIsSimmering(true);
    soundEngine.play('boil');

    setTimeout(() => {
      const dish = cookIngredients(usedIngredients);
      soundEngine.play('dish_ready');

      setLastCookedResult({
        name: dish.name,
        icon: dish.icon,
        hunger: dish.hunger,
        health: dish.health,
        sanity: dish.sanity,
      });

      onCookDish(dish.id as ResourceType, usedIngredients);
      setCookingSlots([null, null, null, null]);
      setIsSimmering(false);
    }, 1200);
  };

  const isSlotsFull = cookingSlots.every((s) => s !== null);

  return (
    <div className="flex select-none pointer-events-auto">
      {/* Category Icons Rail */}
      <div className="flex flex-col gap-1.5 bg-[#18110b]/95 border-2 border-[#523b2a] p-1.5 rounded-l-lg shadow-2xl">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.play('click');
                setActiveCategory(cat.id);
                setIsOpen(true);
              }}
              title={cat.name}
              className={`w-10 h-10 md:w-11 md:h-11 rounded-md flex items-center justify-center text-lg md:text-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#4a3523] border-2 border-[#d5a85b] shadow-[0_0_8px_rgba(213,168,91,0.5)] scale-105'
                  : 'bg-[#22170f] border border-[#3b271a] hover:bg-[#322317] text-[#a4917e]'
              }`}
            >
              {cat.icon}
            </button>
          );
        })}

        {/* Toggle open/close button */}
        <button
          onClick={() => {
            soundEngine.play('click');
            setIsOpen(!isOpen);
          }}
          className="w-10 h-8 md:w-11 md:h-8 mt-1 rounded bg-[#1f150e] border border-[#3f2b1d] text-[#a89582] text-xs hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          title={isOpen ? '收起配方' : '展開配方'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Main Panel Content */}
      {isOpen && (
        <div className="w-72 md:w-80 bg-[#1c130c]/95 border-y-2 border-r-2 border-[#523b2a] rounded-r-lg p-3 shadow-2xl backdrop-blur-xs flex flex-col max-h-[78vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#473221]">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-sm font-bold text-[#e8c688]">
                {categories.find((c) => c.id === activeCategory)?.name}
                {activeCategory === 'cooking' ? '工作台' : ' 配方'}
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#2a1b12] text-[#c79c5e] border border-[#4d3320]">
              科技 等級 {techLevel}
            </span>
          </div>

          {/* ========================================================
              COOKING SYSTEM WORKSTATION
             ======================================================== */}
          {activeCategory === 'cooking' ? (
            <div className="flex flex-col gap-3">
              {/* Crock Pot Header Visual */}
              <div className="relative p-3 rounded-lg bg-[#24170f] border border-[#523826] text-center shadow-inner">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-3xl animate-bounce">🍲</span>
                  <div className="text-left">
                    <h4 className="font-cinzel text-sm font-bold text-[#eedaa2]">
                      荒野烹飪鍋 (Crock Pot)
                    </h4>
                    <span className="text-[11px] text-[#aa9580]">
                      任選 4 種食材燉煮出專屬高階佳餚
                    </span>
                  </div>
                </div>

                {/* 4 Cooking Slots */}
                <div className="flex justify-center items-center gap-2 my-2.5">
                  {cookingSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleRemoveSlot(idx)}
                      title={slot ? `點擊取出: ${resourceLabels[slot]}` : `食材欄位 ${idx + 1}`}
                      className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                        slot
                          ? 'bg-[#3b2516] border-2 border-[#f0c05a] shadow-[0_0_8px_rgba(240,192,90,0.5)] active:scale-95'
                          : 'bg-[#180f0a] border-2 border-dashed border-[#4d3322] hover:border-[#805739]'
                      }`}
                    >
                      {slot ? (
                        <>
                          <span className="text-2xl leading-none">
                            {resourceLabels[slot]?.split(' ')[0]}
                          </span>
                          <span className="absolute -top-1.5 -right-1 text-[9px] bg-red-900 text-white rounded-full w-4 h-4 flex items-center justify-center border border-red-500 font-bold">
                            ✕
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#6e5847] font-bold">#{idx + 1}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Real-time Recipe Validation Processing Feedback */}
                <div className="my-2 p-2 rounded bg-[#160d07] border border-[#422918] text-center">
                  {isSlotsFull ? (
                    (() => {
                      const predicted = cookIngredients(cookingSlots as ResourceType[]);
                      return predicted.id !== 'wet_goop' ? (
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-bold text-[#86efac] flex items-center justify-center gap-1">
                            <span>✅ 配方驗證通過：</span>
                            <span className="text-[#fef08a]">{predicted.icon} {predicted.name}</span>
                          </div>
                          <div className="text-[10px] text-[#cbd5e1] flex justify-center gap-2">
                            <span className="text-[#fca5a5]">❤️ 生命 {predicted.health > 0 ? `+${predicted.health}` : predicted.health}</span>
                            <span className="text-[#f9a8d4]">🧠 理智 +{predicted.sanity}</span>
                            <span className="text-[#fed7aa]">🍖 飽食 +{predicted.hunger}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#fca5a5] font-semibold">
                          ⚠️ 食材組合未命中專屬料理，出鍋將為【🥣 失敗的黏稠物】
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-[10px] text-[#9a8673]">
                      請放入 4 種食材以啟動烹飪驗證 (已放 {cookingSlots.filter((s) => s !== null).length}/4)
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                <div className="flex justify-between items-center gap-2 pt-1 border-t border-[#3c2719]">
                  <button
                    onClick={handleClearSlots}
                    disabled={isSimmering || cookingSlots.every((s) => s === null)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#ad9883] hover:text-[#fff] bg-[#1a110a] border border-[#3e281b] rounded transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    清空欄位
                  </button>

                  <button
                    onClick={handleStartCooking}
                    disabled={!isSlotsFull || isSimmering}
                    className={`px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer shadow-md ${
                      isSlotsFull && !isSimmering
                        ? 'bg-gradient-to-r from-[#d97724] to-[#f59e0b] text-[#1c0d02] font-black border border-[#ffd54f] animate-pulse active:scale-95'
                        : 'bg-[#291b12] text-[#695443] border border-[#3f2a1b] cursor-not-allowed'
                    }`}
                  >
                    {isSimmering ? '燉煮冒泡中... 🔥' : '🔥 開始烹飪'}
                  </button>
                </div>
              </div>

              {/* Last Cooked Result Announcement */}
              {lastCookedResult && (
                <div className="p-2.5 rounded-lg bg-[#20301d] border border-[#487340] text-center shadow-md animate-fade-in">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{lastCookedResult.icon}</span>
                    <span className="font-cinzel text-xs font-bold text-[#a7f3d0]">
                      成功出鍋: {lastCookedResult.name}
                    </span>
                  </div>
                  <div className="flex justify-center gap-3 mt-1.5 text-[11px] font-bold">
                    <span className="text-[#fca5a5]">❤️ 生命 {lastCookedResult.health > 0 ? `+${lastCookedResult.health}` : lastCookedResult.health}</span>
                    <span className="text-[#f9a8d4]">🧠 理智 {lastCookedResult.sanity > 0 ? `+${lastCookedResult.sanity}` : lastCookedResult.sanity}</span>
                    <span className="text-[#fed7aa]">🍖 飽食 +{lastCookedResult.hunger}</span>
                  </div>
                </div>
              )}

              {/* Available Ingredients Picker */}
              <div className="p-2.5 rounded-lg bg-[#20150d] border border-[#472f1e]">
                <div className="text-[11px] font-bold text-[#cbb69e] mb-1.5">
                  點擊放入食材 (背包現有):
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {cookingIngredients.map((item) => {
                    const total = inventory[item] || 0;
                    const inPot = placedCount(item);
                    const remaining = Math.max(0, total - inPot);
                    const canAdd = remaining > 0 && !isSlotsFull && !isSimmering;

                    return (
                      <button
                        key={item}
                        onClick={() => handleAddIngredient(item)}
                        disabled={!canAdd}
                        className={`p-1.5 rounded flex items-center justify-between text-xs transition-all cursor-pointer ${
                          canAdd
                            ? 'bg-[#2b1c12] hover:bg-[#3d2719] border border-[#5c3c26] text-[#eedaa2]'
                            : 'bg-[#150d08] border border-[#2b190e] opacity-40 text-[#685341] cursor-not-allowed'
                        }`}
                      >
                        <span className="truncate">{resourceLabels[item]}</span>
                        <span
                          className={`font-bold ml-1 text-[11px] px-1 rounded ${
                            remaining > 0 ? 'bg-[#3d2719] text-[#ffd54f]' : 'text-[#705844]'
                          }`}
                        >
                          {remaining}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cookbook Guide Toggle */}
              <div className="mt-1">
                <button
                  onClick={() => setShowCookbook(!showCookbook)}
                  className="w-full py-1.5 px-2 bg-[#20150e] border border-[#4a3220] hover:border-[#825b3a] rounded text-[11px] text-[#c9b29b] font-cinzel font-bold flex items-center justify-between cursor-pointer"
                >
                  <span>📜 傳奇食譜指南 (Cookbook)</span>
                  <span>{showCookbook ? '▲ 收起' : '▼ 展開'}</span>
                </button>

                {showCookbook && (
                  <div className="mt-1.5 p-2 bg-[#170e09] border border-[#3c2517] rounded text-[11px] space-y-2">
                    {CROCK_POT_RECIPES.map((rec) => (
                      <div key={rec.id} className="pb-1.5 border-b border-[#2d1b10] last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#eedaa2]">
                            {rec.icon} {rec.name}
                          </span>
                          <span className="text-[10px] text-[#93c5fd]">
                            🍖{rec.hunger} ❤️{rec.health} 🧠{rec.sanity}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9a8673] mt-0.5">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================
                STANDARD RECIPES (TOOLS, LIGHT, SURVIVAL, SCIENCE)
               ======================================================== */
            <div className="flex flex-col gap-2">
              {currentRecipes.map((recipe) => {
                const canCraft = checkCanCraft(recipe);
                const isTechLocked = techLevel < recipe.techLevel;

                return (
                  <div
                    key={recipe.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      canCraft
                        ? 'bg-[#291b12] border-[#7d5635] hover:border-[#caa059] shadow-sm'
                        : isTechLocked
                        ? 'bg-[#150f0b]/80 border-[#382417] opacity-60'
                        : 'bg-[#20150d] border-[#3f2a1b] opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{recipe.icon}</span>
                        <div>
                          <h4 className="font-cinzel text-xs md:text-sm font-bold text-[#eedaa2] leading-tight">
                            {recipe.name}
                          </h4>
                          <p className="text-[11px] text-[#ad9b87] leading-snug mt-0.5">
                            {recipe.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Materials Required */}
                    <div className="mt-2 pt-1.5 border-t border-[#3a2618] flex flex-wrap gap-1.5">
                      {Object.entries(recipe.cost).map(([res, needed]) => {
                        const cur = inventory[res as ResourceType] || 0;
                        const hasEnough = cur >= (needed || 0);
                        return (
                          <span
                            key={res}
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              hasEnough
                                ? 'bg-[#1c2c1a] border-[#3f633a] text-[#86e077]'
                                : 'bg-[#2f1414] border-[#6b2525] text-[#e87f7f]'
                            }`}
                          >
                            {resourceLabels[res as ResourceType] || res}: {cur}/{needed}
                          </span>
                        );
                      })}
                    </div>

                    {/* Craft Action Button */}
                    <div className="mt-2 flex justify-end">
                      {isTechLocked ? (
                        <span className="text-[11px] text-[#cf804d] font-semibold flex items-center gap-1">
                          🔒 需靠近科學機器
                        </span>
                      ) : (
                        <button
                          disabled={!canCraft}
                          onClick={() => {
                            if (canCraft) {
                              onCraft(recipe);
                            }
                          }}
                          className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                            canCraft
                              ? 'bg-[#8c5a2c] hover:bg-[#a96e38] text-[#fff8ea] border border-[#d5a85b] shadow-md active:scale-95'
                              : 'bg-[#24170e] text-[#695543] border border-[#3a2619] cursor-not-allowed'
                          }`}
                        >
                          製造
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
