import type {
  ActionResult, CharacterAppearance, ClassId, GameState, ItemId, ItemDefinition, QuestId, RecipeId,
} from '../game/model/types';
import { ITEMS, RECIPES, QUESTS, CLASS_NAMES, RACE_NAMES, BALANCE } from '../game/model/catalog';
import { maxHp, maxMp, xpToNext, questObjective } from '../game/model/state';
import { ZONES } from '../game/world/maps';
import type { GameSettings } from '../game/model/settings';
import { parseSave } from '../game/model/storage';
import type { QuestGuidanceStatus } from '../game/scenes/DemoScene';
import { getB2Portrait, preloadB2Portraits } from '../game/world/B2Portrait';

export interface DemoUIActions {
  create: (appearance: CharacterAppearance) => void;
  continue: () => void;
  pause: () => void;
  resume: () => void;
  save: () => ActionResult;
  returnToTitle: () => void;
  travel: () => ActionResult;
  usePotion: (id: ItemId) => ActionResult;
  switchClass: (id: ClassId) => ActionResult;
  craft: (id: RecipeId) => ActionResult;
  learnRecipe: (id: RecipeId) => ActionResult;
  equip: (id: ItemId) => ActionResult;
  buy: (id: ItemId) => ActionResult;
  sell: (id: ItemId) => ActionResult;
  quest: (id: QuestId) => ActionResult;
  learnClass: (id: ClassId) => ActionResult;
  getSettings: () => GameSettings;
  getItemIcon: (id: ItemId) => string | undefined;
  updateSettings: (patch: Partial<GameSettings>) => ActionResult;
  exportSave: () => ActionResult;
  importSave: (raw: string) => ActionResult;
  listSaveBackups: () => Array<{ key: string; raw: string }>;
  exportBackup: (key: string) => ActionResult;
  fullscreen: () => Promise<ActionResult>;
}

type PanelId = 'inventory' | 'quests' | 'craft' | 'map' | 'help' | 'settings' | 'save-data';
export interface CombatStatus {
  attack: number;
  dodge: number;
  skills: [number, number];
  boss: { name: string; hp: number; maxHp: number; phase: number; warning: boolean } | null;
}
type NPCRole = 'elder' | 'trainer' | 'forge' | 'alchemy' | 'merchant';
type Tone = 'info' | 'success' | 'danger';
const QUEST_ORDER: QuestId[] = ['work', 'seal', 'boss'];
const NPC_NAMES: Record<NPCRole, string> = { elder: 'Trưởng làng', trainer: 'Người dạy Class', forge: 'Thợ Rèn', alchemy: 'Nhà Giả Kim', merchant: 'Thương nhân' };
const QUEST_LABELS = { locked: 'Chưa mở', active: 'Đang thực hiện', ready: 'Sẵn sàng nộp', done: 'Hoàn thành' };

