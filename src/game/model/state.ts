import { BALANCE, BAG_CAPACITY, CLASSES, ITEMS, QUESTS, RECIPES } from './catalog';
import type { ActionResult, CharacterAppearance, ClassId, GameState, InventorySlot, ItemId, QuestId, RecipeId } from './types';

const ok = (message: string): ActionResult => ({ ok: true, message });
const fail = (message: string): ActionResult => ({ ok: false, message });
const isQuantity = (quantity: number): boolean => Number.isSafeInteger(quantity) && quantity > 0;

export function createNewState(appearance: CharacterAppearance): GameState {
  const state: GameState = {
    version: 1,
    character: { ...appearance, name: appearance.name.trim().slice(0, 24) || 'Lữ khách' },
    classId: 'civilian', unlockedClasses: ['civilian'], level: 1, xp: 0, hp: 100, mp: 60,
    inventory: [{ itemId: 'wood', quantity: 4 }, { itemId: 'herb', quantity: 4 }],
    equipped: { swordsman: null, mage: null, armor: null }, learnedRecipes: [],
    coins: { copper: 20, silver: 0, gold: 0 },
    quests: { work: 'locked', seal: 'locked', boss: 'locked' },
    progress: {
      oreMined: 0, craftedEquipment: false, brewedPotion: false, learnedClass: false,
      sealBroken: false, sealKills: 0, sealResolved: false, bossDefeated: false,
      demoCompleted: false, secretFound: false, kills: 0,
    },
    world: {
      zone: 'town', x: 480, y: 400, elapsedSeconds: 0,
      discovered: { town: [], forest: [], dungeon: [] }, visited: ['town'], travelUnlocked: false,
    },
    checkpoint: { zone: 'town', x: 480, y: 400 }, potionCooldown: 0,
  };
  return state;
}

export function maxHp(state: GameState): number {
  return BALANCE.baseHp[state.classId] + (state.level - 1) * BALANCE.hpPerLevel;
}
export function maxMp(state: GameState): number {
  return BALANCE.baseMp[state.classId] + (state.level - 1) * BALANCE.mpPerLevel;
}
export function xpToNext(level: number): number {
  return BALANCE.firstLevelXp + Math.max(0, level - 1) * BALANCE.xpStep;
}
export function countItem(state: GameState, id: ItemId): number {
  return state.inventory.reduce((count, slot) => count + (slot.itemId === id ? slot.quantity : 0), 0);
}

// Build a complete candidate bag before committing: no partial loot or lost money.
function bagWithItem(inventory: InventorySlot[], id: ItemId, count: number): InventorySlot[] | null {
  const item = ITEMS[id];
  if (!item || !isQuantity(count)) return null;
  const bag = inventory.map((slot) => ({ ...slot }));
  let remaining = count;
  for (const slot of bag) {
    if (slot.itemId !== id) continue;
    const taken = Math.min(item.stack - slot.quantity, remaining);
    slot.quantity += taken;
    remaining -= taken;
    if (remaining === 0) return bag;
  }
  if (Math.ceil(remaining / item.stack) > BAG_CAPACITY - bag.length) return null;
  while (remaining > 0) {
    const quantity = Math.min(item.stack, remaining);
    bag.push({ itemId: id, quantity });
    remaining -= quantity;
  }
  return bag;
}

export function addItem(state: GameState, id: ItemId, count: number): ActionResult {
  const bag = bagWithItem(state.inventory, id, count);
  if (!bag) return fail('Túi không đủ chỗ hoặc số lượng vật phẩm không hợp lệ.');
  state.inventory = bag;
  return ok(`Nhận ${count} ${ITEMS[id].name}.`);
}

function equippedCount(state: GameState, id: ItemId): number {
  return Object.values(state.equipped).filter((equipped) => equipped === id).length;
}

export function removeItem(state: GameState, id: ItemId, count: number): boolean {
  if (!isQuantity(count) || countItem(state, id) - count < equippedCount(state, id)) return false;
  let remaining = count;
  const bag: InventorySlot[] = [];
  for (const slot of state.inventory) {
    const quantity = slot.itemId === id ? Math.min(slot.quantity, remaining) : 0;
    remaining -= quantity;
    if (slot.quantity > quantity) bag.push({ ...slot, quantity: slot.quantity - quantity });
  }
  state.inventory = bag;
  return true;
}

