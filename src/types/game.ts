export type ResourceType =
  | 'cutgrass'
  | 'twigs'
  | 'flint'
  | 'rocks'
  | 'berries'
  | 'flower'
  | 'torch'
  | 'axe'
  | 'pickaxe'
  | 'spear'
  | 'garland'
  | 'cooked_berries'
  | 'crock_pot'
  | 'jam'
  | 'fruit_medley'
  | 'flower_salad'
  | 'kabobs'
  | 'soothing_tea'
  | 'trail_mix'
  | 'wet_goop';

export type EntityType =
  | 'tree'
  | 'grass'
  | 'sapling'
  | 'boulder'
  | 'berrybush'
  | 'flower'
  | 'campfire'
  | 'science'
  | 'crock_pot'
  | 'shadow_creature';

export type CraftCategory = 'tools' | 'light' | 'survival' | 'science' | 'cooking';

export interface CraftRecipe {
  id: string;
  name: string;
  category: CraftCategory;
  icon: string;
  description: string;
  techLevel: number;
  cost: Partial<Record<ResourceType, number>>;
  onCraftResult: 'inventory' | 'place_campfire' | 'place_science' | 'place_crock_pot' | 'instant_buff';
  targetItem?: ResourceType;
}

export type DayPhase = 'day' | 'dusk' | 'night';
export type WeatherType = 'clear' | 'rain' | 'fog';

export interface WorldEntity {
  id: string;
  type: EntityType;
  x: number;
  z: number;
  harvestable: boolean;
  durability?: number; // for rocks / trees
  maxDurability?: number;
  fuel?: number; // for campfire
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  sanity: number;
  maxSanity: number;
  dayCount: number;
  timeOfDay: number; // 0 to 1
  phase: DayPhase;
  weather: WeatherType;
  techLevel: number; // 0: basic, 1: science machine
  equippedTool: ResourceType | null;
  torchDurability: number; // 0-100%
  inDarknessTimer: number;
  isDead: boolean;
  deathReason: string;
  itemsCraftedCount: number;
  resourcesGatheredCount: number;
}

export interface CrockPotRecipe {
  id: string;
  name: string;
  icon: string;
  description: string;
  hunger: number;
  health: number;
  sanity: number;
  matches: (ingredients: ResourceType[]) => boolean;
}
