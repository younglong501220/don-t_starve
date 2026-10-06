import React from 'react';
import { ResourceType } from '../types/game';

interface InventoryBarProps {
  inventory: Record<ResourceType, number>;
  equippedTool: ResourceType | null;
  torchDurability: number; // 0 to 100
  onUseItem: (item: ResourceType) => void;
  onToggleEquip: (tool: ResourceType) => void;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({
  inventory,
  equippedTool,
  torchDurability,
  onUseItem,
  onToggleEquip,
}) => {
  const items: {
    key: ResourceType;
    label: string;
    icon: string;
    isEquippable?: boolean;
    isUsable?: boolean;
    actionHint: string;
  }[] = [
    { key: 'cutgrass', label: '乾草', icon: '🌾', actionHint: '合成材料' },
    { key: 'twigs', label: '樹枝', icon: '🥢', actionHint: '合成材料' },
    { key: 'flint', label: '燧石', icon: '🔪', actionHint: '工具刃部' },
    { key: 'rocks', label: '石頭', icon: '🪨', actionHint: '建造石材' },
    { key: 'berries', label: '漿果', icon: '🫐', isUsable: true, actionHint: '食用: +25 飽食 +3 生命' },
    { key: 'cooked_berries', label: '烤漿果', icon: '🥧', isUsable: true, actionHint: '食用: +35 飽食 +15 生命 +5 理智' },
    { key: 'flower', label: '野花', icon: '🌸', isUsable: true, actionHint: '嗅聞: +5 理智值' },
    { key: 'torch', label: '火把', icon: '🔥', isEquippable: true, actionHint: '裝備: 夜晚照明驅散查理' },
    { key: 'axe', label: '石斧', icon: '🪓', isEquippable: true, actionHint: '裝備: 快速砍樹' },
    { key: 'pickaxe', label: '十字鎬', icon: '⛏️', isEquippable: true, actionHint: '裝備: 快速採石' },
    { key: 'spear', label: '長矛', icon: '🗡️', isEquippable: true, actionHint: '裝備: 驅散暗影怪' },
    { key: 'jam', label: '果醬蜜餞', icon: '🍯', isUsable: true, actionHint: '食用: +37.5 飽食 +5 生命 +8 理智' },
    { key: 'fruit_medley', label: '水果拼盤', icon: '🍨', isUsable: true, actionHint: '食用: +30 飽食 +30 生命 +20 理智' },
    { key: 'flower_salad', label: '花瓣沙拉', icon: '🥗', isUsable: true, actionHint: '食用: +15 飽食 +40 生命 +30 理智' },
    { key: 'kabobs', label: '碳烤串燒', icon: '🍢', isUsable: true, actionHint: '食用: +37.5 飽食 +12 生命 +10 理智' },
    { key: 'soothing_tea', label: '舒緩花草茶', icon: '🍵', isUsable: true, actionHint: '食用: +10 飽食 +15 生命 +45 理智' },
    { key: 'trail_mix', label: '綜合果乾', icon: '🌰', isUsable: true, actionHint: '食用: +25 飽食 +25 生命 +15 理智' },
    { key: 'wet_goop', label: '黏稠物', icon: '🥣', isUsable: true, actionHint: '食用: +15 飽食 -5 生命 -10 理智' },
  ];

  return (
    <div className="flex items-center gap-1.5 md:gap-2 bg-[#19110b]/95 border-2 md:border-3 border-[#563e2c] p-2 md:p-2.5 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.85)] max-w-full overflow-x-auto select-none pointer-events-auto">
      {items.map((it) => {
        const count = inventory[it.key] || 0;
        const isEquipped = equippedTool === it.key;
        const hasItem = count > 0;

        return (
          <button
            key={it.key}
            onClick={() => {
              if (!hasItem) return;
              if (it.isEquippable) {
                onToggleEquip(it.key);
              } else if (it.isUsable) {
                onUseItem(it.key);
              }
            }}
            disabled={!hasItem}
            title={`${it.label} (${count}) - ${it.actionHint}`}
            className={`relative w-11 h-11 md:w-13 md:h-13 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer group shrink-0 ${
              isEquipped
                ? 'bg-[#47301c] border-2 border-[#f0c05a] shadow-[0_0_10px_rgba(240,192,90,0.6)] scale-105'
                : hasItem
                ? 'bg-[#251911] border border-[#4a3424] hover:border-[#8c6544] hover:bg-[#322216]'
                : 'bg-[#150e09]/60 border border-[#2d1e14] opacity-35 cursor-not-allowed'
            }`}
          >
            {/* Item Icon */}
            <span className="text-xl md:text-2xl leading-none">{it.icon}</span>

            {/* Quantity Count Badge */}
            {hasItem && (
              <span className="absolute bottom-0.5 right-1 text-[10px] md:text-[11px] font-bold font-cinzel text-[#fff9eb] text-shadow drop-shadow">
                {count}
              </span>
            )}

            {/* Equipped Badge */}
            {isEquipped && (
              <span className="absolute -top-1.5 -right-1 text-[9px] bg-[#ffd54f] text-[#2b1800] font-black px-1 rounded-xs">
                裝備
              </span>
            )}

            {/* Torch Durability Bar */}
            {it.key === 'torch' && isEquipped && (
              <div className="absolute -bottom-1 left-1 right-1 h-1 bg-[#26150b] rounded-full overflow-hidden border border-[#5a3a1f]">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${torchDurability}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