export function gainXp(state: GameState, amount: number): void {
  if (!Number.isSafeInteger(amount) || amount <= 0 || state.level >= BALANCE.maxLevel) return;
  state.xp += amount;
  const oldHp = maxHp(state);
  const oldMp = maxMp(state);
  while (state.level < BALANCE.maxLevel && state.xp >= xpToNext(state.level)) {
    state.xp -= xpToNext(state.level);
    state.level += 1;
  }
  if (state.level === BALANCE.maxLevel) state.xp = 0;
  // Level rewards grow current resources by the new capacity, rather than healing fully.
  state.hp = Math.min(maxHp(state), state.hp + maxHp(state) - oldHp);
  state.mp = Math.min(maxMp(state), state.mp + maxMp(state) - oldMp);
}

export function learnRecipe(state: GameState, recipeId: RecipeId): ActionResult {
  if (!RECIPES[recipeId]) return fail('Không có công thức này.');
  if (state.learnedRecipes.includes(recipeId)) return fail('Bạn đã biết công thức này.');
  state.learnedRecipes.push(recipeId);
  return ok(`Đã học: ${RECIPES[recipeId].name}.`);
}

export function craftItem(state: GameState, recipeId: RecipeId): ActionResult {
  const recipe = RECIPES[recipeId];
  if (!recipe || !state.learnedRecipes.includes(recipeId)) return fail('Hãy học công thức từ NPC trước.');
  const ingredients = Object.entries(recipe.ingredients) as [ItemId, number][];
  const missing = ingredients.filter(([id, quantity]) => countItem(state, id) < quantity);
  if (missing.length > 0) return fail(`Thiếu nguyên liệu: ${missing.map(([id, quantity]) => `${quantity - countItem(state, id)} ${ITEMS[id].name}`).join(', ')}.`);
  const candidate = { ...state, inventory: state.inventory.map((slot) => ({ ...slot })) };
  for (const [id, quantity] of ingredients) {
    if (!removeItem(candidate, id, quantity)) return fail('Không thể dùng nguyên liệu đang trang bị.');
  }
  const bag = bagWithItem(candidate.inventory, recipe.output, 1);
  if (!bag) return fail('Túi không đủ chỗ cho thành phẩm. Nguyên liệu được giữ nguyên.');
  state.inventory = bag;
  if (ITEMS[recipe.output].kind === 'weapon') state.progress.craftedEquipment = true;
  if (ITEMS[recipe.output].kind === 'potion') state.progress.brewedPotion = true;
  updateQuests(state);
  return ok(`Đã chế tạo ${ITEMS[recipe.output].name}.`);
}

export function buyItem(state: GameState, id: ItemId, quantity = 1): ActionResult {
  const item = ITEMS[id];
  if (!item || !isQuantity(quantity)) return fail('Số lượng mua không hợp lệ.');
  const cost = item.buy * quantity;
  if (!Number.isSafeInteger(cost) || state.coins.copper < cost) return fail('Không đủ Đồng. Bạc và Vàng không tự đổi.');
  const bag = bagWithItem(state.inventory, id, quantity);
  if (!bag) return fail('Túi không đủ chỗ. Tiền được giữ nguyên.');
  state.inventory = bag;
  state.coins.copper -= cost;
  return ok(`Mua ${quantity} ${item.name} với ${cost} Đồng.`);
}

export function sellItem(state: GameState, id: ItemId, quantity = 1): ActionResult {
  const item = ITEMS[id];
  if (!item || !isQuantity(quantity)) return fail('Số lượng bán không hợp lệ.');
  if (countItem(state, id) < quantity) return fail('Bạn không có đủ vật phẩm để bán.');
  if (countItem(state, id) - quantity < equippedCount(state, id)) return fail('Hãy tháo vật phẩm khỏi bộ trang bị trước khi bán chiếc cuối cùng.');
  const proceeds = item.sell * quantity;
  if (!Number.isSafeInteger(state.coins.copper + proceeds)) return fail('Giao dịch vượt giới hạn tiền.');
  if (!removeItem(state, id, quantity)) return fail('Không thể bán vật phẩm này.');
  state.coins.copper += proceeds;
  return ok(`Bán ${quantity} ${item.name}, nhận ${proceeds} Đồng.`);
}

