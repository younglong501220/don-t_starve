import { CrockPotRecipe, ResourceType } from '../types/game';

export const CROCK_POT_RECIPES: CrockPotRecipe[] = [
  {
    id: 'flower_salad',
    name: '花瓣沙拉 (Flower Salad)',
    icon: '🥗',
    description: '芬芳雅緻的花瓣拼盤。高額恢復理智與生命！',
    hunger: 15,
    health: 40,
    sanity: 30,
    matches: (ingredients: ResourceType[]) => {
      const flowerCount = ingredients.filter((i) => i === 'flower').length;
      const berryCount = ingredients.filter((i) => i === 'berries' || i === 'cooked_berries').length;
      return flowerCount >= 2 && berryCount >= 1;
    },
  },
  {
    id: 'soothing_tea',
    name: '舒緩花草茶 (Soothing Tea)',
    icon: '🍵',
    description: '熱氣騰騰的草本香茶。極速鎮定崩潰的理智！',
    hunger: 10,
    health: 15,
    sanity: 45,
    matches: (ingredients: ResourceType[]) => {
      const flowerCount = ingredients.filter((i) => i === 'flower').length;
      const twigCount = ingredients.filter((i) => i === 'twigs').length;
      const grassCount = ingredients.filter((i) => i === 'cutgrass').length;
      return flowerCount >= 2 && (twigCount >= 1 || grassCount >= 1);
    },
  },
  {
    id: 'fruit_medley',
    name: '水果拼盤 (Fruit Medley)',
    icon: '🍨',
    description: '酸甜爽口的鮮果大餐。卓越的回血與撫慰效果。',
    hunger: 30,
    health: 30,
    sanity: 20,
    matches: (ingredients: ResourceType[]) => {
      const berryCount = ingredients.filter((i) => i === 'berries' || i === 'cooked_berries').length;
      const flowerCount = ingredients.filter((i) => i === 'flower').length;
      const twigCount = ingredients.filter((i) => i === 'twigs').length;
      return berryCount >= 2 && (flowerCount >= 1 || twigCount >= 1);
    },
  },
  {
    id: 'trail_mix',
    name: '綜合果乾 (Trail Mix)',
    icon: '🌰',
    description: '探險家必備堅果點心。均衡回復生命與飽食。',
    hunger: 25,
    health: 25,
    sanity: 15,
    matches: (ingredients: ResourceType[]) => {
      const rawBerries = ingredients.filter((i) => i === 'berries').length;
      const cookedBerries = ingredients.filter((i) => i === 'cooked_berries').length;
      const twigs = ingredients.filter((i) => i === 'twigs').length;
      return rawBerries >= 1 && cookedBerries >= 1 && twigs >= 1;
    },
  },
  {
    id: 'kabobs',
    name: '碳烤串燒 (Kabobs)',
    icon: '🍢',
    description: '用樹枝串起烘烤的香濃串燒，飽腹感十足！',
    hunger: 37.5,
    health: 12,
    sanity: 10,
    matches: (ingredients: ResourceType[]) => {
      const twigCount = ingredients.filter((i) => i === 'twigs').length;
      const berryCount = ingredients.filter((i) => i === 'berries' || i === 'cooked_berries').length;
      return twigCount >= 1 && berryCount >= 2;
    },
  },
  {
    id: 'jam',
    name: '果醬蜜餞 (Fist Full of Jam)',
    icon: '🍯',
    description: '熬煮濃縮的野生漿果醬，快速解除飢餓！',
    hunger: 37.5,
    health: 5,
    sanity: 8,
    matches: (ingredients: ResourceType[]) => {
      const berryCount = ingredients.filter((i) => i === 'berries' || i === 'cooked_berries').length;
      const rocksOrFlint = ingredients.filter((i) => i === 'rocks' || i === 'flint').length;
      return berryCount >= 3 && rocksOrFlint === 0;
    },
  },
  {
    id: 'wet_goop',
    name: '失敗的黏稠物 (Wet Goop)',
    icon: '🥣',
    description: '一鍋詭異起泡的黑料理...雖能充飢但有損身心。',
    hunger: 15,
    health: -5,
    sanity: -10,
    matches: () => true, // default fallback
  },
];

/**
 * Determine the Crock Pot meal from 4 ingredients
 */
export function cookIngredients(ingredients: ResourceType[]): CrockPotRecipe {
  if (ingredients.length < 4) {
    return CROCK_POT_RECIPES[CROCK_POT_RECIPES.length - 1]; // wet goop
  }

  // Iterate over recipes in priority order
  for (const recipe of CROCK_POT_RECIPES) {
    if (recipe.id === 'wet_goop') continue;
    if (recipe.matches(ingredients)) {
      return recipe;
    }
  }

  // Fallback to wet goop
  return CROCK_POT_RECIPES[CROCK_POT_RECIPES.length - 1];
}
