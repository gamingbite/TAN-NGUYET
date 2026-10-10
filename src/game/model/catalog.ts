import type { ClassId, ItemDefinition, ItemId, QuestDefinition, QuestId, RaceId, RecipeDefinition, RecipeId } from './types';

// All quantities, prices and stats are temporary v0.1 playtest values.
// Copper, silver and gold remain separate; no conversion rate is assumed.
export const BAG_CAPACITY = 12;
export const BALANCE = {
  inventorySlots: BAG_CAPACITY,
  daySeconds: 300,
  maxLevel: 100,
  baseHp: { civilian: 100, swordsman: 120, mage: 96 },
  baseMp: { civilian: 60, swordsman: 60, mage: 110 },
  hpPerLevel: 12,
  mpPerLevel: 8,
  firstLevelXp: 40,
  xpStep: 25,
  potionCooldown: 5,
  hpPotionRestore: 65,
  mpPotionRestore: 60,
  workOreGoal: 3,
  sealKillGoal: 3,
} as const;

export const RACES: Record<RaceId, string> = {
  human: 'Con Người', elf: 'Tinh Linh', dwarf: 'Người Lùn', beast: 'Thú Nhân',
};
export const CLASSES: Record<ClassId, string> = {
  civilian: 'Dân thường', swordsman: 'Kiếm Sĩ', mage: 'Pháp Sư',
};
export const CLASS_NAMES = CLASSES;
export const RACE_NAMES = RACES;

export const ITEMS: Record<ItemId, ItemDefinition> = {
  ore: { id: 'ore', name: 'Quặng sắt', description: 'Khai thác tại mỏ. Nguyên liệu cho nghề rèn.', icon: '◆', kind: 'material', stack: 20, buy: 5, sell: 2 },
  herb: { id: 'herb', name: 'Nguyệt thảo', description: 'Thảo dược mọc trong rừng, dùng pha thuốc.', icon: '✿', kind: 'material', stack: 20, buy: 4, sell: 1 },
  wood: { id: 'wood', name: 'Gỗ khô', description: 'Làm cán vũ khí và phụ kiện áo giáp. Thương nhân có bán.', icon: '▰', kind: 'material', stack: 20, buy: 3, sell: 1 },
  fang: { id: 'fang', name: 'Nanh sói', description: 'Chiến lợi phẩm có thể bán cho thương nhân.', icon: '⌁', kind: 'material', stack: 20, buy: 8, sell: 4 },
  'moon-shard': { id: 'moon-shard', name: 'Mảnh Tàn Nguyệt', description: 'Mảnh tinh thể từ bóng ma và di tích. Có thể bán.', icon: '◈', kind: 'material', stack: 20, buy: 15, sell: 8 },
  sword: { id: 'sword', name: 'Kiếm sắt', description: 'Vũ khí cơ bản của Kiếm Sĩ. Tăng sức mạnh đòn đánh.', icon: '⚔', kind: 'weapon', stack: 1, buy: 30, sell: 12, classId: 'swordsman', power: 8 },
  staff: { id: 'staff', name: 'Trượng nguyệt', description: 'Vũ khí cơ bản của Pháp Sư. Tăng sức mạnh phép thuật.', icon: '⚚', kind: 'weapon', stack: 1, buy: 30, sell: 12, classId: 'mage', power: 8 },
  armor: { id: 'armor', name: 'Giáp lữ hành', description: 'Giáp dùng chung cho mọi Class. Giảm sát thương nhận vào.', icon: '▣', kind: 'armor', stack: 1, buy: 24, sell: 10, power: 4 },
  'hp-potion': { id: 'hp-potion', name: 'Thuốc hồi HP', description: 'Hồi 65 HP. Thuốc HP/MP dùng chung hồi chiêu 5 giây.', icon: '♥', kind: 'potion', stack: 10, buy: 9, sell: 3, power: 65 },
  'mp-potion': { id: 'mp-potion', name: 'Thuốc hồi MP', description: 'Hồi 60 MP. Thuốc HP/MP dùng chung hồi chiêu 5 giây.', icon: '✦', kind: 'potion', stack: 10, buy: 9, sell: 3, power: 60 },
};

export const RECIPES: Record<RecipeId, RecipeDefinition> = {
  sword: { id: 'sword', name: 'Rèn Kiếm sắt', station: 'forge', ingredients: { ore: 3, wood: 2 }, output: 'sword' },
  staff: { id: 'staff', name: 'Rèn Trượng nguyệt', station: 'forge', ingredients: { ore: 3, wood: 2 }, output: 'staff' },
  armor: { id: 'armor', name: 'Rèn Giáp lữ hành', station: 'forge', ingredients: { ore: 2, wood: 2 }, output: 'armor' },
  'hp-potion': { id: 'hp-potion', name: 'Pha thuốc HP', station: 'alchemy', ingredients: { herb: 2 }, output: 'hp-potion' },
  'mp-potion': { id: 'mp-potion', name: 'Pha thuốc MP', station: 'alchemy', ingredients: { herb: 2 }, output: 'mp-potion' },
};

export const QUESTS: Record<QuestId, QuestDefinition> = {
  work: {
    id: 'work', name: 'Từ đôi bàn tay',
    description: 'Giữ E tại mỏ gần thị trấn để tự đào 3 quặng. Gặp Thợ Rèn học công thức và rèn Kiếm sắt hoặc Trượng nguyệt, rồi trở lại Trưởng làng. Sau đó học Class tại Người hướng dẫn.',
    rewardCopper: 20, rewardXp: 40,
  },
  seal: {
    id: 'seal', name: 'Vết nứt dưới trăng',
    description: 'Tự đi vào rừng phía đông. Tương tác phong ấn cổ, đánh bại 3 bóng ma vừa thoát ra rồi chạm phong ấn lần nữa để khép vết nứt. Trở về báo Trưởng làng.',
    rewardCopper: 30, rewardXp: 70,
  },
  boss: {
    id: 'boss', name: 'Người canh Tàn Nguyệt',
    description: 'Đi qua cổng phía bắc rừng, vượt các phòng hầm ngục và hạ Người Canh Tàn Nguyệt. Quay về thị trấn nộp nhiệm vụ cho Trưởng làng để kết thúc nội dung demo.',
    rewardCopper: 60, rewardXp: 120,
  },
};