export function equipItem(state: GameState, id: ItemId): ActionResult {
  const item = ITEMS[id];
  if (!item || countItem(state, id) < 1) return fail('Bạn không sở hữu vật phẩm này.');
  if (item.kind === 'armor') {
    const removing = state.equipped.armor === id;
    state.equipped.armor = removing ? null : id;
    return ok(`${removing ? 'Tháo' : 'Trang bị'} ${item.name}.`);
  }
  if (item.kind !== 'weapon' || (item.classId !== 'swordsman' && item.classId !== 'mage')) return fail('Vật phẩm này không phải trang bị.');
  if (state.classId !== item.classId) return fail(`Vũ khí này dành cho ${CLASSES[item.classId]}. Hãy đổi Class trước.`);
  const removing = state.equipped[item.classId] === id;
  state.equipped[item.classId] = removing ? null : id;
  return ok(`${removing ? 'Tháo' : 'Trang bị'} ${item.name}.`);
}

export function learnClass(state: GameState, classId: ClassId): ActionResult {
  if (classId !== 'swordsman' && classId !== 'mage') return fail('Hãy chọn Kiếm Sĩ hoặc Pháp Sư.');
  if (!state.progress.craftedEquipment || state.progress.oreMined < BALANCE.workOreGoal) return fail('Trước tiên hãy tự đào 3 quặng và rèn một vũ khí cơ bản.');
  if (state.unlockedClasses.includes(classId)) return fail('Bạn đã học Class này. Hãy chọn đổi Class.');
  state.unlockedClasses.push(classId);
  state.classId = classId;
  state.progress.learnedClass = true;
  state.hp = Math.min(state.hp, maxHp(state));
  state.mp = Math.min(state.mp, maxMp(state));
  const weapon: ItemId = classId === 'swordsman' ? 'sword' : 'staff';
  if (countItem(state, weapon) > 0) state.equipped[classId] = weapon;
  return ok(`Đã học ${CLASSES[classId]}. Space/chuột trái: đánh · 1/2: kỹ năng · Shift: né.`);
}

export function changeClass(state: GameState, classId: ClassId, inCombat: boolean): ActionResult {
  if (inCombat) return fail('Không thể đổi Class trong giao tranh.');
  if (!state.unlockedClasses.includes(classId)) return fail('Hãy học Class này từ NPC trước.');
  if (state.classId === classId) return fail('Bạn đang dùng Class này.');
  state.classId = classId;
  state.hp = Math.min(state.hp, maxHp(state));
  state.mp = Math.min(state.mp, maxMp(state));
  return ok(`Đã chuyển sang ${CLASSES[classId]}. Cấp và XP nhân vật được giữ nguyên.`);
}

export function acceptQuest(state: GameState, id: QuestId): ActionResult {
  if (!QUESTS[id]) return fail('Không có nhiệm vụ này.');
  if (state.quests[id] !== 'locked') return fail('Nhiệm vụ này đã được nhận hoặc hoàn thành.');
  if (id === 'seal' && state.quests.work !== 'done') return fail('Hãy nộp nhiệm vụ nghề nghiệp trước.');
  if (id === 'boss' && state.quests.seal !== 'done') return fail('Hãy xử lý phong ấn và báo Trưởng làng trước.');
  state.quests[id] = 'active';
  updateQuests(state);
  return ok(`Đã nhận nhiệm vụ: ${QUESTS[id].name}.`);
}

function questGoalMet(state: GameState, id: QuestId): boolean {
  if (id === 'work') return state.progress.oreMined >= BALANCE.workOreGoal && state.progress.craftedEquipment;
  if (id === 'seal') return state.progress.sealBroken && state.progress.sealKills >= BALANCE.sealKillGoal && state.progress.sealResolved;
  return state.progress.bossDefeated;
}