function escape(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

function quantity(state: GameState, id: ItemId): number {
  return state.inventory.reduce((total, slot) => total + (slot.itemId === id ? slot.quantity : 0), 0);
}

function portrait(appearance: CharacterAppearance, extraClass = '', state?: GameState): string {
  const classId = state?.classId ?? 'civilian';
  const source = getB2Portrait(appearance, classId, Boolean(state?.equipped.armor),
    classId !== 'civilian' && Boolean(state?.equipped[classId]));
  if (source) return `<img class="b2-portrait ${extraClass}" data-race="${appearance.race}" data-gender="${appearance.gender}" data-hair="${appearance.hair}" src="${escape(source)}" alt="" width="32" height="42" aria-hidden="true">`;
  return `<div class="pixel-portrait ${extraClass}" data-race="${appearance.race}" data-gender="${appearance.gender}" data-hair="${appearance.hair}" style="--skin:${escape(appearance.skinColor)};--hair:${escape(appearance.hairColor)}" aria-hidden="true"><span class="portrait-shadow"></span><span class="portrait-ears"></span><span class="portrait-hair-back"></span><span class="portrait-body"></span><span class="portrait-head"></span><span class="portrait-hair"></span><span class="portrait-eyes"></span><span class="portrait-arms"></span><span class="portrait-belt"></span><span class="portrait-feet"></span></div>`;
}

export class DemoUI {
  private state: GameState | undefined;
  private inCombat = false;
  private panelKind: PanelId | NPCRole | 'menu' | 'pause' | 'ending' | undefined;
  private toastTimeout: number | undefined;
  private lastFocused: HTMLElement | null = null;
  private pendingSave: { raw: string; state: GameState } | undefined;
  private importSequence = 0;
  private hudPortraitKey = '';
  private readonly hud = new Map<string, HTMLElement>();

  constructor(private readonly root: HTMLElement, private readonly actions: DemoUIActions) {}

  get hasPanel(): boolean { return this.panelKind !== undefined; }

  private itemIcon(item: ItemDefinition): string {
    const source = this.actions.getItemIcon(item.id);
    return source ? `<span class="item-icon" aria-hidden="true"><img src="${escape(source)}" alt="" width="32" height="32"></span>`
      : `<span class="item-icon" aria-hidden="true">${escape(item.icon)}</span>`;
  }

  mountTitle(hasSave: boolean, error?: string): void {
    this.importSequence += 1;
    this.pendingSave = undefined;
    this.panelKind = undefined;
    this.state = undefined;
    this.hud.clear();
    this.root.dataset.screen = 'title';
    const initial: CharacterAppearance = { name: 'Lữ khách', race: 'human', gender: 'female', hair: 'long', hairColor: '#493b36', skinColor: '#e7bd92' };
    this.root.innerHTML = `<div class="title-shell"><header class="demo-topbar"><div class="demo-brand"><span class="moon-emblem" aria-hidden="true">☾</span><span>TÀN NGUYỆT<small>THE CURSED KINGDOM</small></span></div><span class="demo-version"><i></i> DEMO v0.1 · CHƠI ĐƠN</span></header><main class="title-content"><section class="title-story"><p class="demo-eyebrow">MỘT VƯƠNG QUỐC ĐÃ LÃNG QUÊN ÁNH TRĂNG</p><h1>Từ một người<br>bình thường,<br><em>viết nên huyền thoại.</em></h1><p class="title-description">Tự kiếm sống giữa thị trấn nhỏ. Học một nghề, cầm lấy thanh kiếm hoặc trượng phép, rồi bước vào khu rừng mang lời nguyền.</p><div class="title-path"><span><b>01</b> Làm nghề</span><span><b>02</b> Phiêu lưu</span><span><b>03</b> Phá lời nguyền</span></div>${hasSave ? '<button type="button" class="demo-button primary continue-button" id="continue-button">Tiếp tục hành trình <span>→</span></button><p class="quiet-note">Tiếp tục từ bản lưu trên trình duyệt này.</p>' : '<p class="title-quote">“Không ai sinh ra đã là người hùng.”</p>'}<p class="title-footnote">Một thế giới nhỏ để khám phá, chiến đấu và trở về.<br>Không cần đăng nhập. Tiến độ được lưu trên trình duyệt này.</p>${error ? `<p class="runtime-error" role="alert">${escape(error)}</p>` : ''}</section><section class="character-card" aria-labelledby="character-title"><div class="card-heading"><div><p class="demo-eyebrow">HÀNH TRÌNH MỚI</p><h2 id="character-title">Người sẽ bước vào đêm</h2></div><span class="card-rune" aria-hidden="true">✧</span></div><div class="character-preview"><div class="portrait-platform"><div id="character-portrait">${portrait(initial)}</div><span class="platform-rune" aria-hidden="true">◇</span></div><div><span class="preview-name" id="preview-name">Lữ khách</span><span class="preview-detail" id="preview-detail">Con Người · Dân thường</span><span class="preview-level">CẤP 1 · KHỞI ĐẦU CÂN BẰNG</span></div></div><form id="character-form"><label class="form-field full">Tên nhân vật<input id="character-name" name="name" maxlength="24" minlength="1" value="Lữ khách" required autocomplete="off"></label><div class="form-grid"><label class="form-field">Chủng tộc<select id="race" name="race"><option value="human">Con Người</option><option value="elf">Tinh Linh</option><option value="dwarf">Người Lùn</option><option value="beast">Thú Nhân</option></select></label><label class="form-field">Giới tính<select id="gender" name="gender"><option value="female">Nữ</option><option value="male">Nam</option></select></label><label class="form-field">Kiểu tóc<select id="hair" name="hair"><option value="long">Tóc dài</option><option value="short">Tóc ngắn</option><option value="braid">Tóc tết</option></select></label><label class="form-field">Màu tóc<select id="hair-color" name="hairColor"><option value="#493b36">Nâu trầm</option><option value="#d6c18f">Vàng ánh trăng</option><option value="#27323c">Đen than</option><option value="#a36045">Đồng đỏ</option><option value="#ced8d0">Bạc</option></select></label><label class="form-field full">Màu da<select id="skin-color" name="skinColor"><option value="#e7bd92">Cát sáng</option><option value="#c89468">Hổ phách</option><option value="#8d5d45">Nâu ấm</option><option value="#edcfb2">Ngà</option></select></label></div><button id="create-button" class="demo-button primary" type="submit">Bắt đầu hành trình <span>→</span></button><p class="quiet-note">Bắt đầu là dân thường. Class được học trong game.${hasSave ? '<br>Hãy lưu khi sẵn sàng thay thế bản lưu trước.' : ''}</p></form></section></main><footer class="demo-footer"><span>HIGH FANTASY · ACTION RPG · ĐỜI SỐNG NGHỀ NGHIỆP</span><span>WASD + CHUỘT <span class="footer-gold">✧</span> CHƠI TRÊN PC</span></footer></div><div id="demo-toast" class="demo-toast" role="status" aria-live="polite" hidden></div>`;
    const form = this.find<HTMLFormElement>('character-form');
    const read = (): CharacterAppearance => ({
      name: this.find<HTMLInputElement>('character-name').value.trim(),
      race: this.find<HTMLSelectElement>('race').value as CharacterAppearance['race'],
      gender: this.find<HTMLSelectElement>('gender').value as CharacterAppearance['gender'],
      hair: this.find<HTMLSelectElement>('hair').value as CharacterAppearance['hair'],
      hairColor: this.find<HTMLSelectElement>('hair-color').value,
      skinColor: this.find<HTMLSelectElement>('skin-color').value,
    });
    form.addEventListener('input', () => {
      const appearance = read();
      this.find('character-portrait').innerHTML = portrait(appearance);
      this.find('preview-name').textContent = appearance.name || 'Lữ khách';
      this.find('preview-detail').textContent = `${RACE_NAMES[appearance.race]} · Dân thường`;
    });
    void preloadB2Portraits().then(() => {
      if (form.isConnected && this.root.dataset.screen === 'title') form.dispatchEvent(new Event('input'));
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const appearance = read();
      if (!appearance.name) { this.find<HTMLInputElement>('character-name').focus(); return; }
      this.actions.create(appearance);
    });
    this.root.querySelector('#continue-button')?.addEventListener('click', () => this.actions.continue());
    this.root.querySelector('.title-story')?.insertAdjacentHTML('beforeend', '<div class="title-utilities"><button id="title-settings-button" class="demo-button small" type="button">Cài đặt</button><button id="title-save-data-button" class="demo-button small" type="button">Bản lưu & sao lưu</button></div>');
    this.root.insertAdjacentHTML('beforeend', '<div id="panel-overlay" class="panel-overlay" hidden></div>');
    this.find('title-settings-button').addEventListener('click', () => this.showSettings());
    this.find('title-save-data-button').addEventListener('click', () => this.showSaveData());
    this.bindOverlay();
  }

  mountGame(state: GameState): HTMLElement {
    this.importSequence += 1;
    this.pendingSave = undefined;
    this.state = state;
    this.panelKind = undefined;
    this.hud.clear();
    this.root.dataset.screen = 'game';
    this.root.innerHTML = `<main class="game-shell"><section class="game-stage" aria-label="Vùng chơi TÀN NGUYỆT">
        <div class="zone-heading"><div><p class="demo-eyebrow" id="hud-zone-subtitle"></p><h1 id="hud-zone"></h1></div><div class="world-time"><span id="hud-clock"></span><span id="hud-combat">KHU VỰC AN TOÀN</span><span class="free-explore" id="free-explore" hidden>✧ Demo hoàn tất</span></div></div><div id="game" tabindex="0" role="application" aria-label="TÀN NGUYỆT. Điều khiển và cách chơi trong Menu trò chơi, mục Hướng dẫn."></div><div id="interaction-prompt" class="interaction-prompt" hidden><span id="interaction-text"></span><div class="interaction-progress" id="interaction-progress" hidden><span id="interaction-fill"></span></div></div>
        <div id="quest-guide" class="quest-guide" hidden role="status" aria-live="polite" aria-label="Bước tiếp theo của nhiệm vụ"><span class="quest-guide-symbol" aria-hidden="true">✧</span><div><strong id="quest-guide-objective"></strong><p><span id="quest-guide-label"></span><span id="quest-guide-action"></span></p></div></div>
        <div class="game-status">
          <div class="player-hud"><div class="hud-identity"><span id="hud-avatar">${portrait(state.character, 'hud-portrait', state)}</span><div><strong id="hud-name"></strong><span><b id="hud-class"></b> <i>·</i> Cấp <b id="hud-level"></b></span></div></div><div class="hud-vitals"><div class="vital-row"><span>HP</span><div class="vital-track"><i id="hud-hp-bar"></i></div><b id="hud-hp"></b></div><div class="vital-row mana"><span>MP</span><div class="vital-track"><i id="hud-mp-bar"></i></div><b id="hud-mp"></b></div><div class="xp-line"><span>Tiến trình cấp</span><span id="hud-xp"></span></div></div><div class="hud-wallet"><span><i class="coin copper"></i><b id="hud-copper"></b> Đồng</span><span><i class="coin silver"></i><b id="hud-silver"></b> Bạc</span><span><i class="coin gold"></i><b id="hud-gold"></b> Vàng</span></div></div>
          <div class="action-bar"><div class="combat-shortcuts"><div class="skill-key"><kbd>Space</kbd><span>Đánh thường</span></div><div class="skill-key"><kbd>Shift</kbd><span>Né / lướt</span></div><div class="skill-key"><kbd>1</kbd><span id="skill-one">Học Class</span></div><div class="skill-key"><kbd>2</kbd><span id="skill-two">Học Class</span></div><button class="potion-key" id="hp-potion-button" type="button"><kbd>Q</kbd><span>Thuốc HP <b id="hp-potion-count"></b></span></button><button class="potion-key" id="mp-potion-button" type="button"><kbd>R</kbd><span>Thuốc MP <b id="mp-potion-count"></b></span></button></div><span id="potion-cooldown" class="cooldown-label"></span></div>
        </div>
        <button id="game-menu-button" class="game-menu-button" type="button" aria-label="Menu trò chơi" aria-haspopup="dialog" aria-controls="panel-overlay" aria-expanded="false"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
      </section></main><div id="panel-overlay" class="panel-overlay" hidden></div><div id="demo-toast" class="demo-toast" role="status" aria-live="polite" hidden></div>`;
    this.root.querySelector('.game-stage')?.insertAdjacentHTML('beforeend', '<div id="boss-hud" class="boss-hud" hidden role="status" aria-label="Tình trạng Boss"><div class="boss-hud-heading"><strong id="boss-name"></strong><span id="boss-phase"></span></div><div class="boss-hp-track"><span id="boss-hp-fill"></span></div><div class="boss-hud-detail"><span id="boss-hp-value"></span><strong id="boss-warning"></strong></div></div>');
    this.root.querySelectorAll<HTMLElement>('.skill-key').forEach((node, index) => {
      const id = ['attack', 'dodge', 'skill-one', 'skill-two'][index];
      node.dataset.skill = id;
      node.insertAdjacentHTML('beforeend', `<small id="cooldown-${id}" class="skill-cooldown" aria-live="off">Sẵn sàng</small>`);
    });
    this.root.querySelectorAll<HTMLElement>('[id^="hud-"], [id^="cooldown-"], [id^="boss-"], [id^="quest-guide"], #quest-tracker, #journey-steps, #skill-one, #skill-two, #hp-potion-count, #mp-potion-count, #potion-cooldown, #free-explore').forEach((node) => this.hud.set(node.id, node));
    this.find('game-menu-button').addEventListener('click', () => { if (this.panelKind === 'menu') this.closePanel(); else this.open('menu'); });
    this.find('hp-potion-button').addEventListener('click', () => this.result(this.actions.usePotion('hp-potion')));
    this.find('mp-potion-button').addEventListener('click', () => this.result(this.actions.usePotion('mp-potion')));
    this.bindOverlay();
    this.render(state, false);
    void preloadB2Portraits().then(() => {
      if (this.state === state && this.root.dataset.screen === 'game') {
        this.hudPortraitKey = ''; this.render(state, this.inCombat);
      }
    });
    this.setCombatStatus({ attack: 0, dodge: 0, skills: [0, 0], boss: null });
    return this.find('game');
  }

  private bindOverlay(): void {
    this.find('panel-overlay').addEventListener('click', (event) => { if (event.target === event.currentTarget) this.closePanel(); });
    this.find('panel-overlay').addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = this.find('panel-overlay').querySelectorAll<HTMLElement>('button:not(:disabled), a, input, select, [tabindex="0"]');
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  }

  render(state: GameState, inCombat: boolean): void {
    this.state = state;
    this.inCombat = inCombat;
    if (this.root.dataset.screen !== 'game') return;
    const portraitKey = JSON.stringify([state.character, state.classId, state.equipped]);
    if (portraitKey !== this.hudPortraitKey) {
      const avatar = this.root.querySelector('#hud-avatar');
      if (avatar) avatar.innerHTML = portrait(state.character, 'hud-portrait', state);
      this.hudPortraitKey = portraitKey;
    }
    this.setText('hud-name', state.character.name);
    this.setText('hud-class', CLASS_NAMES[state.classId]);
    this.setText('hud-level', String(state.level));
    this.setText('hud-xp', `${state.xp} / ${xpToNext(state.level)} XP`);
    this.setText('hud-hp', `${Math.ceil(state.hp)} / ${maxHp(state)}`);
    this.setText('hud-mp', `${Math.ceil(state.mp)} / ${maxMp(state)}`);
    this.setStyle('hud-hp-bar', 'width', `${Math.max(0, Math.min(100, state.hp / maxHp(state) * 100))}%`);
    this.setStyle('hud-mp-bar', 'width', `${Math.max(0, Math.min(100, state.mp / maxMp(state) * 100))}%`);
    this.setText('hud-copper', String(state.coins.copper)); this.setText('hud-silver', String(state.coins.silver)); this.setText('hud-gold', String(state.coins.gold));
    this.setText('hud-zone', ZONES[state.world.zone].name);
    this.setText('hud-zone-subtitle', ZONES[state.world.zone].subtitle);
    const night = this.isNight(state);
    this.setText('hud-clock', `${night ? '☾ Đêm' : '☀ Ngày'} · Ngày ${Math.floor(state.world.elapsedSeconds / BALANCE.daySeconds) + 1}`);
    this.setText('hud-combat', inCombat ? 'ĐANG GIAO TRANH' : state.world.zone === 'town' ? 'KHU VỰC AN TOÀN' : 'ĐANG KHÁM PHÁ');
    this.hud.get('hud-combat')!.dataset.combat = String(inCombat);
    this.setText('skill-one', state.classId === 'swordsman' ? 'Chém xoáy' : state.classId === 'mage' ? 'Tam nguyệt tiễn' : 'Học Class');
    this.setText('skill-two', state.classId === 'swordsman' ? 'Trảm nguyệt' : state.classId === 'mage' ? 'Nguyệt bùng nổ' : 'Học Class');
    this.setText('hp-potion-count', `×${quantity(state, 'hp-potion')}`); this.setText('mp-potion-count', `×${quantity(state, 'mp-potion')}`);
    this.setText('potion-cooldown', state.potionCooldown > 0 ? `Thuốc hồi sau ${Math.ceil(state.potionCooldown)}s` : '');
    this.setHTML('quest-tracker', this.questTracker(state));
    this.setHTML('journey-steps', this.journeySteps(state));
    this.hud.get('free-explore')!.hidden = !state.progress.demoCompleted;
  }

  toast(message: string, tone: Tone = 'info'): void {
    const node = this.root.querySelector<HTMLElement>('#demo-toast');
    if (!node) return;
    if (this.toastTimeout !== undefined) window.clearTimeout(this.toastTimeout);
    node.textContent = message; node.dataset.tone = tone; node.hidden = false;
    this.toastTimeout = window.setTimeout(() => { node.hidden = true; }, tone === 'danger' ? 6500 : 4000);
  }

  setInteraction(text: string, progress?: number): void {
    const prompt = this.root.querySelector<HTMLElement>('#interaction-prompt');
    if (!prompt) return;
    prompt.hidden = !text;
    this.find('interaction-text').textContent = text;
    this.find('interaction-progress').hidden = progress === undefined;
    this.find('interaction-fill').style.width = `${Math.min(1, Math.max(0, progress ?? 0)) * 100}%`;
  }

  setCombatStatus(status: CombatStatus): void {
    if (this.root.dataset.screen !== 'game') return;
    const cooldowns = [status.attack, status.dodge, ...status.skills];
    const ids = ['attack', 'dodge', 'skill-one', 'skill-two'];
    cooldowns.forEach((remaining, index) => {
      const locked = this.state?.classId === 'civilian' && index !== 1;
      this.setText(`cooldown-${ids[index]}`, locked ? 'Chưa học' : remaining > 0 ? `${remaining.toFixed(1)}s` : 'Sẵn sàng');
      const node = this.hud.get(`cooldown-${ids[index]}`)?.parentElement;
      if (node) node.dataset.cooling = String(remaining > 0 || locked);
    });
    const boss = status.boss;
    const node = this.hud.get('boss-hud');
    if (!node) return;
    node.hidden = !boss || boss.hp <= 0;
    if (!boss) return;
    node.dataset.warning = String(boss.warning);
    node.dataset.phase = String(boss.phase);
    this.setText('boss-name', boss.name);
    this.setText('boss-phase', `Giai đoạn ${boss.phase}`);
    this.setText('boss-hp-value', `${Math.ceil(Math.max(0, boss.hp))} / ${boss.maxHp} HP`);
    this.setText('boss-warning', boss.warning ? 'NÉ VÙNG CẢNH BÁO!' : '');
    this.setStyle('boss-hp-fill', 'width', `${Math.max(0, Math.min(100, boss.hp / boss.maxHp * 100))}%`);
  }

  setQuestGuidance(status: QuestGuidanceStatus | null): void {
    const node = this.hud.get('quest-guide');
    if (!node) return;
    node.hidden = !status;
    if (!status) return;
    node.dataset.target = status.id;
    node.dataset.near = String(status.near);
    this.setText('quest-guide-objective', status.objective);
    this.setText('quest-guide-label', status.label);
    this.setText('quest-guide-action', `${status.near ? '' : status.reachable ? 'Theo mũi tên vàng · ' : 'Chưa tìm được đường · '}${status.action}`);
  }

  openNPC(role: NPCRole, state: GameState): void {
    this.state = state;
    this.open(role);
  }

  showPanel(panel: PanelId, state: GameState): void {
    this.state = state;
    this.open(panel);
  }

  showPause(state: GameState): void { this.state = state; this.open('pause'); }

  showEnding(state: GameState): void { this.state = state; this.open('ending'); }

  showSettings(): void { this.open('settings'); }

  showSaveData(): void { this.pendingSave = undefined; this.open('save-data'); }

  closePanel(): void {
    const overlay = this.root.querySelector<HTMLElement>('#panel-overlay');
    if (overlay) { overlay.hidden = true; overlay.replaceChildren(); }
    this.panelKind = undefined;
    this.root.querySelector('#game-menu-button')?.setAttribute('aria-expanded', 'false');
    this.pendingSave = undefined;
    this.importSequence += 1;
    if (this.root.dataset.screen === 'game') this.actions.resume();
    if (this.lastFocused?.isConnected && this.lastFocused !== document.body) this.lastFocused.focus({ preventScroll: true });
    else this.root.querySelector<HTMLElement>('#game')?.focus({ preventScroll: true });
  }

  private open(panel: NonNullable<DemoUI['panelKind']>): void {
    if ((!this.state && panel !== 'settings' && panel !== 'save-data') || !this.root.querySelector('#panel-overlay')) return;
    if (panel === 'settings' || panel === 'save-data') {
      this.importSequence += 1;
      this.pendingSave = undefined;
    }
    if (!this.panelKind) this.lastFocused = document.activeElement as HTMLElement | null;
    if (this.root.dataset.screen === 'game') this.actions.pause();
    this.panelKind = panel;
    this.root.querySelector('#game-menu-button')?.setAttribute('aria-expanded', String(panel === 'menu'));
    this.drawPanel();
    this.find('panel-overlay').hidden = false;
    this.find('panel-close').focus({ preventScroll: true });
  }

  private drawPanel(): void {
    const state = this.state;
    const kind = this.panelKind;
    if (!kind || (!state && kind !== 'settings' && kind !== 'save-data')) return;
    if (kind === 'settings' || kind === 'save-data') {
      this.drawUtilityPanel(kind);
      return;
    }
    if (!state) return;
    let title: string; let eyebrow = 'TÀN NGUYỆT · NHẬT KÝ'; let body: string;
    if (kind === 'menu') {
      title = 'Menu trò chơi'; eyebrow = 'TÀN NGUYỆT';
      body = `<nav class="game-menu-navigation" aria-label="Các chức năng trong game"><button data-panel="inventory" type="button"><span aria-hidden="true">▣</span>Hành trang<kbd>I</kbd></button><button data-panel="quests" type="button"><span aria-hidden="true">✧</span>Nhiệm vụ<kbd>J</kbd></button><button data-panel="craft" type="button"><span aria-hidden="true">⚒</span>Nghề & chế tạo<kbd>C</kbd></button><button data-panel="map" type="button"><span aria-hidden="true">◇</span>Bản đồ<kbd>M</kbd></button><button data-panel="help" type="button"><span aria-hidden="true">?</span>Hướng dẫn<kbd>H</kbd></button><button data-panel="settings" type="button"><span aria-hidden="true">⚙</span>Cài đặt</button><button data-panel="save-data" type="button"><span aria-hidden="true">⇅</span>Bản lưu & sao lưu</button><button id="save-button" type="button"><span aria-hidden="true">↓</span>Lưu game</button><button id="menu-fullscreen-button" type="button"><span aria-hidden="true">⛶</span>${document.fullscreenElement ? 'Thoát toàn màn hình' : 'Mở toàn màn hình'}</button><button id="pause-button" type="button"><span aria-hidden="true">Ⅱ</span>Tạm dừng<kbd>Esc</kbd></button></nav><button class="demo-button primary menu-resume" data-action="resume" type="button">Tiếp tục chơi</button>`;
    }
    else if (kind === 'inventory') { title = 'Hành trang'; body = this.inventory(state); }
    else if (kind === 'quests') { title = 'Những lời hứa'; body = this.quests(state, false); }
    else if (kind === 'craft') { title = 'Nghề & chế tạo'; body = this.craft(state); }
    else if (kind === 'map') { title = 'Những miền đã đến'; body = this.map(state); }
    else if (kind === 'help') { title = 'Cẩm nang người phiêu lưu'; body = this.help(); }
    else if (kind === 'pause') { title = 'Một khoảng lặng'; eyebrow = 'THẾ GIỚI ĐÃ TẠM DỪNG'; body = `<div class="pause-body"><span class="large-moon" aria-hidden="true">☾</span><p>Hành trình của ${escape(state.character.name)} vẫn đang chờ.</p><button class="demo-button primary" data-action="resume" type="button">Tiếp tục hành trình <kbd>Esc</kbd></button><button class="demo-button" data-action="save" type="button">Lưu tiến độ</button><button class="demo-button" data-action="title" type="button">Lưu và về màn hình đầu</button><p class="quiet-note">Bản lưu thuộc trình duyệt và địa chỉ hiện tại.<br>Game chỉ trở về màn hình đầu khi lưu thành công.</p></div>`; }
    else if (kind === 'ending') { title = 'Ánh trăng lại trở về'; eyebrow = 'BẠN ĐÃ HOÀN THÀNH CHUỖI NHIỆM VỤ'; body = `<div class="ending-body"><div class="ending-symbol" aria-hidden="true">☾</div><p class="ending-text">Kết thúc nội dung cốt truyện của Demo v0.1 – thế giới vẫn có thể tự do khám phá.</p><p>Từ một dân thường, bạn đã tự chế tạo trang bị, học Class và bước qua bóng tối. Đây là điểm dừng của câu chuyện thử nghiệm; hành trình của bạn còn tiếp tục.</p><div class="ending-stats"><span><b>${state.level}</b>Cấp nhân vật</span><span><b>${state.progress.kills}</b>Quái đã hạ</span><span><b>${state.progress.oreMined}</b>Quặng đã đào</span></div><button class="demo-button primary" data-action="resume" type="button">Tiếp tục khám phá <span>→</span></button><button class="demo-button" data-action="save" type="button">Lưu hành trình</button></div>`; }
    else { title = NPC_NAMES[kind]; eyebrow = `${this.isNight(state) ? 'ĐÊM · GẶP TẠI CHỖ NGHỈ' : 'NGÀY · TẠI NƠI LÀM VIỆC'} · TRO TÀN`; body = this.npc(kind, state); }
    const overlay = this.find('panel-overlay');
    const previousScroll = overlay.querySelector<HTMLElement>('.panel-content')?.scrollTop ?? 0;
    overlay.innerHTML = `<section class="game-panel ${kind === 'pause' ? 'compact-panel' : kind === 'menu' ? 'menu-panel' : ''}" role="dialog" aria-modal="true" aria-labelledby="panel-title"><header class="panel-header"><div><p class="demo-eyebrow">${escape(eyebrow)}</p><h2 id="panel-title">${escape(title)}</h2></div><button class="panel-close" id="panel-close" type="button" aria-label="Đóng và tiếp tục chơi">×</button></header><div class="panel-content">${body}</div><footer class="panel-footer"><span>Thế giới tạm dừng khi bạn mở bảng.</span><span><kbd>Esc</kbd> Đóng</span></footer></section>`;
    overlay.querySelector<HTMLElement>('.panel-content')!.scrollTop = previousScroll;
    this.find('panel-close').addEventListener('click', () => this.closePanel());
    overlay.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => button.addEventListener('click', () => this.panelAction(button)));
    if (kind === 'menu') {
      overlay.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach(button => button.addEventListener('click', () => { if (this.state) this.showPanel(button.dataset.panel as PanelId, this.state); }));
      this.find('save-button').addEventListener('click', () => { this.result(this.actions.save()); this.closePanel(); });
      this.find('pause-button').addEventListener('click', () => { if (this.state) this.showPause(this.state); });
      this.bindFullscreen('menu-fullscreen-button');
    }
    if (kind === 'map') this.drawMap(state);
    if (kind === 'pause') {
      overlay.querySelector('.pause-body .quiet-note')?.insertAdjacentHTML('beforebegin', '<button class="demo-button" id="pause-settings-button" type="button">Cài đặt</button><button class="demo-button" id="pause-save-data-button" type="button">Bản lưu & sao lưu</button>');
      this.find('pause-settings-button').addEventListener('click', () => this.showSettings());
      this.find('pause-save-data-button').addEventListener('click', () => this.showSaveData());
    }
  }

  private panelAction(button: HTMLButtonElement): void {
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === 'resume') { this.closePanel(); return; }
    if (action === 'title') { this.actions.returnToTitle(); return; }
    const callbacks: Record<string, () => ActionResult> = {
      save: () => this.actions.save(), travel: () => this.actions.travel(),
      equip: () => this.actions.equip(id as ItemId), potion: () => this.actions.usePotion(id as ItemId),
      craft: () => this.actions.craft(id as RecipeId), recipe: () => this.actions.learnRecipe(id as RecipeId),
      class: () => this.actions.switchClass(id as ClassId), learnClass: () => this.actions.learnClass(id as ClassId),
      buy: () => this.actions.buy(id as ItemId), sell: () => this.actions.sell(id as ItemId), quest: () => this.actions.quest(id as QuestId),
    };
    const callback = action ? callbacks[action] : undefined;
    if (!callback) return;
    const result = callback();
    this.result(result);
    if (action === 'travel' && result.ok) { this.closePanel(); return; }
    if (this.state && this.root.dataset.screen === 'game') this.render(this.state, this.inCombat);
    if (this.panelKind) this.drawPanel();
  }

  private drawUtilityPanel(kind: 'settings' | 'save-data'): void {
    const isGame = this.root.dataset.screen === 'game';
    const settings = this.actions.getSettings();
    const title = kind === 'settings' ? 'Cài đặt trải nghiệm' : 'Bản lưu & sao lưu';
    const body = kind === 'settings' ? `<div class="settings-list"><label class="setting-row volume-setting" for="settings-volume"><span><strong>Âm lượng</strong><small>Âm nền và phản hồi khi đánh, nhặt đồ, chế tạo.</small></span><span class="volume-control"><input id="settings-volume" type="range" min="0" max="100" step="1" value="${Math.round(settings.volume * 100)}"><output id="settings-volume-value" for="settings-volume">${Math.round(settings.volume * 100)}%</output></span></label><label class="setting-row" for="settings-muted"><span><strong>Tắt âm thanh</strong><small>Giữ mức âm lượng để có thể bật lại.</small></span><input id="settings-muted" type="checkbox" ${settings.muted ? 'checked' : ''}></label><label class="setting-row" for="settings-shake"><span><strong>Rung màn hình</strong><small>Phản hồi khi trúng đòn và xảy ra sự kiện.</small></span><input id="settings-shake" type="checkbox" ${settings.screenShake ? 'checked' : ''}></label><label class="setting-row" for="settings-damage"><span><strong>Hiện số sát thương</strong><small>Hiển thị lượng HP mất khi đòn đánh trúng.</small></span><input id="settings-damage" type="checkbox" ${settings.showDamageNumbers ? 'checked' : ''}></label><div class="setting-row"><span><strong>Toàn màn hình</strong><small>Có thể thoát bằng Esc theo điều khiển của trình duyệt.</small></span><button id="fullscreen-button" class="demo-button small" type="button">${document.fullscreenElement ? 'Thoát toàn màn hình' : 'Mở toàn màn hình'}</button></div></div><p class="panel-note utility-note">Cài đặt được giữ trên trình duyệt này và áp dụng ngay. Chúng không thay đổi nhân vật hoặc nhiệm vụ.</p>` : `<div class="save-transfer"><section class="save-transfer-section"><span class="demo-eyebrow">GIỮ MỘT BẢN RIÊNG</span><h3>Xuất bản lưu ra file</h3><p>Tải ô lưu đã ghi trên trình duyệt thành file JSON trên máy. Dùng file này để mang tiến độ sang trình duyệt hoặc địa chỉ local khác. Phiên chơi chưa lưu không nằm trong file xuất.</p><button id="export-save-button" class="demo-button" type="button">Tải bản lưu JSON <span>↓</span></button>${isGame ? '<p class="quiet-note">Bấm Lưu game trước nếu muốn xuất những tiến bộ mới nhất.</p>' : '<p class="quiet-note">Cần có một bản lưu trên trình duyệt này để xuất; bản lỗi cũng có thể tải để giữ một bản riêng.</p>'}</section><section class="save-transfer-section"><span class="demo-eyebrow">KHÔI PHỤC TỪ FILE LOCAL</span><h3>Nhập bản lưu</h3><p>Chọn file JSON để kiểm tra trước. Tiến độ chỉ được thay khi bạn bấm <strong>Khôi phục bản lưu này</strong> ở bước xác nhận.</p><label class="save-file-label" for="import-save-file">Chọn file bản lưu<input id="import-save-file" type="file" accept=".json,application/json"></label><p id="import-status" class="import-status" role="status" aria-live="polite">Chưa chọn file. Giới hạn 200 KB.</p><div id="import-preview" class="import-preview" hidden></div><button id="restore-save-button" class="demo-button primary" type="button" hidden disabled>Khôi phục bản lưu này <span>↑</span></button><p class="quiet-note">Bản lưu đang có sẽ được giữ thêm một bản dự phòng local trước khi thay thế. Xuất file riêng nếu muốn giữ lâu dài. Đừng xóa dữ liệu trình duyệt trước khi kiểm tra file đã tải.</p></section></div>`;
    const overlay = this.find('panel-overlay');
    overlay.innerHTML = `<section class="game-panel utility-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title"><header class="panel-header"><div><p class="demo-eyebrow">TÀN NGUYỆT · ${isGame ? 'THẾ GIỚI ĐÃ TẠM DỪNG' : 'CHUẨN BỊ HÀNH TRÌNH'}</p><h2 id="panel-title">${title}</h2></div><button class="panel-close" id="panel-close" type="button" aria-label="${isGame ? 'Đóng và tiếp tục chơi' : 'Đóng bảng'}">×</button></header><div class="panel-content">${body}</div><footer class="panel-footer"><span>${isGame ? 'Thế giới tạm dừng khi bạn mở bảng.' : kind === 'save-data' ? 'File được xử lý trực tiếp trên máy của bạn.' : 'Cài đặt được áp dụng và giữ trên trình duyệt này.'}</span><span><kbd>Esc</kbd> Đóng</span></footer></section>`;
    this.find('panel-close').addEventListener('click', () => this.closePanel());
    if (kind === 'settings') this.bindSettings();
    else this.bindSaveTransfer();
  }

  private bindSettings(): void {
    this.find<HTMLInputElement>('settings-volume').addEventListener('input', (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const value = Number(input.value);
      const result = this.actions.updateSettings({ volume: value / 100 });
      if (!result.ok) input.value = String(Math.round(this.actions.getSettings().volume * 100));
      this.find('settings-volume-value').textContent = `${input.value}%`;
      if (!result.ok) this.result(result);
    });
    const switches: [string, 'muted' | 'screenShake' | 'showDamageNumbers'][] = [
      ['settings-muted', 'muted'], ['settings-shake', 'screenShake'], ['settings-damage', 'showDamageNumbers'],
    ];
    for (const [id, key] of switches) {
      this.find<HTMLInputElement>(id).addEventListener('change', (event) => {
        const input = event.currentTarget as HTMLInputElement;
        const result = this.actions.updateSettings({ [key]: input.checked });
        if (!result.ok) input.checked = this.actions.getSettings()[key];
        this.result(result);
      });
    }
    this.bindFullscreen('fullscreen-button');
  }

  private bindFullscreen(id: string): void {
    this.find<HTMLButtonElement>(id).addEventListener('click', async (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      button.disabled = true;
      try {
        this.result(await this.actions.fullscreen());
        if (button.isConnected) button.textContent = document.fullscreenElement ? 'Thoát toàn màn hình' : 'Mở toàn màn hình';
      } catch (error) {
        this.toast(`Không thể đổi chế độ toàn màn hình: ${error instanceof Error ? error.message : String(error)}`, 'danger');
      } finally { if (button.isConnected) button.disabled = false; }
    });
  }

  private bindSaveTransfer(): void {
    this.bindSaveBackups();
    this.find('export-save-button').addEventListener('click', () => this.result(this.actions.exportSave()));
    this.find<HTMLInputElement>('import-save-file').addEventListener('change', async (event) => {
      const file = (event.currentTarget as HTMLInputElement).files?.[0];
      const sequence = ++this.importSequence;
      this.pendingSave = undefined;
      const restore = this.find<HTMLButtonElement>('restore-save-button');
      restore.hidden = true; restore.disabled = true;
      this.find('import-preview').hidden = true;
      const status = this.find('import-status');
      status.dataset.tone = 'info';
      if (!file) { status.textContent = 'Chưa chọn file. Giới hạn 200 KB.'; return; }
      if (file.size > 200_000) { status.textContent = 'File quá lớn. Hãy chọn bản lưu JSON không vượt quá 200 KB.'; status.dataset.tone = 'danger'; return; }
      status.textContent = 'Đang kiểm tra file…';
      try {
        const raw = await file.text();
        if (sequence !== this.importSequence || this.panelKind !== 'save-data') return;
        this.previewSave(raw);
      } catch (error) {
        if (sequence !== this.importSequence || this.panelKind !== 'save-data') return;
        status.textContent = `Không đọc được file: ${error instanceof Error ? error.message : String(error)}`;
        status.dataset.tone = 'danger';
      }
    });
    this.find<HTMLButtonElement>('restore-save-button').addEventListener('click', (event) => {
      if (!this.pendingSave) return;
      const result = this.actions.importSave(this.pendingSave.raw);
      this.result(result);
      if (result.ok) {
        this.pendingSave = undefined;
        (event.currentTarget as HTMLButtonElement).disabled = true;
      }
    });
  }

  private previewSave(raw: string): void {
    this.pendingSave = undefined;
    const restore = this.find<HTMLButtonElement>('restore-save-button');
    restore.hidden = true; restore.disabled = true;
    const preview = this.find('import-preview');
    preview.hidden = true;
    const status = this.find('import-status');
    const loaded = parseSave(raw);
    if (!loaded.state) { status.textContent = loaded.error ?? 'Dữ liệu không phải bản lưu hợp lệ.'; status.dataset.tone = 'danger'; return; }
    const state = loaded.state;
    this.pendingSave = { raw, state };
    status.textContent = 'Bản lưu hợp lệ. Kiểm tra nhân vật bên dưới trước khi khôi phục.';
    status.dataset.tone = 'success';
    preview.innerHTML = `<div class="save-preview-identity">${portrait(state.character, '', state)}<div><strong>${escape(state.character.name)}</strong><span>${escape(RACE_NAMES[state.character.race])} · ${escape(CLASS_NAMES[state.classId])}</span></div></div><dl><div><dt>Cấp nhân vật</dt><dd>${state.level}</dd></div><div><dt>Địa điểm</dt><dd>${escape(ZONES[state.world.zone].name)}</dd></div><div><dt>Tiến trình</dt><dd>${state.progress.demoCompleted ? 'Đã hoàn tất nội dung demo' : 'Đang trong hành trình'}</dd></div></dl><p>Khôi phục sẽ thay ô lưu hiện tại và bắt đầu phiên chơi từ nhân vật này.</p>`;
    preview.hidden = false; restore.hidden = false; restore.disabled = false;
  }

  private bindSaveBackups(): void {
    const backups = this.actions.listSaveBackups();
    const cards = backups.map((backup, index) => {
      const loaded = parseSave(backup.raw);
      const character = loaded.state;
      return `<article class="save-backup-card" data-backup-index="${index}"><div><h4>${character ? escape(character.character.name) : 'Dữ liệu cần kiểm tra'}</h4><p>${character ? `${escape(CLASS_NAMES[character.classId])} · Cấp ${character.level} · ${escape(ZONES[character.world.zone].name)}` : escape(loaded.error ?? 'Bản lưu chưa hợp lệ; vẫn có thể tải bản sao.')}</p><span>Bản dự phòng ${index + 1}</span></div><div class="save-backup-actions">${character ? `<button class="demo-button small" type="button" data-backup-preview="${index}">Xem trước</button>` : ''}<button class="demo-button small" type="button" data-backup-export="${index}">Tải bản sao <span>↓</span></button></div></article>`;
    }).join('');
    this.root.querySelector('.save-transfer')?.insertAdjacentHTML('beforeend', `<section class="save-transfer-section" id="save-backups"><span class="demo-eyebrow">CÁC MỐC ĐÃ GIỮ TRÊN TRÌNH DUYỆT</span><h3>Bản lưu dự phòng</h3><p>Mỗi lần khôi phục, ô lưu trước đó được giữ thêm tại đây. Xem trước rồi xác nhận để quay lại nhân vật cũ, hoặc tải từng bản thành file riêng. Các bản này được giữ nguyên khi khôi phục.</p><div class="save-backup-list">${cards || '<p class="quiet-note">Chưa có bản dự phòng. Bản đầu tiên sẽ được giữ khi bạn khôi phục thay một ô lưu đang có.</p>'}</div></section>`);
    this.root.querySelectorAll<HTMLButtonElement>('[data-backup-preview]').forEach(button => button.addEventListener('click', () => {
      const backup = backups[Number(button.dataset.backupPreview)];
      if (!backup) return;
      this.importSequence += 1;
      this.previewSave(backup.raw);
      this.find('import-preview').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
    this.root.querySelectorAll<HTMLButtonElement>('[data-backup-export]').forEach(button => button.addEventListener('click', () => {
      const backup = backups[Number(button.dataset.backupExport)];
      if (backup) this.result(this.actions.exportBackup(backup.key));
    }));
  }

  private inventory(state: GameState): string {
    const equipped = Object.values(state.equipped).filter((id): id is ItemId => id !== null);
    const slots = state.inventory.map((slot) => {
      const item = ITEMS[slot.itemId];
      const isEquipped = equipped.includes(item.id);
      const action = item.kind === 'potion' ? `<button class="demo-button small" data-action="potion" data-id="${item.id}" type="button">Sử dụng</button>` : item.kind === 'weapon' || item.kind === 'armor' ? `<button class="demo-button small" data-action="equip" data-id="${item.id}" type="button">${isEquipped ? 'Tháo' : 'Trang bị'}</button>` : '';
      return `<article class="inventory-slot ${isEquipped ? 'equipped-slot' : ''}"><div class="item-top">${this.itemIcon(item)}<span class="item-quantity">×${slot.quantity}</span></div><h3>${escape(item.name)}</h3><p>${escape(item.description)}</p>${isEquipped ? '<span class="item-equipped">Đang trang bị</span>' : ''}${action}</article>`;
    });
    while (slots.length < BALANCE.inventorySlots) slots.push('<div class="inventory-slot empty-slot" aria-hidden="true"><span>◇</span></div>');
    return `<div class="panel-intro"><p>Vật phẩm giống nhau được xếp chồng. Có thể mua/bán tại Thương nhân; trang bị được giữ riêng cho mỗi Class.</p><span class="capacity-label">${state.inventory.length} / ${BALANCE.inventorySlots} ô</span></div><div class="loadout-strip"><span><small>Kiếm Sĩ</small>${state.equipped.swordsman ? escape(ITEMS[state.equipped.swordsman].name) : 'Chưa có vũ khí'}</span><span><small>Pháp Sư</small>${state.equipped.mage ? escape(ITEMS[state.equipped.mage].name) : 'Chưa có vũ khí'}</span><span><small>Giáp dùng chung</small>${state.equipped.armor ? escape(ITEMS[state.equipped.armor].name) : 'Trang phục dân thường'}</span></div><div class="inventory-grid">${slots.join('')}</div>${this.classes(state, false)}`;
  }

  private questTracker(state: GameState): string {
    const active = QUEST_ORDER.find((id) => state.quests[id] === 'active' || state.quests[id] === 'ready');
    return active ? `<span class="tracker-status">${QUEST_LABELS[state.quests[active]]}</span><h3>${escape(QUESTS[active].name)}</h3><p>${escape(questObjective(state, active))}</p>` : state.progress.demoCompleted ? '<span class="tracker-status">Hành trình tiếp tục</span><h3>Tự do khám phá</h3><p>Đào quặng, pha thuốc hoặc trở lại hầm ngục cho một lượt phiêu lưu mới.</p>' : '<span class="tracker-status">Bước đầu tiên</span><h3>Một cuộc gặp dưới trăng</h3><p>Tới gặp Trưởng làng An ở phía bắc quảng trường.</p>';
  }

  private journeySteps(state: GameState): string {
    const active = QUEST_ORDER.find((id) => state.quests[id] === 'active' || state.quests[id] === 'ready');
    return QUEST_ORDER.map((id, i) => `<div class="journey-step ${state.quests[id] === 'done' ? 'done' : active === id ? 'active' : ''}"><span>${state.quests[id] === 'done' ? '✓' : `0${i + 1}`}</span><div><strong>${escape(QUESTS[id].name)}</strong><small>${QUEST_LABELS[state.quests[id]]}</small></div></div>`).join('');
  }

  private quests(state: GameState, interactive: boolean): string {
    const overview = interactive ? '' : `<div class="quest-overview"><div class="quest-tracker" id="quest-tracker" aria-live="polite">${this.questTracker(state)}</div><div class="journey-steps" id="journey-steps">${this.journeySteps(state)}</div></div>`;
    return `${overview}<div class="quest-list">${QUEST_ORDER.map((id) => {
      const quest = QUESTS[id]; const status = state.quests[id];
      const firstAvailable = id === 'work' || id === 'seal' && state.quests.work === 'done' || id === 'boss' && state.quests.seal === 'done';
      const action = interactive && status === 'ready' ? `<button class="demo-button primary small" data-action="quest" data-id="${id}" type="button">Nộp nhiệm vụ · nhận thưởng</button>` : interactive && status === 'locked' && firstAvailable ? `<button class="demo-button small" data-action="quest" data-id="${id}" type="button">Nhận nhiệm vụ</button>` : '';
      return `<article class="quest-card" data-quest="${id}" data-status="${status}"><div class="quest-card-heading"><h3>${escape(quest.name)}</h3><span class="quest-status ${status}">${QUEST_LABELS[status]}</span></div><p>${escape(quest.description)}</p>${status !== 'locked' ? `<p class="quest-objective">${escape(questObjective(state, id))}</p>` : '<p class="quiet-note">Tiếp tục chuỗi nhiệm vụ để mở bước này.</p>'}<div class="quest-reward"><span>Thưởng ${quest.rewardCopper} Đồng · ${quest.rewardXp} XP</span>${action}</div></article>`;
    }).join('')}</div>${!interactive ? '<p class="panel-note">Gặp Trưởng làng tại thị trấn để nhận và nộp nhiệm vụ. Nhật ký chỉ theo dõi hành động của bạn.</p>' : ''}`;
  }

  private craft(state: GameState, station?: 'forge' | 'alchemy'): string {
    const recipes = Object.values(RECIPES).filter((recipe) => !station || recipe.station === station);
    return `<p class="panel-note">Chế tạo tại đúng nơi: đứng cạnh Thợ Rèn hoặc Nhà Giả Kim. Công thức và đủ nguyên liệu tạo ra thành phẩm xác định, không có mini-game.</p><div class="recipe-list">${recipes.map((recipe) => {
      const known = state.learnedRecipes.includes(recipe.id);
      const output = ITEMS[recipe.output];
      const ingredients = Object.entries(recipe.ingredients).map(([key, needed]) => {
        const id = key as ItemId; const have = quantity(state, id);
        return `<span class="ingredient ${have < needed! ? 'missing' : ''}">${escape(ITEMS[id].name)} <b>${have}/${needed}</b></span>`;
      }).join('');
      return `<article class="recipe-card">${this.itemIcon(output)}<div class="recipe-details"><span class="recipe-station">${recipe.station === 'forge' ? 'THỢ RÈN' : 'NHÀ GIẢ KIM'}</span><h3>${escape(recipe.name)}</h3><p>${escape(output.description)}</p><div class="ingredients">${ingredients}</div></div><div class="recipe-action">${known ? '<span class="known-recipe">✓ Đã biết công thức</span><button class="demo-button small" data-action="craft" data-id="' + recipe.id + '" type="button">Chế tạo</button>' : station ? '<span class="unknown-recipe">Chưa học công thức</span><button class="demo-button small" data-action="recipe" data-id="' + recipe.id + '" type="button">Học công thức</button>' : '<span class="unknown-recipe">Gặp NPC để học</span>'}</div></article>`;
    }).join('')}</div>`;
  }

  private classes(state: GameState, canLearn: boolean): string {
    return `<div class="class-section"><h3>Class của bạn</h3><p class="quiet-note">Đổi Class đã học ngoài giao tranh; cấp nhân vật và hành trang được giữ nguyên.</p><div class="class-grid">${(['swordsman', 'mage'] as const).map((id) => {
      const learned = state.unlockedClasses.includes(id); const active = state.classId === id;
      return `<article class="class-card ${active ? 'active' : ''}"><span class="class-icon" aria-hidden="true">${id === 'swordsman' ? '⚔' : '✧'}</span><h4>${CLASS_NAMES[id]}</h4><p>${id === 'swordsman' ? 'Cận chiến · chém xoáy · trảm nguyệt' : 'Tầm xa · tam nguyệt tiễn · nguyệt bùng nổ'}</p>${active ? '<span class="known-recipe">Class hiện tại</span>' : learned ? `<button class="demo-button small" data-action="class" data-id="${id}" type="button" ${this.inCombat ? 'disabled' : ''}>Đổi Class</button>` : canLearn ? `<button class="demo-button small" data-action="learnClass" data-id="${id}" type="button">Học ${CLASS_NAMES[id]}</button>` : '<span class="unknown-recipe">Chưa học</span>'}</article>`;
    }).join('')}</div>${canLearn && (!state.progress.craftedEquipment || state.progress.oreMined < BALANCE.workOreGoal) ? `<p class="panel-note">Điều kiện học Class: tự khai thác ${BALANCE.workOreGoal} quặng (${state.progress.oreMined}/${BALANCE.workOreGoal}) và tự chế tạo một vũ khí tại Thợ Rèn (${state.progress.craftedEquipment ? 'đã xong' : 'chưa xong'}).</p>` : ''}</div>`;
  }

  private npc(role: NPCRole, state: GameState): string {
    const dialogue: Record<NPCRole, string> = {
      elder: state.progress.demoCompleted ? 'Ánh trăng đã dịu lại. Cảm ơn con. Những con đường vẫn mở; hãy sống cuộc đời mà con lựa chọn.' : state.progress.bossDefeated ? 'Con đã trở về! Hãy kể lại điều đã xảy ra bên dưới di tích và nhận phần thưởng của thị trấn.' : state.quests.boss === 'active' || state.quests.seal === 'done' ? 'Phong ấn đã yên, nhưng nguồn bóng tối vẫn còn. Cửa hầm mộ ở đông bắc Rừng Vọng Nguyệt đã mở. Chuẩn bị thuốc, tìm Người Canh Tàn Nguyệt, rồi trở về đây kể lại chuyến đi.' : state.quests.seal === 'ready' ? 'Ta cảm nhận vết nứt đã khép. Hãy nộp nhiệm vụ để nhận thưởng, rồi nhận lời điều tra hầm mộ.' : state.quests.seal === 'active' ? state.progress.sealBroken ? 'Ba linh thể đã thoát từ phong ấn. Hạ đủ cả ba, rồi bấm E tại phong ấn lần nữa để khép vết nứt. Khi khu rừng yên trở lại, hãy về đây nộp nhiệm vụ.' : 'Trong Rừng Vọng Nguyệt, phong ấn nằm gần giữa rừng. Hãy tới điều tra bằng E, giải quyết điều xảy ra rồi trở về đây. Bia dịch chuyển ở phía tây sẽ giúp con quay lại sau khi tự đến đó.' : state.quests.work === 'done' ? 'Con đã biết tự làm nghề. Học một Class tại Sư phụ Dạ trước khi vào rừng, rồi nhận nhiệm vụ điều tra phong ấn của ta.' : state.quests.work === 'ready' ? 'Ba quặng đã đào và vũ khí do chính tay con rèn là khởi đầu tốt. Nộp nhiệm vụ để nhận thưởng, rồi học Class tại Sư phụ Dạ và nhận nhiệm vụ kế tiếp.' : 'Lời nguyền không chỉ được phá bằng kiếm. Trước tiên hãy học cách tự nuôi sống mình: ra mỏ phía đông nam, giữ E để đào, rồi mang quặng tới Thợ Rèn.',
      trainer: 'Ta dạy cả Kiếm Sĩ và Pháp Sư. Trước khi học Class, con cần tự đào đủ ba quặng và tự rèn một vũ khí tại Thợ Rèn. Khi đã học, con có thể đổi ngoài giao tranh; đừng quên mang vũ khí phù hợp.',
      forge: 'Quặng lấy ở mỏ phía đông nam thị trấn. Ta trao con công thức cơ bản; con tự tạo trang bị bằng chính nguyên liệu của mình. Chất lượng luôn theo công thức.',
      alchemy: 'Nhặt thảo mộc ven đường bằng E. Một lọ thuốc nhỏ có thể giữ con sống giữa bóng tối. Thuốc HP và MP dùng chung thời gian hồi; hãy chọn đúng lúc.',
      merchant: 'Ta mua và bán theo giá cố định. Ở bản thử này mọi giao dịch đều dùng Đồng; Bạc và Vàng được giữ riêng, chưa có quy đổi.',
    };
    const intro = `<div class="npc-dialogue"><span class="npc-symbol" aria-hidden="true">${({ elder: '☾', trainer: '⚔', forge: '⚒', alchemy: '⚗', merchant: '◈' })[role]}</span><div><p>“${escape(dialogue[role])}”</p>${this.isNight(state) ? '<span class="dialogue-note">Đêm xuống, NPC nghỉ tại nhà nhưng vẫn tiếp chuyện bạn.</span>' : '<span class="dialogue-note">Tới gần và bấm E để mở cuộc trò chuyện.</span>'}</div></div>`;
    if (role === 'elder') return intro + this.quests(state, true);
    if (role === 'trainer') return intro + this.classes(state, true);
    if (role === 'forge' || role === 'alchemy') return intro + this.craft(state, role);
    return intro + this.merchant(state);
  }

  private merchant(state: GameState): string {
    const products = Object.values(ITEMS).filter((item) => item.buy > 0);
    const inventory = [...new Set(state.inventory.map((slot) => slot.itemId))];
    return `<div class="merchant-wallet">Ví của bạn: <strong>${state.coins.copper} Đồng</strong> <span>· Giá cố định / mỗi món</span></div><h3 class="section-title">Mua vật phẩm</h3><div class="trade-list">${products.map((item) => `<article class="trade-row">${this.itemIcon(item)}<div><h4>${escape(item.name)}</h4><p>${escape(item.description)}</p></div><button class="demo-button small" data-action="buy" data-id="${item.id}" type="button">Mua · ${item.buy} Đồng</button></article>`).join('')}</div><h3 class="section-title">Bán từ hành trang</h3><div class="trade-list">${inventory.map((id) => `<article class="trade-row">${this.itemIcon(ITEMS[id])}<div><h4>${escape(ITEMS[id].name)} <small>×${quantity(state, id)}</small></h4><p>${Object.values(state.equipped).includes(id) ? 'Tháo trang bị trước khi bán món cuối cùng.' : 'Bán một món mỗi lần.'}</p></div><button class="demo-button small" data-action="sell" data-id="${id}" type="button">Bán · ${ITEMS[id].sell} Đồng</button></article>`).join('') || '<p class="quiet-note">Hành trang chưa có vật phẩm để bán.</p>'}</div>`;
  }

  private map(state: GameState): string {
    return `<div class="map-layout"><div class="map-canvas-wrap"><canvas id="discovery-map" width="560" height="350" aria-label="Bản đồ vùng hiện tại; phần tối chưa được khám phá"></canvas><div class="map-legend"><span><i class="legend-player"></i> Bạn</span><span><i class="legend-explored"></i> Đã khám phá</span><span><i class="legend-fog"></i> Chưa tới</span></div></div><div class="map-guide"><span class="demo-eyebrow">${escape(ZONES[state.world.zone].name)}</span><h3>Lần đầu, hãy tự bước đi.</h3><p>Điểm dịch chuyển chỉ mở sau khi bạn tự đến bia đá trong rừng. Sương mù mở theo những nơi đã đi qua và được giữ trong bản lưu.</p><ul><li>Thị trấn: Trưởng làng tại quảng trường; mỏ quặng phía đông nam.</li><li>Rừng: bia đá ở phía tây; phong ấn giữa rừng; cửa hầm ngục ở phía đông bắc.</li><li>Hầm ngục: mở sau khi xử lý sự kiện phong ấn; vượt các phòng tới Boss.</li></ul><div class="travel-card"><strong>${state.world.travelUnlocked ? '✧ Bia dịch chuyển đã mở' : '◇ Bia dịch chuyển chưa mở'}</strong><p>${state.world.travelUnlocked ? 'Dịch chuyển giữa thị trấn và bia đá trong rừng. Chỉ dùng ngoài giao tranh, không dùng trong hầm ngục.' : 'Tự đi tới gần bia đá trong rừng để mở khóa.'}</p>${state.world.travelUnlocked ? `<button class="demo-button small" data-action="travel" type="button" ${this.inCombat || state.world.zone === 'dungeon' ? 'disabled' : ''}>${state.world.zone === 'forest' ? 'Về thị trấn Tro Tàn' : 'Tới bia đá Rừng Vọng Nguyệt'}</button>` : ''}</div><p class="quiet-note">Đã đến: ${state.world.visited.map((id) => ZONES[id].name).join(' · ')}</p></div></div>`;
  }

  private drawMap(state: GameState): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('#discovery-map'); const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const zone = ZONES[state.world.zone];
    const discovered = state.world.discovered[state.world.zone];
    const keys = discovered.map((key) => key.split(',').map(Number));
    const cols = Math.ceil(zone.width / 32);
    const rows = Math.ceil(zone.height / 32);
    const scale = Math.min((canvas.width - 32) / cols, (canvas.height - 32) / rows);
    const offsetX = (canvas.width - cols * scale) / 2; const offsetY = (canvas.height - rows * scale) / 2;
    context.fillStyle = '#0d1717'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#132120'; context.fillRect(offsetX, offsetY, cols * scale, rows * scale);
    context.save();
    context.beginPath();
    for (const [col, row] of keys) context.rect(offsetX + col * scale, offsetY + row * scale, Math.ceil(scale), Math.ceil(scale));
    context.clip();
    context.fillStyle = state.world.zone === 'dungeon' ? '#4d4a4f' : state.world.zone === 'forest' ? '#345a44' : '#566751';
    context.fillRect(offsetX, offsetY, cols * scale, rows * scale);
    context.fillStyle = state.world.zone === 'dungeon' ? '#777264' : '#9c8c65';
    for (const path of zone.paths) context.fillRect(offsetX + path.x / 32 * scale, offsetY + path.y / 32 * scale, path.width / 32 * scale, path.height / 32 * scale);
    context.fillStyle = state.world.zone === 'dungeon' ? '#2b292e' : '#263e2c';
    for (const obstacle of zone.obstacles) context.fillRect(offsetX + obstacle.x / 32 * scale, offsetY + obstacle.y / 32 * scale, obstacle.width / 32 * scale, obstacle.height / 32 * scale);
    for (const object of zone.objects) {
      if (object.kind === 'secret') continue;
      const x = this.isNight(state) ? object.nightX ?? object.x : object.x;
      const y = this.isNight(state) ? object.nightY ?? object.y : object.y;
      context.fillStyle = object.kind === 'travel' ? '#8fbeb3' : object.kind === 'npc' ? '#d0b686' : object.kind === 'ore' ? '#b29fb9' : '#bfd0a0';
      context.fillRect(offsetX + x / 32 * scale - 2, offsetY + y / 32 * scale - 2, 4, 4);
    }
    context.restore();
    context.strokeStyle = '#b5a47418'; context.lineWidth = 1;
    for (let x = 0; x <= cols; x++) { context.beginPath(); context.moveTo(offsetX + x * scale, offsetY); context.lineTo(offsetX + x * scale, offsetY + rows * scale); context.stroke(); }
    for (let y = 0; y <= rows; y++) { context.beginPath(); context.moveTo(offsetX, offsetY + y * scale); context.lineTo(offsetX + cols * scale, offsetY + y * scale); context.stroke(); }
    const px = offsetX + state.world.x / 32 * scale; const py = offsetY + state.world.y / 32 * scale;
    context.fillStyle = '#e9ce8a'; context.beginPath(); context.arc(px, py, 5, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#f4e4bf'; context.lineWidth = 1; context.beginPath(); context.arc(px, py, 9, 0, Math.PI * 2); context.stroke();
  }

  private help(): string {
    return `<div class="help-layout">
      <section><h3>Điều khiển</h3><dl class="controls-list"><div><dt><kbd>WASD</kbd> / phím mũi tên</dt><dd>Di chuyển</dd></div><div><dt><kbd>Space</kbd> / chuột trái trên vùng chơi</dt><dd>Đánh thường theo hướng nhìn / hướng trỏ; giữ để đánh liên tục theo hồi chiêu</dd></div><div><dt><kbd>Shift</kbd></dt><dd>Né / lướt theo hướng di chuyển</dd></div><div><dt><kbd>1</kbd> <kbd>2</kbd></dt><dd>Kỹ năng Class đã học; cần MP và hết hồi chiêu</dd></div><div><dt><kbd>E</kbd></dt><dd>Tương tác NPC, cửa, vật thể; giữ cạnh mỏ để khai thác quặng</dd></div><div><dt><kbd>Q</kbd> <kbd>R</kbd></dt><dd>Thuốc HP / MP, dùng chung hồi chiêu</dd></div><div><dt><kbd>I</kbd> <kbd>J</kbd> <kbd>C</kbd> <kbd>M</kbd></dt><dd>Hành trang / nhiệm vụ / chế tạo / bản đồ</dd></div><div><dt><kbd>H</kbd></dt><dd>Mở mục Hướng dẫn này</dd></div><div><dt><kbd>Esc</kbd></dt><dd>Đóng bảng hoặc tạm dừng / tiếp tục</dd></div></dl><p class="panel-note">Đứng gần vật thể để thấy lời nhắc tương tác. Thế giới tạm dừng khi mở bảng hoặc rời cửa sổ. Trong Cài đặt, bạn có thể chỉnh âm lượng, rung, số sát thương và mở toàn màn hình.</p></section>
      <section><h3>Hành trình đầu tiên</h3><ol class="first-journey"><li>Gặp Trưởng làng An phía bắc quảng trường, bấm E và nhận <strong>Từ đôi bàn tay</strong>.</li><li>Tới mỏ phía đông nam thị trấn, giữ E cạnh mỏ để tự đào đủ ba quặng.</li><li>Gặp Thợ rèn Lâm phía tây nam, học công thức và tự rèn kiếm hoặc trượng. Trở lại Trưởng làng nộp nhiệm vụ nghề.</li><li>Gặp Sư phụ Dạ phía tây quảng trường để học Kiếm Sĩ hoặc Pháp Sư; mở Hành trang kiểm tra vũ khí đúng Class. Nhận <strong>Vết nứt dưới trăng</strong> tại Trưởng làng.</li><li>Qua cửa phía đông thị trấn vào rừng, bấm E ở phong ấn giữa rừng. Hạ cả ba quái sự kiện, rồi <strong>bấm E vào phong ấn lần nữa để khép vết nứt</strong>.</li><li>Về Trưởng làng nộp nhiệm vụ phong ấn và nhận nhiệm vụ Boss. Chuẩn bị thuốc, qua cửa đông bắc rừng để vào hầm mộ.</li><li>Vượt các phòng và hạ Boss hai giai đoạn. Né vùng cảnh báo và đạn tỏa; dùng thuốc khi cần.</li><li><strong>Trở về thị trấn nộp nhiệm vụ Boss</strong> tại Trưởng làng để kết thúc nội dung demo. Sau đó vẫn tự do làm nghề, khám phá và chơi lại hầm ngục.</li></ol><p class="panel-note">Khi chết, bạn hồi sinh đầy HP/MP tại checkpoint, giữ đồ, tiền, cấp và nhiệm vụ. NPC nghỉ ở phía nam thị trấn vào ban đêm nhưng vẫn tiếp chuyện; bản đồ phản ánh vị trí của họ.</p></section>
      <section class="help-save"><h3>Lưu game và giữ một bản riêng</h3><p>Bấm <strong>Lưu game</strong> ngoài giao tranh và chờ thông báo thành công trước khi rời. Menu <strong>Lưu và về màn hình đầu</strong> chỉ rời phiên sau khi lưu được. Lần sau mở đúng trình duyệt, hồ sơ và địa chỉ, chọn <strong>Tiếp tục hành trình</strong>.</p><p>Game có một ô lưu đang dùng. Tạo nhân vật mới chưa thay bản cũ; lưu thủ công nhân vật mới sẽ thay bản lưu hợp lệ cũ. Nhân vật mới chưa lưu không tự ghi đè khi đóng hoặc tải lại trang. Lưu tự động lúc rời trang chỉ được thử cho phiên Tiếp tục hoặc sau lần lưu thủ công thành công, và khi trạng thái chơi an toàn.</p><p>Bản lưu thuộc trình duyệt và địa chỉ hiện tại. Cổng 5173, 4173 và hostname localhost có vùng lưu riêng. Không xóa dữ liệu trình duyệt nếu muốn giữ tiến độ; không có đồng bộ tài khoản.</p><p>Trong <strong>Bản lưu & sao lưu</strong>, <strong>Tải bản lưu JSON</strong> xuất ô đã ghi, không chứa thay đổi chưa lưu của phiên hiện tại. Chọn file JSON tối đa 200 KB để xem trước; dữ liệu chỉ được thay sau khi bạn bấm <strong>Khôi phục bản lưu này</strong> và file hợp lệ.</p><p>Trước khi khôi phục thay một ô lưu đang có, game giữ nguyên nội dung cũ trong bản dự phòng local riêng, kể cả dữ liệu lỗi. Nếu không tạo được bản dự phòng thì không thay ô lưu. Danh sách <strong>Bản lưu dự phòng</strong> cho xem trước hoặc tải từng bản; khôi phục một mốc vẫn giữ các mốc cũ. Hãy tải file JSON riêng để giữ lâu dài; bản dự phòng trình duyệt cũng mất khi xóa dữ liệu trình duyệt.</p><p class="panel-note">Cài đặt âm thanh/hiệu ứng được giữ riêng, không nằm trong file nhân vật. Snapshot source trong .local-backups chỉ sao lưu code và tài liệu, không chứa tiến độ chơi ở trình duyệt.</p></section>
    </div>`;
  }

  private isNight(state: GameState): boolean { return state.world.elapsedSeconds % BALANCE.daySeconds >= BALANCE.daySeconds * 0.65; }

  private result(result: ActionResult): void { this.toast(result.message, result.ok ? 'success' : 'danger'); }

  private find<T extends HTMLElement = HTMLElement>(id: string): T {
    const node = this.root.querySelector<HTMLElement>(`#${id}`);
    if (!node) throw new Error(`Thiếu thành phần giao diện ${id}`);
    return node as T;
  }

  private setText(id: string, value: string): void {
    const node = this.hud.get(id);
    if (node && node.textContent !== value) node.textContent = value;
  }

  private setHTML(id: string, value: string): void {
    const cached = this.hud.get(id);
    const node = cached?.isConnected ? cached : this.root.querySelector<HTMLElement>(`#${id}`);
    if (node && node.dataset.html !== value) { node.innerHTML = value; node.dataset.html = value; }
  }

  private setStyle(id: string, property: 'width', value: string): void {
    const node = this.hud.get(id);
    if (node && node.style[property] !== value) node.style[property] = value;
  }
}