export function updateQuests(state: GameState): void {
  for (const id of Object.keys(QUESTS) as QuestId[]) {
    if (state.quests[id] === 'active' || state.quests[id] === 'ready') state.quests[id] = questGoalMet(state, id) ? 'ready' : 'active';
  }
}

export function questObjective(state: GameState, id: QuestId): string {
  if (state.quests[id] === 'done') return 'Đã nộp và nhận thưởng.';
  if (state.quests[id] === 'locked') return id === 'work' ? 'Gặp Trưởng làng ở thị trấn để nhận nhiệm vụ.' : 'Hoàn thành và nộp nhiệm vụ trước để mở.';
  if (questGoalMet(state, id)) return 'Đủ mục tiêu! Trở về thị trấn nộp cho Trưởng làng.';
  if (id === 'work') return `Tự đào quặng ${Math.min(state.progress.oreMined, BALANCE.workOreGoal)}/${BALANCE.workOreGoal} · Rèn kiếm hoặc trượng ${state.progress.craftedEquipment ? '✓' : '0/1'}`;
  if (id === 'seal') return `Phá phong ấn ${state.progress.sealBroken ? '✓' : '0/1'} · Bóng ma ${Math.min(state.progress.sealKills, BALANCE.sealKillGoal)}/${BALANCE.sealKillGoal} · Khép vết nứt ${state.progress.sealResolved ? '✓' : '0/1'}`;
  return 'Vào hầm ngục phía bắc rừng và hạ Người Canh Tàn Nguyệt.';
}

export function completeQuest(state: GameState, id: QuestId): ActionResult {
  if (!QUESTS[id]) return fail('Không có nhiệm vụ này.');
  updateQuests(state);
  if (state.world.zone !== 'town') return fail('Hãy trở về thị trấn gặp Trưởng làng để nộp nhiệm vụ.');
  if (state.quests[id] === 'done') return fail('Nhiệm vụ đã nhận thưởng; không thể nhận lần nữa.');
  if (state.quests[id] !== 'ready') return fail('Chưa đạt đủ mục tiêu nhiệm vụ.');
  const quest = QUESTS[id];
  state.quests[id] = 'done';
  state.coins.copper += quest.rewardCopper;
  gainXp(state, quest.rewardXp);
  if (id === 'boss') {
    state.progress.demoCompleted = true;
    return ok('Kết thúc nội dung cốt truyện của Demo v0.1 – thế giới vẫn có thể tự do khám phá.');
  }
  return ok(`Hoàn thành ${quest.name}: +${quest.rewardCopper} Đồng, +${quest.rewardXp} XP.`);
}

export function usePotion(state: GameState, id: ItemId): ActionResult {
  if (id !== 'hp-potion' && id !== 'mp-potion') return fail('Đây không phải thuốc hồi phục.');
  if (state.hp <= 0) return fail('Không thể uống thuốc khi đã bị hạ gục.');
  if (state.potionCooldown > 0) return fail(`Thuốc còn hồi chiêu ${Math.ceil(state.potionCooldown)} giây.`);
  if (countItem(state, id) < 1) return fail('Bạn không có thuốc này.');
  const hp = id === 'hp-potion';
  if (hp ? state.hp >= maxHp(state) : state.mp >= maxMp(state)) return fail(`${hp ? 'HP' : 'MP'} đã đầy; thuốc được giữ nguyên.`);
  if (!removeItem(state, id, 1)) return fail('Không thể dùng thuốc này.');
  if (hp) state.hp = Math.min(maxHp(state), state.hp + BALANCE.hpPotionRestore);
  else state.mp = Math.min(maxMp(state), state.mp + BALANCE.mpPotionRestore);
  state.potionCooldown = BALANCE.potionCooldown;
  return ok(`Đã uống ${ITEMS[id].name}.`);
}

export function respawn(state: GameState): void {
  state.hp = maxHp(state);
  state.mp = maxMp(state);
  state.potionCooldown = 0;
  state.world.zone = state.checkpoint.zone;
  state.world.x = state.checkpoint.x;
  state.world.y = state.checkpoint.y;
}
